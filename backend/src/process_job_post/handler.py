import json

from processor import process_job_post 

def handler(event, context):
    try:
        event = json.dumps(event)
        job_post = event["body"]["job_post"]
        response = process_job_post(job_post)

        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(e)
        }