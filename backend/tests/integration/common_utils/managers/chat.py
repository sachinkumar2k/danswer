import json

import requests

from danswer.one_shot_answer.models import DirectQARequest
from danswer.one_shot_answer.models import ThreadMessage
from danswer.server.query_and_chat.models import ChatSessionCreationRequest
from danswer.server.query_and_chat.models import CreateChatMessageRequest
from tests.integration.common_utils.constants import API_SERVER_URL
from tests.integration.common_utils.constants import GENERAL_HEADERS
from tests.integration.common_utils.test_models import StreamedResponse
from tests.integration.common_utils.test_models import TestChatMessage
from tests.integration.common_utils.test_models import TestChatSession
from tests.integration.common_utils.test_models import TestUser
from tests.integration.tests.streaming_endpoints.utils import analyze_response


class ChatSessionManager:
    @staticmethod
    def create_chat_session(
        persona_id: int = -1,
        description: str = "Test chat session",
        user_performing_action: TestUser | None = None,
    ) -> TestChatSession:
        chat_session_creation_req = ChatSessionCreationRequest(
            persona_id=persona_id, description=description
        )
        response = requests.post(
            f"{API_SERVER_URL}/chat/create-chat-session",
            json=chat_session_creation_req.model_dump(),
            headers=user_performing_action.headers
            if user_performing_action
            else GENERAL_HEADERS,
        )
        response.raise_for_status()
        chat_session_id = response.json()["chat_session_id"]
        return TestChatSession(
            id=chat_session_id, persona_id=persona_id, description=description
        )

    @staticmethod
    def send_message(
        chat_session_id: id,
        message: str,
        parent_message_id: str | None = None,
        user_performing_action: TestUser | None = None,
        file_descriptors: list = None,
        prompt_id: int = 0,
        search_doc_ids: list = None,
        retrieval_options: dict = None,
        query_override: str = None,
        regenerate: bool = None,
        llm_override: str = None,
        prompt_override: str = None,
        alternate_assistant_id: int = None,
        use_existing_user_message: bool = False,
    ) -> StreamedResponse:
        chat_message_req = CreateChatMessageRequest(
            chat_session_id=chat_session_id,
            parent_message_id=parent_message_id,
            message=message,
            file_descriptors=file_descriptors or [],
            prompt_id=prompt_id,
            search_doc_ids=search_doc_ids or [],
            retrieval_options=retrieval_options,
            query_override=query_override,
            regenerate=regenerate,
            llm_override=llm_override,
            prompt_override=prompt_override,
            alternate_assistant_id=alternate_assistant_id,
            use_existing_user_message=use_existing_user_message,
        )

        response = requests.post(
            f"{API_SERVER_URL}/chat/send-message",
            json=chat_message_req.model_dump(),
            headers=user_performing_action.headers
            if user_performing_action
            else GENERAL_HEADERS,
            stream=True,
        )
        response.raise_for_status()

        # Process the streamed response
        response_data = []

        for line in response.iter_lines():
            if line:
                data = json.loads(line.decode("utf-8"))
                response_data.append(data)

        return analyze_response(response_data)

    @staticmethod
    def get_answer_with_quote(
        persona_id: int,
        message: str,
        user_performing_action: TestUser | None = None,
    ) -> StreamedResponse:
        direct_qa_request = DirectQARequest(
            messages=[ThreadMessage(message=message)],
            prompt_id=None,
            persona_id=persona_id,
        )

        response = requests.post(
            f"{API_SERVER_URL}/query/stream-answer-with-quote",
            json=direct_qa_request.model_dump(),
            headers=user_performing_action.headers
            if user_performing_action
            else GENERAL_HEADERS,
            stream=True,
        )
        response.raise_for_status()

        # Process the streamed response
        response_data = []

        for line in response.iter_lines():
            if line:
                data = json.loads(line.decode("utf-8"))
                response_data.append(data)
        print(response_data)
        return analyze_response(response_data)

    @staticmethod
    def get_chat_history(
        chat_session: TestChatSession,
        user_performing_action: TestUser | None = None,
    ) -> list[TestChatMessage]:
        response = requests.get(
            f"{API_SERVER_URL}/chat/history/{chat_session.id}",
            headers=user_performing_action.headers
            if user_performing_action
            else GENERAL_HEADERS,
        )
        response.raise_for_status()

        return [
            TestChatMessage(
                id=msg["id"],
                chat_session_id=chat_session.id,
                parent_message_id=msg.get("parent_message_id"),
                message=msg["message"],
                response=msg.get("response", ""),
            )
            for msg in response.json()
        ]
