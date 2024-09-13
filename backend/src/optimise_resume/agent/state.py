from typing import List, TypedDict


class AgentState(TypedDict):
    current_section: str
    job_requirements: List
    tailored_section: str
    advice: str
    original_resume: str
    # critique: str
    # revision_number: int
    # max_revision: int
