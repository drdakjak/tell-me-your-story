import json

from processor import process_job_post 
from clients import get_user_table

user_table = get_user_table()


def handler(event, context):
    try:
        body = json.loads(event["body"])
        job_post = body["jobPost"]
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]


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
        return {
            'statusCode': 500,
            'body': json.dumps(e.__repr__()),
            'headers': {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            }
        }