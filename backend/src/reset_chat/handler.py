import json

from aws_lambda_powertools import Logger

from message_history import get_message_history
from common_config import LOGGING_LEVEL

logger = Logger(level=LOGGING_LEVEL)

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        body = json.loads(event["body"])
        
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        conversation_id = body["conversationId"]
        _ = get_message_history(user_id=user_id, session_id=conversation_id).clear()

        logger.info({'user_id': user_id, 'content': f"Resetting chat history for user conversation_id {conversation_id}"})

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
        logger.error("An error occurred", exc_info=e)
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps({"error": str(e)})
        }
