import json
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, SystemMessage
from aws_lambda_powertools import Logger

from clients import get_user_table, get_model
from common_config import LOGGING_LEVEL
from prompt import RESUME_DESIGNER_PROMPT
from config import MODEL_NAME

logger = Logger(level=LOGGING_LEVEL)

user_table = get_user_table()
model = get_model(MODEL_NAME)


def format_resume(sections):
    return "\n\n".join(
        [f'{section["header"]}\n\n{section["content"]}' for section in sections]
    )

# @logger.inject_lambda_context(log_event=True)
def handler(event, context):
    try:
        user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
        response = user_table.get_item(Key={"id": user_id})
        tailored_sections = response["Item"]["tailored_sections"]

        logger.info({'user_id': user_id, 'content': f"Generating tailored resume for user {user_id}"})

        system_message = SystemMessage(content=RESUME_DESIGNER_PROMPT)
        user_prompt = HumanMessage(content=format_resume(tailored_sections))

        messages = [system_message, user_prompt]
        chain = model | StrOutputParser()
        response = chain.invoke(messages)
        
        user_table.update_item(
            Key={"id": user_id},
            UpdateExpression="SET tailored_resume = :response",
            ExpressionAttributeValues={":response": response},
        )
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            "body": json.dumps(response),
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
            "body": json.dumps({"error": str(e)})
        }
