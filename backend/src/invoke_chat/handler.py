import os
import json
import logging

from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from dotenv import load_dotenv

logger = logging.getLogger()
logger.setLevel(logging.INFO)

load_dotenv()

SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]

AI_MESSAGE = """
Hi! 

I'm here to help you tailor this section. I have access to the:

- hiring criteria, 
- original section, 
- current tailored section, 
- the whole resume.

How can I help you?
"""


def format_ai_message(message):
    return json.dumps({"text": message, "tailored_section": ""})


def get_message_history(user_id: str, session_id: str):
    key = {
        "UserId": user_id,
        "SessionId": session_id,
    }
    message_history = DynamoDBChatMessageHistory(
        table_name=SESSION_TABLE, session_id=str(user_id), key=key
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
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        message_history = get_message_history(
            user_id=user_id, session_id=conversation_id
        )
        if len(message_history.messages) == 0:
            message_history.add_ai_message(format_ai_message(AI_MESSAGE))
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
