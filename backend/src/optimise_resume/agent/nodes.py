import logging

from math import log
from typing import TypedDict, Annotated, List
from httpx import get
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage

from .state import AgentState
from .prompts import RESUME_WRITER, RESUME_ADVICER, MANAGER
from clients import get_model
from config import MODEL_NAME

MODEL = get_model(MODEL_NAME)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def format_job_requirements(job_requirements) -> str:
    return f"\n{job_requirements}\n"

def format_section(section) -> str:
    section_formatted = f"\nSection:\n{section['title']}\n{section['content']}\n"
    return section_formatted

def format_advice(advice) -> str:
    return f"\nExpert Advice: {advice}\n"

def get_advice(state: AgentState):

    system_prompt = RESUME_ADVICER.format(
        job_requirements=format_job_requirements(state["job_requirements"]),
    )
    user_prompt = format_section(state["current_section"])

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]
    response = MODEL.invoke(messages)
    content = response.content
    return content


def adviser_node(state: AgentState):

    advice = get_advice(state)

    return {"advice": advice}


def get_revised_section(state: AgentState):

    system_promp = RESUME_WRITER.format(
        job_requirements=format_job_requirements(state["job_requirements"]),
        # original_resume=state["original_resume"],
    )
    user_prompt = format_section(state["current_section"])

    messages = [
        SystemMessage(content=system_promp),
        HumanMessage(content=user_prompt),
    ]
    response = MODEL.invoke(messages)
    content = response.content
    logger.info(content)
    print(content)
    return content


def writer_node(state: AgentState):
    revised_section = get_revised_section(state)
    return {"revised_section": revised_section}


def get_feedback(state: AgentState):

    system_promp = MANAGER.format(
        job_requirements=format_job_requirements(state["job_requirements"]),
    )
    user_prompt = format_section(state["current_section"])
    user_prompt += format_advice(state["advice"])
    messages = [
        SystemMessage(content=system_promp),
        HumanMessage(content=user_prompt),
    ]
    response = MODEL.invoke(messages)
    content = response.content
    return content


def manager_node(state: AgentState):

    feedback = get_feedback(state)

    return {"feedback": feedback}
