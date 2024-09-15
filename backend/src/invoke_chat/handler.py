import os
import json
import logging

from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from langchain_core.messages import SystemMessage
from langchain_core.messages.base import messages_to_dict
from dotenv import load_dotenv
from prompt import INIT_PROMPT
from clients import get_user_table

logger = logging.getLogger()
logger.setLevel(logging.INFO)

load_dotenv()

user_table = get_user_table()
SESSION_TABLE = os.environ["SESSIONTABLE_TABLE_NAME"]


def get_message_history(conversation_id: str):
    message_history = DynamoDBChatMessageHistory(
        table_name=SESSION_TABLE, session_id=str(conversation_id)
    )
    return message_history


def init_message_history(message_history, original_section, job_requirements):
    system_prompt = INIT_PROMPT.format(
        original_section=original_section,
        job_requirements=job_requirements,
    )
    system_message = SystemMessage(content=system_prompt)
    message_history.add_message(system_message)


def filter_messages(messages):
    return [msg for msg in messages if msg.type in {"human", "ai"}]


def format_messages(messages):
    return [{"type": msg.type, "content": msg.content} for msg in messages]


def handler(event, context):
    try:
        body = json.loads(event["body"])

        conversation_id = body["conversationId"]
        original_section = body["originalSection"]

        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        response = user_table.get_item(Key={"id": user_id})
        job_requirements = response["Item"]["job_requirements"]

        message_history = get_message_history(conversation_id)
        if len(message_history.messages) == 0:
            init_message_history(message_history, original_section, job_requirements)

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
