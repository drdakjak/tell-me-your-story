import json
import concurrent.futures
import shortuuid

from aws_lambda_powertools import Logger

from agent.workflow import build_workflow, invoke_graph
from clients import get_user_table
from common_config import LOGGING_LEVEL


logger = Logger(level=LOGGING_LEVEL)
user_table = get_user_table()


def process_resume_section(resume_section, workflow, job_requirements, original_resume):
    if resume_section["content"]:
        final_state = invoke_graph(
            workflow,
            current_section=resume_section,
            job_requirements=job_requirements,
            original_resume=original_resume,
            debug=False,
        )
        tailored_section = final_state["tailored_section"]
        tailored_section["advice"] = final_state["advice"] 
    else:
        tailored_section = resume_section
        tailored_section["advice"] = ""
    tailored_section['section_id'] = shortuuid.uuid()
    
    return tailored_section


def get_tailored_resume(semantic_sections, job_requirements, original_resume):
    workflow = build_workflow()

    with concurrent.futures.ThreadPoolExecutor() as executor:
        tailored_resume = executor.map(
            process_resume_section,
            semantic_sections,
            [workflow] * len(semantic_sections),
            [job_requirements] * len(semantic_sections),
            [original_resume] * len(semantic_sections),
        )

    tailored_resume = list(tailored_resume)
    return tailored_resume

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]

        response = user_table.get_item(Key={"id": user_id})
        job_requirements = response["Item"]["job_requirements"]
        original_resume = response["Item"]["original_resume"]
        semantic_sections = response["Item"]["semantic_sections"]

        logger.info({'user_id': user_id, 'Optimizing resume for user': user_id})

        tailored_sections = get_tailored_resume(
            semantic_sections, job_requirements, original_resume
        )

        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET tailored_sections = :tailored_sections",
            ExpressionAttributeValues={":tailored_sections": tailored_sections},
        )

        body = {
            "semantic_sections": semantic_sections,
            "tailored_sections": tailored_sections,
        }
        return {
            "statusCode": 200,
            "body": json.dumps(body),
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
        }
    except Exception as e:
        logger.error("An error occurred", exc_info=e)
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
