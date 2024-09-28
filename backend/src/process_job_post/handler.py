import json

from aws_lambda_powertools import Logger

from processor import process_job_post 
from clients import get_user_table
from common_config import LOGGING_LEVEL

logger = Logger(level=LOGGING_LEVEL)
user_table = get_user_table()

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        body = json.loads(event["body"])

        job_post = body["jobPost"]
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        logger.info({'user_id': user_id, 'job_post': job_post})


        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET job_post = :job_post",
            ExpressionAttributeValues={":job_post": job_post},
        )
        
        job_requirements = process_job_post(job_post)


        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET job_requirements = :job_requirements",
            ExpressionAttributeValues={":job_requirements": job_requirements},
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps(job_requirements),
            'headers': {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            }
        }
    except Exception as e:
        logger.error("An error occurred", exc_info=e)
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps({"error": str(e)})
        }