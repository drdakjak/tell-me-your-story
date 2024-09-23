import os
import json

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage
from langchain_core.runnables import ConfigurableFieldSpec

from dotenv import load_dotenv

from prompt import INIT_PROMPT
from config import MODEL_NAME
from clients import get_user_table


load_dotenv()

SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]

user_table = get_user_table()


def get_message_history(user_id: str, session_id: str):
    key = {
        "UserId": user_id,
        "SessionId": session_id,
    }
    message_history = DynamoDBChatMessageHistory(
        table_name=SESSION_TABLE, session_id=str(user_id), key=key
    )
    return message_history


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
        original_resume = response["Item"]["original_resume"]

        @tool
        def get_resume() -> str:
            """
            Returns the whole resume provided by user.
            """
            return original_resume

        llm = ChatOpenAI(
            model=MODEL_NAME,
            api_key=os.environ["OPENAI_API_KEY"],
            temperature=0.0000001,
        )

        tools = [get_resume]
        llm_with_tools = llm.bind_tools(tools)

        parser = JsonOutputParser()

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

        chain = prompt | llm_with_tools
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

        config = {"configurable": {"session_id": conversation_id, "user_id": user_id}}
        response = chain_with_chat_history.invoke(
            {
                "user_message": user_message,
            },
            config=config,
        )

        if response.tool_calls:
            for tool_call in response.tool_calls:
                selected_tool = eval(tool_call["name"].lower())
                tool_msg = selected_tool.invoke(tool_call)
                history = get_message_history(user_id=user_id, session_id=conversation_id)
                history.add_message(tool_msg)
            system_prompt = INIT_PROMPT.format(
                original_section=original_section,
                tailored_section=tailored_section,
                job_requirements=job_requirements,
            )
            messages = [SystemMessage(content=system_prompt), *history.messages]
            response = llm_with_tools.invoke(messages)
            history.add_message(response)

        parsed_response = parser.parse(response.content)
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
        return {
            "statusCode": 500,
            "body": json.dumps(e.__repr__()),
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
        }
