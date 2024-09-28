import json

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage
from langchain_core.runnables import ConfigurableFieldSpec
from aws_lambda_powertools import Logger


from clients import get_user_table, get_model
from message_history import get_message_history
from common_config import LOGGING_LEVEL
from prompt import INIT_PROMPT
from config import MODEL_NAME

logger = Logger(level=LOGGING_LEVEL)
user_table = get_user_table()


def init_chain_prompt(original_section, tailored_section, job_requirements):
    prompt = ChatPromptTemplate(
        messages=[
            ("system", INIT_PROMPT),
            MessagesPlaceholder(variable_name="history"),
            ("user", "{user_message}"),
        ],
    ).partial(
        original_section=original_section,
        tailored_section=tailored_section,
        job_requirements=job_requirements,
    )
    return prompt


def init_chain_history(chain):
    chain_with_chat_history = RunnableWithMessageHistory(
        chain,
        get_message_history,
        input_messages_key="user_message",
        history_messages_key="history",
        history_factory_config=[
            ConfigurableFieldSpec(
                id="user_id",
                annotation=str,
                name="User ID",
                description="Unique identifier for the user.",
                default="",
                is_shared=True,
            ),
            ConfigurableFieldSpec(
                id="session_id",
                annotation=str,
                name="Conversation ID",
                description="Unique identifier for the conversation.",
                default="",
                is_shared=True,
            ),
        ],
    )
    return chain_with_chat_history


def get_config(user_id, conversation_id):
    return {"configurable": {"session_id": conversation_id, "user_id": user_id}}


def init_system_prompt(original_section, tailored_section, job_requirements):
    system_prompt = INIT_PROMPT.format(
        original_section=original_section,
        tailored_section=tailored_section,
        job_requirements=job_requirements,
    )
    return system_prompt


def invoke_chain(chain_with_chat_history, user_message, config):
    response = chain_with_chat_history.invoke(
        {
            "user_message": user_message,
        },
        config=config,
    )
    return response


def process_tool_call(response, user_id, conversation_id, system_prompt, model):
    for tool_call in response.tool_calls:
        selected_tool = eval(tool_call["name"].lower())
        tool_msg = selected_tool.invoke(tool_call)
        history = get_message_history(user_id=user_id, session_id=conversation_id)
        history.add_message(tool_msg)

    messages = [SystemMessage(content=system_prompt), *history.messages]
    response = model.invoke(messages)
    history.add_message(response)

    return response


@tool
def get_resume() -> str:
    """
    Returns the whole resume provided by user.
    """
    global original_resume
    return original_resume


# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        body = json.loads(event["body"])
        conversation_id = body["conversationId"]
        tailored_section = body["tailoredSection"]
        original_section = body["originalSection"]
        user_message = body["message"]

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        response = user_table.get_item(Key={"id": user_id})
        job_requirements = response["Item"]["job_requirements"]

        global original_resume
        original_resume = response["Item"]["original_resume"]

        logger.info(
            {"user_id": user_id, "content": f"Invoking chat for user {user_id}"}
        )
        tools = [get_resume]

        model = get_model(MODEL_NAME)
        model_with_tools = model.bind_tools(tools)

        chain_prompt = init_chain_prompt(
            original_section, tailored_section, job_requirements
        )
        chain = chain_prompt | model_with_tools

        chain_with_chat_history = init_chain_history(chain)

        config = get_config(user_id, conversation_id)
        response = invoke_chain(chain_with_chat_history, user_message, config)

        if response.tool_calls:
            system_prompt = init_system_prompt(
                original_section, tailored_section, job_requirements
            )
            response = process_tool_call(
                response, user_id, conversation_id, system_prompt, model_with_tools
            )

        parsed_response = JsonOutputParser().parse(response.content)
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps(parsed_response),
        }
    except Exception as e:
        logger.error("An error occurred", exc_info=e)
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
