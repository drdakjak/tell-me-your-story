import json
import concurrent.futures

from agent.workflow import build_workflow, invoke_graph
from clients import get_user_table

user_table = get_user_table()

import concurrent.futures


def process_resume_section(resume_section, workflow, job_requirements, original_resume):
    keys_to_include = ["advice", "tailored_section"]
    if resume_section["content"]:
        final_state = invoke_graph(
            workflow,
            current_section=resume_section,
            job_requirements=job_requirements,
            original_resume=original_resume,
            debug=False,
        )
        tailored_section = {key: final_state[key] for key in keys_to_include}
    else:
        tailored_section = {key: "" for key in keys_to_include}
    return tailored_section


def get_tailored_resume(semantic_sections, job_requirements, original_resume):
    workflow = build_workflow()
    tailored_resume = []

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(
                process_resume_section,
                section,
                workflow,
                job_requirements,
                original_resume,
            )
            for section in semantic_sections
        ]
        for future in concurrent.futures.as_completed(futures):
            tailored_resume.append(future.result())

    return tailored_resume


def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        response = user_table.get_item(Key={"id": user_id})
        job_requirements = response["Item"]["job_requirements"]
        original_resume = response["Item"]["original_resume"]
        semantic_sections = response["Item"]["semantic_sections"]

        tailored_resume = get_tailored_resume(
            semantic_sections, job_requirements, original_resume
        )

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET tailored_resume = :tailored_resume",
            ExpressionAttributeValues={":tailored_resume": tailored_resume},
        )
        return {
            "statusCode": 200,
            "body": json.dumps(tailored_resume),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }
