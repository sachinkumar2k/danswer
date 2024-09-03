from tests.integration.common_utils.llm import LLMProviderManager
from tests.integration.common_utils.managers.chat import ChatSessionManager
from tests.integration.common_utils.managers.user import UserManager
from tests.integration.common_utils.test_models import TestUser


def test_send_message_simple_with_history(reset: None) -> None:
    admin_user: TestUser = UserManager.create(name="admin_user")
    LLMProviderManager.create(user_performing_action=admin_user)

    test_chat_session = ChatSessionManager.create_chat_session(
        user_performing_action=admin_user
    )

    response = ChatSessionManager.get_answer_with_quote(
        persona_id=test_chat_session.persona_id,
        message="Hello, this is a test.",
        user_performing_action=admin_user,
    )

    assert (
        response.tool_name is not None
    ), "Tool name should be specified (always search)"
    assert (
        response.relevance_summaries is not None
    ), "Relevance summaries should be present for all search streams"
    assert len(response.full_message) > 0, "Response message should not be empty"
