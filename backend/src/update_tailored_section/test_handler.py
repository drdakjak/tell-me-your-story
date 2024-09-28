from collections import namedtuple
import json
import pytest

import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(current_dir)
sys.path.append(os.path.join(parent_dir, "shared"))

from handler import handler, update_section


@pytest.fixture
def event():
    return {
        "requestContext": {"authorizer": {"claims": {"sub": "valid_user_id"}}},
        "body": json.dumps({"section_id": "section_1", "content": "Updated content"}),
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


@pytest.fixture
def mock_user_table(mocker):
    return mocker.patch("handler.user_table")


def test_handler(mock_user_table, mocker, event, context):
    mock_user_table.get_item = mocker.Mock(
        side_effect=lambda Key: {
            "Item": {
                "tailored_sections": [
                    {"section_id": "section_1", "content": "Old content"}
                ]
            }
        }
    )
    response = handler(event, context)

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == "Section successfully updated"


def test_update_section():
    tailored_sections = [
        {"section_id": "section_1", "content": "Old content"},
        {"section_id": "section_2", "content": "Old content"},
    ]
    modified_section = {"section_id": "section_1", "content": "Updated content"}
    modified_sections = update_section(modified_section, tailored_sections)
    assert modified_sections == [
        {"section_id": "section_1", "content": "Updated content"},
        {"section_id": "section_2", "content": "Old content"},
    ]
