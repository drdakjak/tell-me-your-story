import json

from agent.workflow import build_workflow, invoke_graph
from clients import get_user_table

user_table = get_user_table()

def get_revised_resume(resume_sections, job_post_processed, original_resume):
    workflow = build_workflow()
    revised_resume = []
    for resume_section in resume_sections:
        keys_to_include = ["advice", "revised_section"]

        if resume_section["content"]:
            final_state = invoke_graph(
                workflow,
                current_section=resume_section,
                job_requirements=job_post_processed,
                original_resume=original_resume,
                debug=False,
            )
            revised_section = {key: final_state[key] for key in keys_to_include}
            revised_resume.append(revised_section)
        else:
            revised_section = {key: "" for key in keys_to_include}
            revised_resume.append(revised_section)
    return revised_resume


def handler(event, context):
    try: 
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        response = user_table.get_item(
            Key={"id": user_id}
        )
        job_post_processed = response["Item"]['job_post_processed']
        original_resume = response['Item']['original_resume']
        resume_sections = response['Item']['resume_sections']

        revised_resume = get_revised_resume(resume_sections, job_post_processed, original_resume)

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET revised_resume = :revised_resume",
            ExpressionAttributeValues={":revised_resume": revised_resume},
        )
        return {
            "statusCode": 200,
            "body": json.dumps(revised_resume),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }
