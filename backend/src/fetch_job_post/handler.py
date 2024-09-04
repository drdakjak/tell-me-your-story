import json

from web_url_text_extractor import extract_text_from_url
from job_post_extractor import extract_job_post_text


def handler(event, context):
    try:
        event = json.dumps(event)
        url = event["body"]["url"]

        extracted_text = extract_text_from_url(url)
        job_post = extract_job_post_text(extracted_text)

        return {"statusCode": 200, "body": json.dumps(job_post)}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps(str(e))}
