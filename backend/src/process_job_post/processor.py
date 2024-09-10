from langchain_core.messages import HumanMessage, SystemMessage

from clients import get_model
from config import MODEL_NAME
from prompt import JOB_POST_ANALYST

def process_job_post(text: str) -> str:
    
    model = get_model(MODEL_NAME)

    messages = [
        SystemMessage(content=JOB_POST_ANALYST),
        HumanMessage(content=text),
    ]
    response = model.invoke(messages)
    content = response.content
    return content