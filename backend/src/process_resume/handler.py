import json

from processor import resume_parser

def handler(event, context):
    try:
        event = json.dumps(event)
        resume = event['body']['resume']
        semantic_sections = resume_parser(resume)

        return {
            'statusCode': 200,
            'body': json.dumps(semantic_sections)
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'body': json.dumps(e)
        }
