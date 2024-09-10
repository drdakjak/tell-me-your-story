import json

from backend.src.process_job_post.processor import process_job_post 
from clients import get_user_table

user_table = get_user_table()


def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        job_post = event["body"]["job_post"]

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET job_post = if_not_exists(job_post, :job_post)",
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
            'body': json.dumps(job_requirements)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(e.__repr__())
        }