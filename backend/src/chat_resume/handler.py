import os
import json
from typing import Union

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import tool
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

from dotenv import load_dotenv
from regex import F
from sqlalchemy import JSON

from config import MODEL_NAME

load_dotenv()

SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]


def get_message_history(conversation_id: str):
    message_history = DynamoDBChatMessageHistory(
        table_name=SESSION_TABLE, session_id=str(conversation_id)
    )
    return message_history

class Response(BaseModel):
    response: str = Field(
        description="The response that will be showed in user's chat.",
    )
    tailored_section: str = Field(
        description="The newly tailored section based on user's requirements. Can be empty string if any update is required."
    )


def handler(event, context):
    # try:

    conversation_id = event["body"]["conversation_id"]
    tailored_section = event["body"]["tailored_section"]
    user_message = event["body"]["message"]

    parser = JsonOutputParser()

    prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="history"),
            ("human", "{user_message}"),
        ]
    )

    @tool
    def get_current_tailored_section() -> str:
        """
        Returns the current tailored section.
        """
        return tailored_section

    llm = ChatOpenAI(
        model=MODEL_NAME, api_key=os.environ["OPENAI_API_KEY"], temperature=0.0000001
    )

    tools = [get_current_tailored_section]
    llm_with_tools = llm.bind_tools(tools)
    chain = prompt | llm_with_tools

    chain_with_chat_history = RunnableWithMessageHistory(
        chain,
        lambda session_id: get_message_history(session_id),
        input_messages_key="user_message",
        history_messages_key="history",
    )

    config = {"configurable": {"session_id": conversation_id}}
    response = chain_with_chat_history.invoke(
        {"user_message": user_message}, config=config
    )

    if response.tool_calls:

        for tool_call in response.tool_calls:
            selected_tool = eval(tool_call["name"].lower())
            tool_msg = selected_tool.invoke(tool_call)
            history = get_message_history(conversation_id)
            history.add_message(tool_msg)

        response = llm_with_tools.invoke(history.messages)
        history.add_message(response)

    return parser.parse(response.content)

    return {"statusCode": 200, "body": json.dumps(response)}
    # except Exception as e:
    #     return {
    #         "statusCode": 500,
    #         "body": json.dumps(e.__repr__())
    #     }
