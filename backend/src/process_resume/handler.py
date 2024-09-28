import json
import sys

from aws_lambda_powertools import Logger

from clients import get_user_table
from common_config import LOGGING_LEVEL

from processor import resume_parser

logger = Logger(level=LOGGING_LEVEL)
user_table = get_user_table()

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        body = json.loads(event["body"])
        original_resume = body["resume"]
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        logger.info({'user_id': user_id, 'original_resume': original_resume})
        
        semantic_sections = resume_parser(original_resume)

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET original_resume = :original_resume",
            ExpressionAttributeValues={":original_resume": original_resume},
        )

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET semantic_sections = :semantic_sections",
            ExpressionAttributeValues={":semantic_sections": semantic_sections},
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps(semantic_sections),
        }
    except Exception as e:
        logger.error("An error occurred", exc_info=e)
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps({"error": str(e)})
        }
