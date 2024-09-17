import os
import json
import logging

from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from dotenv import load_dotenv

logger = logging.getLogger()
logger.setLevel(logging.INFO)

load_dotenv()

SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]


def get_message_history(conversation_id: str):
    message_history = DynamoDBChatMessageHistory(
        table_name=SESSION_TABLE, session_id=str(conversation_id)
    )
    return message_history


def filter_messages(messages):
    return [msg for msg in messages if msg.type in {"human", "ai"}]


def format_messages(messages):
    return [{"type": msg.type, "content": msg.content} for msg in messages]


def handler(event, context):
    try:
        body = json.loads(event["body"])

        conversation_id = body["conversationId"]
    
        message_history = get_message_history(conversation_id)
        filtered_messages = filter_messages(message_history.messages)
        formated_filtered_messages = format_messages(filtered_messages)
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps(formated_filtered_messages),
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
