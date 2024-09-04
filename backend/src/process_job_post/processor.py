from typing import List

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.pydantic_v1 import BaseModel, Field

from clients import get_model
from config import MODEL_NAME
from prompt import JOB_POST_ANALYST

class JobRequirement(BaseModel):
    requirement: str = Field(description="The requirement of the job")
    required: bool = Field(description="The requirement is required or not")


class ProcessedJobPost(BaseModel):
    job_requirements: List[JobRequirement]
    key_words: List[str] = Field(description="All relevant key words in the resume")

def process_job_post(text: str) -> str:
    
    model = get_model(MODEL_NAME)

    messages = [
        SystemMessage(content=JOB_POST_ANALYST),
        HumanMessage(content=text),
    ]

    response_structured = model.with_structured_output(ProcessedJobPost).invoke(messages)
    response = response_structured.dict()
    return response