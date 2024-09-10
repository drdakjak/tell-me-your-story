from typing import List

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, StateGraph

from .state import AgentState
from .nodes import writer_node, adviser_node, manager_node


def build_workflow():
    workflow = StateGraph(AgentState)

    workflow.add_node("adviser", adviser_node)
    workflow.add_node("writer", writer_node)
    # workflow.add_node("manager", manager_node)

    workflow.add_edge(START, "adviser")
    workflow.add_edge("adviser", "writer")
    # workflow.add_edge("writer", "manager")

    section_workflow = workflow.compile() # TODO: checkpointer=MemorySaver()
    return section_workflow


def invoke_graph(
    graph: StateGraph,
    current_section: str,
    job_requirements: str,
    original_resume: str,
    debug: bool = False,
):
    params = {
        "current_section": current_section,
        "job_requirements": job_requirements,
        "original_resume": original_resume,
    }
    config = {"configurable": {"thread_id": 1}}
    final_state = graph.invoke(params, config=config, debug=debug)
    return final_state
