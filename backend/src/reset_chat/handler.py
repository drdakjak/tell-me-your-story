import os
import json

from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from dotenv import load_dotenv

load_dotenv()

SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]
def get_message_history(conversation_id: str):
    message_history = DynamoDBChatMessageHistory(
        table_name=SESSION_TABLE, session_id=str(conversation_id)
    )
    return message_history

def handler(event, context):
    try:
        conversation_id = event['body']['conversation_id']
        response = get_message_history(conversation_id=conversation_id).clear()

        return {
            'statusCode': 200,
            'body': json.dumps("Chat history reset successfully.")
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(e.__repr__())
        }