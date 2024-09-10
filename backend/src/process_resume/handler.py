import json

from processor import resume_parser
from clients import get_user_table

user_table = get_user_table()


def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        resume = event["body"]["resume"]
        semantic_sections = resume_parser(resume)

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET semantic_sections = :semantic_sections",
            ExpressionAttributeValues={":semantic_sections": semantic_sections},
        )

        return {"statusCode": 200, "body": json.dumps(semantic_sections)}
    except Exception as e:
        return {"statusCode": 400, "body": json.dumps(e.__repr__())}
