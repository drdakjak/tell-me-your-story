from typing import TypedDict, Annotated, List
from langchain_core.pydantic_v1 import BaseModel
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage, AIMessage

from prompts import *

class Requirement(BaseModel):
    requirement: str
    required: bool

class Requirements(BaseModel):
    requirements: List[Requirement]

class AgentState(TypedDict):
    task: str
    job_requirements: Requirements
    draft: str
    critique: str
    revision_number: int
    max_revision: int


def get_job_requirements(state: AgentState):
    messages = [
        SystemMessage(content=JOB_DESCRIPTION_ANALYST),
        HumanMessage(content=state['job_description'])
    ]

    job_requirements = state['model'].with_structured_output(Requirements).invoke(messages)
    return job_requirements

def job_description_analyst_node(state: AgentState):

    job_requirements = get_job_requirements(state)
    
    return {'job_requirements': job_requirements}

