import json
from aws_lambda_powertools import Logger

from clients import get_user_table
from common_config import LOGGING_LEVEL

logger = Logger(level=LOGGING_LEVEL)
user_table = get_user_table()

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        logger.info({'user_id': user_id, 'content': f'Loading data for user {user_id}'})

        response = user_table.get_item(Key={"id": user_id})
        user_data = response.get("Item", {})
        
        return {
                "statusCode": 200,
                "body": json.dumps(user_data),
                "headers": {
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                },
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
            "body": json.dumps({"error": str(e)}),

        }
