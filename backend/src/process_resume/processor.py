from typing import List

from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import HumanMessage, SystemMessage
import shortuuid

from prompt import RESUME_SPLITTER
from config import MODEL_NAME

from clients import get_model


class SemanticSection(BaseModel):
    header: str = Field(description="Header of the section in Markdown format")
    content: str = Field(description="Content of the section in Markdown format")


class Sections(BaseModel):
    sections: List[SemanticSection] = Field(description="List of sections")


def resume_parser(resume):
    model = get_model(MODEL_NAME)
    messages = [
        SystemMessage(content=RESUME_SPLITTER),
        HumanMessage(content=f"RESUME:\n\n{resume}"),
    ]

    # Define a chat model and invoke it with the messages
    sections_structured = model.with_structured_output(Sections).invoke(messages)
    sections = sections_structured.dict()
    sections = [
        section | {"section_id": shortuuid.uuid()}
        for section in sections['sections']
    ]
    return sections
