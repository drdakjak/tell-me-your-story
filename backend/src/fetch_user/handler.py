import json

from clients import get_user_table

user_table = get_user_table()

def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        response = user_table.get_item(Key={"id": user_id})
        user_date = response.get("Item", {})
        
        return {
                "statusCode": 200,
                "body": json.dumps(user_date),
                "headers": {
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                },
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
        }
