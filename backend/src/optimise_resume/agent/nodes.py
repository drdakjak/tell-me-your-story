from typing import TypedDict, Annotated, List
from httpx import get
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage

from .state import AgentState
from .prompts import RESUME_WRITER, RESUME_ADVICER, MANAGER
from clients import get_model
from config import MODEL_NAME

MODEL = get_model(MODEL_NAME)


def format_job_requirements(job_requirements: List[str]) -> str:
    return "\n".join(
        [
            f"- {'Required' if requirement['required'] else 'Nice to have'}: {requirement['requirement']}"
            for requirement in job_requirements
        ]
    )


def format_key_words(key_words: List[str]) -> str:
    return "\n".join([f"- {key_word} " for key_word in key_words])


def format_section(section) -> str:
    section_formatted = f"Section:\n{section['title']}\n{section['content']}"
    return section_formatted

def format_advice(advice) -> str:
    return f"\n\nExpert Advice: {advice}"

def get_advice(state: AgentState):

    system_prompt = RESUME_ADVICER.format(
        job_post=state["job_post"],
        job_requirements=format_job_requirements(state["job_requirements"]),
        key_words=format_key_words(state["key_words"]),
    )
    user_prompt = format_section(state["current_section"])

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]
    response = MODEL.invoke(messages)
    return response


def adviser_node(state: AgentState):

    advice = get_advice(state)

    return {"advice": advice}


def get_revised_section(state: AgentState):

    system_promp = RESUME_WRITER.format(
        job_post=state["job_post"],
        job_requirements=format_job_requirements(state["job_requirements"]),
        key_words=format_key_words(state["key_words"]),
        original_resume=state["original_resume"],
    )
    user_prompt = format_section(state["current_section"])

    messages = [
        SystemMessage(content=system_promp),
        HumanMessage(content=user_prompt),
    ]
    response = MODEL.invoke(messages)
    return response


def writer_node(state: AgentState):
    revised_section = get_revised_section(state)
    return {"revised_section": revised_section}


def get_feedback(state: AgentState):

    system_promp = MANAGER.format(
        job_post=state["job_post"],
        job_requirements=format_job_requirements(state["job_requirements"]),
        key_words=format_key_words(state["key_words"]),
    )
    user_prompt = format_section(state["current_section"])
    user_prompt += format_advice(state["advice"])
    messages = [
        SystemMessage(content=system_promp),
        HumanMessage(content=user_prompt),
    ]
    response = MODEL.invoke(messages)
    return response


def manager_node(state: AgentState):

    feedback = get_feedback(state)

    return {"feedback": feedback}
