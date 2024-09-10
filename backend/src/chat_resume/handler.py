import os 
import json

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from langchain_openai import ChatOpenAI
from langchain_core.messages.base import message_to_dict
from dotenv import load_dotenv

from config import MODEL_NAME

load_dotenv()


model = ChatOpenAI(model=MODEL_NAME, api_key=os.environ["OPENAI_API_KEY"])

SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]


def get_message_history(conversation_id: str):
    message_history = DynamoDBChatMessageHistory(
        table_name=SESSION_TABLE, session_id=str(conversation_id)
    )
    return message_history


def handler(event, context):
    try:
        conversation_id = event["body"]["conversation_id"]
        user_message = event["body"]["message"]

        prompt = ChatPromptTemplate.from_messages(
            [
                MessagesPlaceholder(variable_name="history"),
                ("human", "{human_message}"),
            ]
        )

        chain = prompt | ChatOpenAI()

        chain_with_history = RunnableWithMessageHistory(
            chain,
            lambda session_id: DynamoDBChatMessageHistory(
                table_name="SessionTable", session_id=session_id
            ),
            input_messages_key="human_message",
            history_messages_key="history",
        )
        config = {"configurable": {"session_id": conversation_id}}
        
        response = chain_with_history.invoke({"human_message": user_message}, config=config)
        return {
            "statusCode": 200,
            "body": json.dumps(message_to_dict(response))
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(e.__repr__())
        }

