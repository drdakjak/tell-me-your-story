import os

from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from dotenv import load_dotenv

load_dotenv()

def get_message_history(user_id: str, session_id: str):
    key = {
        "UserId": user_id,
        "SessionId": session_id,
    }
    message_history = DynamoDBChatMessageHistory(
        table_name=os.environ["SESSIONTABLE_TABLE_NAME"], session_id=str(user_id), key=key
    )
    return message_history