import json
from clients import get_user_table

user_table = get_user_table()


def handler(event, context):
    try:    
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        modified_section = json.loads(event["body"])

        response = user_table.get_item(Key={"id": user_id})
        tailored_sections = response["Item"]["tailored_sections"]
        
        tailored_sections = [
            (
                modified_section
                if section["section_id"] == modified_section["section_id"]
                else section
            )
            for section in tailored_sections
        ]

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET tailored_sections = :tailored_sections",
            ExpressionAttributeValues={":tailored_sections": tailored_sections},
        )

        return {
                "statusCode": 200,
                "headers": {
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "*",
                    },
                "body": json.dumps("Section successfully updated")
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                },
            "body": json.dumps({"error": str(e)})
        }
