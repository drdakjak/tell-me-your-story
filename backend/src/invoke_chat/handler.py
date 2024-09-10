import os
import json
import logging

from langchain_community.chat_message_histories import DynamoDBChatMessageHistory
from langchain_core.messages.system import SystemMessage
from langchain_core.messages.base import messages_to_dict
from dotenv import load_dotenv

from prompt import INIT_PROMPT

logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
        message_history = get_message_history(conversation_id)

        if len(message_history.messages) == 0:
            logger.info("Initializing chat history.")
            message_history.add_message(SystemMessage(content=INIT_PROMPT))

        return {
            'statusCode': 200,
            'body': json.dumps(messages_to_dict(message_history.messages))
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(e.__repr__())
        }