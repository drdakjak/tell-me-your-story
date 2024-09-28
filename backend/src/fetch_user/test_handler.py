import json
import pytest
from collections import namedtuple

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(current_dir)
sys.path.append(os.path.join(parent_dir, 'shared'))

from handler import handler


@pytest.fixture
def mock_user_table(mocker):
    return mocker.patch('handler.user_table')

@pytest.fixture
def event():
    return {
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

def test_handler_valid_user_id(mock_user_table, event, context):
    mock_user_table.get_item.return_value = {"Item": {"id": "valid_user_id", "name": "John Doe"}}
    
    response = handler(event, context)
    
    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {"id": "valid_user_id", "name": "John Doe"}
    assert response["headers"]["Access-Control-Allow-Headers"] == "*"
    assert response["headers"]["Access-Control-Allow-Origin"] == "*"
    assert response["headers"]["Access-Control-Allow-Methods"] == "*"

def test_handler_user_id_not_found(mock_user_table, event, context):
    mock_user_table.get_item.return_value = {}
    
    response = handler(event, context)
    
    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {}
    assert response["headers"]["Access-Control-Allow-Headers"] == "*"
    assert response["headers"]["Access-Control-Allow-Origin"] == "*"
    assert response["headers"]["Access-Control-Allow-Methods"] == "*"

def test_handler_missing_claims(event, context):
    del event["requestContext"]["authorizer"]["claims"]["sub"]
    
    response = handler(event, context)
    
    assert response["statusCode"] == 500
    assert "error" in json.loads(response["body"])

def test_handler_general_exception(mock_user_table, event, context):
    mock_user_table.get_item.side_effect = Exception("Something went wrong")
    
    response = handler(event, context)
    
    assert response["statusCode"] == 500
    assert json.loads(response["body"]) == {"error": "Something went wrong"}