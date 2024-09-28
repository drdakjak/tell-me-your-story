import json

from aws_lambda_powertools import Logger

from web_url_text_extractor import extract_text_from_url
from job_post_extractor import extract_job_post_text
from common_config import LOGGING_LEVEL

logger = Logger(level=LOGGING_LEVEL)

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        body = json.loads(event["body"])
        url = body["url"]

        logger.info({'user_id': user_id, 'url': url, 'content': f'Processing url: {url}'})

        extracted_text = extract_text_from_url(url)
        job_post = extract_job_post_text(extracted_text)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps(job_post),
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
            "body": json.dumps(str(e)),
        }
