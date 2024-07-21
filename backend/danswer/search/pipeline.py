import time
from collections import defaultdict
from collections.abc import Callable
from collections.abc import Iterator
from typing import cast

from sqlalchemy.orm import Session

from danswer.chat.models import RelevanceChunk
from danswer.configs.chat_configs import DISABLE_AGENTIC_SEARCH
from danswer.configs.chat_configs import MULTILINGUAL_QUERY_EXPANSION
from danswer.db.embedding_model import get_current_db_embedding_model
from danswer.db.models import User
from danswer.document_index.factory import get_default_document_index
from danswer.llm.answering.models import DocumentPruningConfig
from danswer.llm.answering.models import PromptConfig
from danswer.llm.answering.prune_and_merge import ChunkRange
from danswer.llm.answering.prune_and_merge import merge_chunk_intervals
from danswer.llm.interfaces import LLM
from danswer.search.enums import QueryFlow
from danswer.search.enums import SearchType
from danswer.search.models import IndexFilters
from danswer.search.models import InferenceChunk
from danswer.search.models import InferenceSection
from danswer.search.models import RerankMetricsContainer
from danswer.search.models import RetrievalMetricsContainer
from danswer.search.models import SearchQuery
from danswer.search.models import SearchRequest
from danswer.search.postprocessing.postprocessing import search_postprocessing
from danswer.search.preprocessing.preprocessing import retrieval_preprocessing
from danswer.search.retrieval.search_runner import retrieve_chunks
from danswer.search.utils import inference_section_from_chunks
from danswer.secondary_llm_flows.agentic_evaluation import evaluate_inference_section
from danswer.utils.logger import setup_logger
from danswer.utils.threadpool_concurrency import FunctionCall
from danswer.utils.threadpool_concurrency import run_functions_in_parallel
from danswer.utils.threadpool_concurrency import run_functions_tuples_in_parallel
from danswer.utils.timing import log_function_time

logger = setup_logger()


