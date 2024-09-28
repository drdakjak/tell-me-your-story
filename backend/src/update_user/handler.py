import json

from aws_lambda_powertools import Logger

from clients import get_user_table
from common_config import LOGGING_LEVEL

logger = Logger(level=LOGGING_LEVEL)
user_table = get_user_table()


def update_user_data(user_id, key, data):
    user_table.update_item(
        Key={"id": user_id},
        UpdateExpression=f"SET {key} = :{key}",
        ExpressionAttributeValues={f":{key}": data},
    )


# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        body = json.loads(event["body"])

        logger.info({"user_id": user_id, "data": body})

        job_post = body["jobPost"]
        update_user_data(user_id, "job_post", job_post)

        analyzed_job_post = body["analyzedJobPost"]
        update_user_data(user_id, "job_requirements", analyzed_job_post)

        original_resume = body["originalResume"]
        update_user_data(user_id, "original_resume", original_resume)

        original_sections = body["originalSections"]
        update_user_data(user_id, "semantic_sections", original_sections)

        tailored_sections = body["tailoredSections"]
        update_user_data(user_id, "tailored_sections", tailored_sections)

        tailored_resume = body["tailoredResume"]
        update_user_data(user_id, "tailored_resume", tailored_resume)

        return {
            "statusCode": 200,
            "body": json.dumps("User data updated successfully"),
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
