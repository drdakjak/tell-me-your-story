import json

from aws_lambda_powertools import Logger

from clients import get_user_table
from common_config import LOGGING_LEVEL

logger = Logger(level=LOGGING_LEVEL)
user_table = get_user_table()


def update_section(modified_section, tailored_sections):
    return [
        (
            modified_section
            if section["section_id"] == modified_section["section_id"]
            else section
        )
        for section in tailored_sections
    ]


# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        modified_section = json.loads(event["body"])

        logger.info({"user_id": user_id, "modified_section": modified_section})

        response = user_table.get_item(Key={"id": user_id})
        tailored_sections = response["Item"]["tailored_sections"]

        updated_sections = update_section(modified_section, tailored_sections)

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET tailored_sections = :tailored_sections",
            ExpressionAttributeValues={":tailored_sections": updated_sections},
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps("Section successfully updated"),
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
