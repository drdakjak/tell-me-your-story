import json

from processor import resume_parser
from clients import get_user_table

user_table = get_user_table()


def handler(event, context):
    try:
        body = json.loads(event["body"])
        original_resume = body["resume"]
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

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
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps(e.__repr__()),
        }
