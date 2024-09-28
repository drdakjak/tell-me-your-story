import json
import pytest
from collections import namedtuple

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(current_dir)
sys.path.append(os.path.join(parent_dir, 'shared'))

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

from handler import handler, format_ai_message, AI_MESSAGE

@pytest.fixture
def mock_get_message_history(mocker):
    return mocker.patch('handler.get_message_history')

@pytest.fixture
def event():
    return {
        "body": json.dumps({"conversationId": "valid_conversation_id"}),
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "valid_user_id"
                }
            }
        }
    }

@pytest.fixture
def context():
    LambdaContext = namedtuple(
        "LambdaContext",
        [
            "function_name",
            "memory_limit_in_mb",
            "invoked_function_arn",
            "aws_request_id",
        ],
    )
    context = LambdaContext(
        function_name="test_function",
        memory_limit_in_mb=128,
        invoked_function_arn="test_arn",
        aws_request_id="test_request_id",
    )
    return context

def test_handler_valid_request(mock_get_message_history, event, context, mocker):
    mock_get_message_history.return_value = mocker.Mock(messages=[HumanMessage(content="Hello")])
    
    response = handler(event, context)
    
    assert response["statusCode"] == 200
    assert [{"type": "human", "content": "Hello"}] == json.loads(response["body"])
    assert response["headers"]["Access-Control-Allow-Headers"] == "*"
    assert response["headers"]["Access-Control-Allow-Origin"] == "*"
    assert response["headers"]["Access-Control-Allow-Methods"] == "*"

def test_handler_filter_message(mock_get_message_history, event, context, mocker):
    messages = [
        SystemMessage(content="System message"),
        HumanMessage(content="Hello"),
        AIMessage(content="AI message"),
        ToolMessage(content="Tool message", tool_call_id='1')
    ]
    mock_get_message_history.return_value = mocker.Mock(messages=messages)
    response = handler(event, context)
    
    assert response["statusCode"] == 200
    assert [{'type': 'human', 'content': "Hello"}, {'type': 'ai', 'content': "AI message"}] == json.loads(response["body"])




def test_handler_empty_message_history(mock_get_message_history, event, context, mocker):
    mock_message_history = mocker.Mock()
    mock_message_history.messages = []
    ai_message = AIMessage(format_ai_message(AI_MESSAGE))
    # Define a side effect for add_ai_message to update the messages attribute
    def add_ai_message_side_effect(message):
        mock_message_history.messages.append(AIMessage(message))

    mock_message_history.add_ai_message = mocker.Mock(side_effect=add_ai_message_side_effect)

    # Set the return value of get_message_history to the mock message history object
    mock_get_message_history.return_value = mock_message_history
    response = handler(event, context)
    
    assert response["statusCode"] == 200
    assert [{'type': 'ai', 'content': ai_message.content}] == json.loads(response["body"])
    assert response["headers"]["Access-Control-Allow-Headers"] == "*"
    assert response["headers"]["Access-Control-Allow-Origin"] == "*"
    assert response["headers"]["Access-Control-Allow-Methods"] == "*"





def test_handler_missing_conversation_id(event, context):
    event["body"] = json.dumps({})
    
    response = handler(event, context)
    
    assert response["statusCode"] == 500
    assert "error" in json.loads(response["body"])

def test_handler_missing_user_id(event, context):
    del event["requestContext"]["authorizer"]["claims"]["sub"]
    
    response = handler(event, context)
    
    assert response["statusCode"] == 500
    assert "error" in json.loads(response["body"])

if __name__ == "__main__":
    pytest.main()