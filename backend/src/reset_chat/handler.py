import json

from message_history import get_message_history


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
