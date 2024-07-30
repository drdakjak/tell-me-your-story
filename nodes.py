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

from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.memory.buffer import ConversationBufferMemory
# store = {} # TODO
# def get_session_history(session_id: str) -> BaseChatMessageHistory:
#     if session_id not in store:
#         store[session_id] = ChatMessageHistory()
#     return store[session_id]

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def _get_requirements_checker_prompt():
    prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(content=REQUIREMENT_CHECK),
            MessagesPlaceholder("chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad"),
        ]
    )
    return prompt

def requirements_checker_node(state: AgentState):
    requirements = state['job_requirements'].requirements
    
    prompt = _get_requirements_checker_prompt()
    tools = state['tools']
    model = state['model']
    agent = create_openai_tools_agent(model, tools, prompt)

    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    agent_executor = AgentExecutor(agent=agent, tools=tools, memory=memory, verbose=True)


    # agent_with_chat_history = RunnableWithMessageHistory(
    #     agent_executor,
    #     get_session_history, # https://python.langchain.com/v0.1/docs/modules/memory/agent_with_memory_in_db/
    #     input_messages_key="input",
    #     history_messages_key="chat_history",
    # )
    for requirement in requirements:
        response = agent_executor.invoke({'input': requirement.requirement})# , config={"configurable": {"session_id": "<foo>"}}) #, 'chat_history': chat_history})
        if response['output'] == 'CONTINUE':
            continue
        else:
            print('<<<<<<<>>>>>>>')
            user_response = input(response['output'])
            while True:
                response = agent_executor.invoke({'input': user_response})# , config={"configurable": {"session_id": "<foo>"}}) # TODO add memory
                print(response)
                if response['output'] == 'CONTINUE':
                    break
                user_response = input(response['output'])

            