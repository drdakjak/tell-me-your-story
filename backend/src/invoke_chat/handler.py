import json
from aws_lambda_powertools import Logger

from message_history import get_message_history
from common_config import LOGGING_LEVEL

logger = Logger(level=LOGGING_LEVEL)


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


def filter_messages(messages):
    return [msg for msg in messages if msg.type in {"human", "ai"}]


def format_messages(messages):
    return [{"type": msg.type, "content": msg.content} for msg in messages]

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    """
    AWS Lambda handler function to process incoming events, retrieve chat history, filter and format messages, and return them in the response.

    Args:
        event (dict): The event dictionary containing the request data.
        context (object): The context object providing information about the invocation, function, and execution environment.

    Returns:
        dict: A dictionary containing the HTTP status code, headers, and body with the formatted messages or an error message.
    """
    try:
        body = json.loads(event["body"])

        conversation_id = body["conversationId"]
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        
        logger.info({'user_id': user_id, 'content': f'Loading chat history for conversation_id {conversation_id}'})
        
        message_history = get_message_history(
            user_id=user_id, session_id=conversation_id
        )

        # If no messages are found, add a default AI message to the history
        if len(message_history.messages) == 0:
            message_history.add_ai_message(format_ai_message(AI_MESSAGE))

        # Filter the messages to include only human and AI messages
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
