from langchain_core.messages import HumanMessage, SystemMessage

from config import MODEL_NAME
from prompt import JOB_POST_EXTRACTOR
from clients import get_model


def extract_job_post_text(text: str) -> str:

    model = get_model(MODEL_NAME)

    messages = [
        SystemMessage(content=JOB_POST_EXTRACTOR),
        HumanMessage(content=text),
    ]

    response = model.invoke(messages)
    content = response.content
    return content