class SearchPipeline:
    def __init__(
        self,
        search_request: SearchRequest,
        user: User | None,
        llm: LLM,
        fast_llm: LLM,
        db_session: Session,
        bypass_acl: bool = False,  # NOTE: VERY DANGEROUS, USE WITH CAUTION
        retrieval_metrics_callback: (
            Callable[[RetrievalMetricsContainer], None] | None
        ) = None,
        rerank_metrics_callback: Callable[[RerankMetricsContainer], None] | None = None,
        prompt_config: PromptConfig | None = None,
        pruning_config: DocumentPruningConfig | None = None,
    ):
        self.search_request = search_request
        self.user = user
        self.llm = llm
        self.fast_llm = fast_llm
        self.db_session = db_session
        self.bypass_acl = bypass_acl
        self.retrieval_metrics_callback = retrieval_metrics_callback
        self.rerank_metrics_callback = rerank_metrics_callback

        self.embedding_model = get_current_db_embedding_model(db_session)
        self.document_index = get_default_document_index(
            primary_index_name=self.embedding_model.index_name,
            secondary_index_name=None,
        )
        self.prompt_config: PromptConfig | None = prompt_config
        self.pruning_config: DocumentPruningConfig | None = pruning_config

        # Preprocessing steps generate this
        self._search_query: SearchQuery | None = None
        self._predicted_search_type: SearchType | None = None
        self._predicted_flow: QueryFlow | None = None

        # Initial document index retrieval chunks
        self._retrieved_chunks: list[InferenceChunk] | None = None
        # Another call made to the document index to get surrounding sections
        self._retrieved_sections: list[InferenceSection] | None = None
        # Reranking and LLM section selection can be run together
        # If only LLM selection is on, the reranked chunks are yielded immediatly
        self._reranked_sections: list[InferenceSection] | None = None
        self._relevant_section_indices: list[int] | None = None

        # Generates reranked chunks and LLM selections
        self._postprocessing_generator: (
            Iterator[list[InferenceSection] | list[int]] | None
        ) = None

    """Pre-processing"""

    def _run_preprocessing(self) -> None:
        (
            final_search_query,
            predicted_search_type,
            predicted_flow,
        ) = retrieval_preprocessing(
            search_request=self.search_request,
            user=self.user,
            llm=self.llm,
            db_session=self.db_session,
            bypass_acl=self.bypass_acl,
        )
        self._search_query = final_search_query
        self._predicted_search_type = predicted_search_type
        self._predicted_flow = predicted_flow

    @property
    def search_query(self) -> SearchQuery:
        if self._search_query is not None:
            return self._search_query

        self._run_preprocessing()

        return cast(SearchQuery, self._search_query)

    @property
    def predicted_search_type(self) -> SearchType:
        if self._predicted_search_type is not None:
            return self._predicted_search_type

        self._run_preprocessing()
        return cast(SearchType, self._predicted_search_type)

    @property
    def predicted_flow(self) -> QueryFlow:
        if self._predicted_flow is not None:
            return self._predicted_flow

        self._run_preprocessing()
        return cast(QueryFlow, self._predicted_flow)

    """Retrieval and Postprocessing"""

    def _get_chunks(self) -> list[InferenceChunk]:
        """TODO as a future extension:
        If large chunks (above 512 tokens) are used which cannot be directly fed to the LLM,
        This step should run the two retrievals to get all of the base size chunks
        """
        if self._retrieved_chunks is not None:
            return self._retrieved_chunks

        self._retrieved_chunks = retrieve_chunks(
            query=self.search_query,
            document_index=self.document_index,
            db_session=self.db_session,
            hybrid_alpha=self.search_request.hybrid_alpha,
            multilingual_expansion_str=MULTILINGUAL_QUERY_EXPANSION,
            retrieval_metrics_callback=self.retrieval_metrics_callback,
        )

        return cast(list[InferenceChunk], self._retrieved_chunks)

    @log_function_time()
    def _get_sections(self) -> list[InferenceSection]:
        start_time = time.time()
        logger.info("Starting _get_sections function")

        if self._retrieved_sections is not None:
            logger.info("Returning cached retrieved sections")
            return self._retrieved_sections

        retrieved_chunks = self._get_chunks()
        logger.info(
            f"Retrieved {len(retrieved_chunks)} chunks in {time.time() - start_time:.2f} seconds"
        )

        above = self.search_query.chunks_above
        below = self.search_query.chunks_below

        expanded_inference_sections = []

        if self.search_query.full_doc:
            full_doc_start = time.time()
            unique_chunks = []
            list_inference_chunks = []
            seen_document_ids = set()
            # This preserves the ordering since the chunks are retrieved in score order
            for chunk in retrieved_chunks:
                if chunk.document_id not in seen_document_ids:
                    seen_document_ids.add(chunk.document_id)
                    unique_chunks.append(chunk)
                    list_inference_chunks.append([chunk])

                    # NOTE: left in for eventual refactor with Vespa API
                    # functions_with_args.append(
                    #     (
                    #         self.document_index.id_based_retrieval,
                    #         (
                    #             chunk.document_id,
                    #             None,  # Start chunk ind
                    #             None,  # End chunk ind
                    #             # There is no chunk level permissioning, this expansion around chunks
                    #             # can be assumed to be safe
                    #             IndexFilters(access_control_list=None),
                    #         ),
                    #     )
                    # )
            # list_inference_chunks = run_functions_tuples_in_parallel(
            #     functions_with_args, allow_failures=False
            # )

            for ind, chunk in enumerate(unique_chunks):
                inf_chunks = list_inference_chunks[ind]

                inference_section = inference_section_from_chunks(
                    center_chunk=chunk,
                    chunks=inf_chunks,
                )

                if inference_section is not None:
                    expanded_inference_sections.append(inference_section)
                else:
                    logger.warning("Skipped creation of section, no chunks found")

            logger.info(
                f"Processed full_doc in {time.time() - full_doc_start:.2f} seconds"
            )
            self._retrieved_sections = expanded_inference_sections
            logger.info(
                f"Total time for full_doc: {time.time() - start_time:.2f} seconds"
            )
            return expanded_inference_sections

        chunk_mapping_start = time.time()
        doc_chunk_ranges_map = defaultdict(list)
        for chunk in retrieved_chunks:
            doc_chunk_ranges_map[chunk.document_id].append(
                ChunkRange(
                    chunks=[chunk],
                    start=max(0, chunk.chunk_id - above),
                    end=chunk.chunk_id + below,
                )
            )
        logger.info(
            f"Created doc_chunk_ranges_map in {time.time() - chunk_mapping_start:.2f} seconds"
        )

        merging_start = time.time()
        merged_ranges = [
            merge_chunk_intervals(ranges) for ranges in doc_chunk_ranges_map.values()
        ]
        logger.info(f"Merged ranges in {time.time() - merging_start:.2f} seconds")

        flattening_start = time.time()
        flat_ranges = [r for ranges in merged_ranges for r in ranges]
        flattened_inference_chunks = []
        parallel_functions_with_args = []

        for chunk_range in flat_ranges:
            logger.info(f"Chunk has range {chunk_range.start} - {chunk_range.end}")

            if chunk_range.start == chunk_range.end:
                flattened_inference_chunks.append(chunk_range.chunks[0])
            else:
                logger.info("adding to paralel functions")
                parallel_functions_with_args.append(
                    (
                        self.document_index.id_based_retrieval,
                        (
                            chunk_range.chunks[0].document_id,
                            chunk_range.start,
                            chunk_range.end,
                            IndexFilters(access_control_list=None),
                        ),
                    )
                )
        logger.info(
            f"Flattened ranges and prepared parallel functions in {time.time() - flattening_start:.2f} seconds"
        )

        if parallel_functions_with_args:
            parallel_start = time.time()
            list_inference_chunks = run_functions_tuples_in_parallel(
                parallel_functions_with_args, allow_failures=False
            )
            for inference_chunks in list_inference_chunks:
                flattened_inference_chunks.extend(inference_chunks)
            logger.info(
                f"Ran parallel functions in {time.time() - parallel_start:.2f} seconds"
            )

        mapping_start = time.time()
        doc_chunk_ind_to_chunk = {
            (chunk.document_id, chunk.chunk_id): chunk
            for chunk in flattened_inference_chunks
        }
        logger.info(
            f"Created doc_chunk_ind_to_chunk mapping in {time.time() - mapping_start:.2f} seconds"
        )

        building_start = time.time()
        for chunk in retrieved_chunks:
            start_ind = max(0, chunk.chunk_id - above)
            end_ind = chunk.chunk_id + below

            surrounding_chunks_or_none = [
                doc_chunk_ind_to_chunk.get((chunk.document_id, chunk_ind))
                for chunk_ind in range(start_ind, end_ind + 1)
            ]
            surrounding_chunks = [
                chunk for chunk in surrounding_chunks_or_none if chunk is not None
            ]

            inference_section = inference_section_from_chunks(
                center_chunk=chunk,
                chunks=surrounding_chunks,
            )
            if inference_section is not None:
                expanded_inference_sections.append(inference_section)
            else:
                logger.warning("Skipped creation of section, no chunks found")
        logger.info(
            f"Built expanded_inference_sections in {time.time() - building_start:.2f} seconds"
        )

        self._retrieved_sections = expanded_inference_sections
        logger.info(
            f"Total time for _get_sections: {time.time() - start_time:.2f} seconds"
        )
        return expanded_inference_sections

    @property
    def reranked_sections(self) -> list[InferenceSection]:
        """Reranking is always done at the chunk level since section merging could create arbitrarily
        long sections which could be:
        1. Longer than the maximum context limit of even large rerankers
        2. Slow to calculate due to the quadratic scaling laws of Transformers

        See implementation in search_postprocessing for details
        """
        if self._reranked_sections is not None:
            return self._reranked_sections

        self._postprocessing_generator = search_postprocessing(
            search_query=self.search_query,
            retrieved_sections=self._get_sections(),
            llm=self.fast_llm,
            rerank_metrics_callback=self.rerank_metrics_callback,
        )

        self._reranked_sections = cast(
            list[InferenceSection], next(self._postprocessing_generator)
        )

        return self._reranked_sections

    @property
    def relevant_section_indices(self) -> list[int]:
        if self._relevant_section_indices is not None:
            return self._relevant_section_indices

        self._relevant_section_indices = next(
            cast(Iterator[list[int]], self._postprocessing_generator)
        )
        return self._relevant_section_indices

    @property
    def relevance_summaries(self) -> dict[str, RelevanceChunk]:
        if DISABLE_AGENTIC_SEARCH:
            raise ValueError(
                "Agentic saerch operation called while DISABLE_AGENTIC_SEARCH is toggled"
            )
        if len(self.reranked_sections) == 0:
            logger.warning(
                "No sections found in agentic search evalution. Returning empty dict."
            )
            return {}

        sections = self.reranked_sections
        functions = [
            FunctionCall(
                evaluate_inference_section, (section, self.search_query.query, self.llm)
            )
            for section in sections
        ]

        results = run_functions_in_parallel(function_calls=functions)

        return {
            next(iter(value)): value[next(iter(value))] for value in results.values()
        }

    @property
    def section_relevance_list(self) -> list[bool]:
        return [
            True if ind in self.relevant_section_indices else False
            for ind in range(len(self.reranked_sections))
        ]
