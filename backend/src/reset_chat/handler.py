import os
import json

from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from dotenv import load_dotenv

load_dotenv()

SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]


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
        
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        conversation_id = body["conversationId"]
        _ = get_message_history(user_id=user_id, session_id=conversation_id).clear()

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps("Chat history reset successfully."),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps(e.__repr__()),
        }
