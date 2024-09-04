from pyexpat.errors import messages
import stat
from typing import TypedDict, Annotated, List
from click import prompt
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from prompt_toolkit import PromptSession
from regex import F

from backend.src.component1.prompts import *


class JobRequirement(BaseModel):
    requirement: str = Field(description="The requirement of the job")
    required: bool = Field(description="The requirement is required or not")


class ProcessedResume(BaseModel):
    job_requirements: List[JobRequirement]
    key_words: List[str] = Field(description="All relevant key words in the resume")

class AgentState(TypedDict):
    task: str
    job_requirements: List[JobRequirement]
    revision: str
    advise: str
    critique: str
    revision_number: int
    max_revision: int



def get_job_requirements(state: AgentState):
    messages = [
        SystemMessage(content=JOB_POST_ANALYST),
        HumanMessage(content=state['job_post'])
    ]

    processed_resume = state['model'].with_structured_output(ProcessedResume).invoke(messages)
    return processed_resume

def JOB_POST_ANALYST_node(state: AgentState):

    processed_resume = get_job_requirements(state)
    
    return {'job_requirements': processed_resume.job_requirements, 'key_words': processed_resume.key_words}

from langchain_core.prompts import PromptTemplate

from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)


def get_input_prompt_template(variables: List[str]) -> str:
    prompt_template = ''
    for variable in variables:
        prompt_template += f"{variable.upper()}: \n```{{{variable}}}```\n\n"
    return prompt_template

def get_chat_template(prompt_template: str, system_prompt: str) -> ChatPromptTemplate:
    chat_template = ChatPromptTemplate.from_messages(
        [
            SystemMessage(content=system_prompt),
            HumanMessagePromptTemplate.from_template(prompt_template)
        ])
    return chat_template

def get_messages(chat_template, variables, state):
    kwargs = {variable: str(state[variable])  for variable in variables} 
    messages = chat_template.format_messages(**kwargs)
    return messages

class Advice(BaseModel):
    advice: str = Field(description="The advice for the resume")
    # example: str = Field(description="The example to show how to improve the resume")
    example: str = Field(description="The example bulletpoint to show how to improve the resume")

class PiecesOfAdvice(BaseModel):
    pieces_of_advice:  List[Advice]


def get_advice(state: AgentState) -> str:
    variables = ['job_requirements', 'key_words', 'job_description', 'resume']
    
    prompt_template = get_input_prompt_template(variables)
    chat_template = get_chat_template(prompt_template, RESUME_REVISER)
    messages = get_messages(chat_template, variables, state)

    pieces_of_advice = state['model'].with_structured_output(PiecesOfAdvice).invoke(messages)
    
    return pieces_of_advice

def resume_adviser_node(state: AgentState):

    pieces_of_advice = get_advice(state)

    return {'pieces_of_advice': pieces_of_advice}

class Revision(BaseModel):
    analysis_of_resume: str = Field(description="The analysis of the resume")
    revision: str = Field(description="The revised resume")
    changes_made: str = Field(description="The changes made to the resume")

def get_revision(state: AgentState) -> str:
    revision_number = state.get('revision_number', 1)
    if revision_number <= 1:
        variables = ['job_requirements', 'key_words', 'job_description', 'resume', 'pieces_of_advice']
    else:
        variables = ['feedback', 'revision']

    prompt_template = get_input_prompt_template(variables)
    chat_template = get_chat_template(prompt_template, RESUME_REVISER)
    messages = get_messages(chat_template, variables, state)

    revision = state['model'].with_structured_output(Revision).invoke(messages)
    return revision

def resume_revision_node(state: AgentState):

    revision = get_revision(state)
    
    reivision_number = state.get('revision_number', 1) + 1
    return {'revision': revision.revision, 
            'revision_analysis': revision.analysis_of_resume,
            'revision_changes': revision.changes_made,
            'revision_number': reivision_number}

def get_feedback(state: AgentState) -> str:
    variables = ['job_description', 'revision']
    
    prompt_template = get_input_prompt_template(variables)
    chat_template = get_chat_template(prompt_template, MANAGER)
    messages = get_messages(chat_template, variables, state)

    response = state['model'].invoke(messages)
    feedback = response.content
    return feedback

def hiring_manager_node(state: AgentState):

    feedback = get_feedback(state)
    
    return {'feedback': feedback}