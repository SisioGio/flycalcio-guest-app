import pytest
import json
import random
from datetime import date
from auth.handler import lambda_handler as auth_handler
from category.handler import lambda_handler as category_handler

# ------------------------
# Fixtures
# ------------------------

@pytest.fixture(scope="module")
def shared_state():
    return {}


@pytest.fixture(scope="module")
def test_user():
    random_int = random.randint(0, 10000)
    body = {
        "email": f"testuser{random_int}@example.com",
        "password": "password123"
    }

    register_event = {
        "httpMethod": "POST",
        "path": "/auth/register",
        "body": json.dumps(body),
        "headers": {"Content-Type": "application/json"},
        "requestContext": {"authorizer": {"principalId": None}}
    }

    register_response = auth_handler(register_event, None)
    user_id = json.loads(register_response["body"]).get("id")

    login_event = {
        "httpMethod": "POST",
        "path": "/auth/login",
        "body": json.dumps(body),
        "headers": {"Content-Type": "application/json"},
        "requestContext": {"authorizer": {"principalId": None}}
    }

    login_response = auth_handler(login_event, None)
    tokens = json.loads(login_response["body"])

    return {"id": user_id, "tokens": tokens}


@pytest.fixture
def create_event():
    def _create_event(method, path, body, user_id=None, qs=None):
        return {
            "httpMethod": method,
            "path": path,
            "body": json.dumps(body),
            "queryStringParameters": qs,
            "headers": {"Content-Type": "application/json"},
            "requestContext": {"authorizer": {"principalId": user_id}}
        }
    return _create_event


# ------------------------
# Scenario setup
# ------------------------

def test_create_category(create_event, shared_state, test_user):
    category_code = f"CAT_{random.randint(1,10000)}"
    body = {"name": category_code}
    event = create_event("POST", "/category", body, user_id=test_user["id"])

    response = category_handler(event, None)
    resp_body = json.loads(response["body"])
    print(resp_body)
    assert response["statusCode"] == 201
    shared_state["category_id"] = resp_body["data"][0]["id"]
    shared_state["category_name"] = resp_body["data"][0]["name"]


def test_get_categories(create_event, shared_state, test_user):
    event = create_event(
        "GET",
        "/category",
        body={},
        user_id=test_user["id"]
    )
    response = category_handler(event, None)
    resp_body = json.loads(response["body"])
    assert response["statusCode"] == 200
    assert isinstance(resp_body["data"], list)
    assert len(resp_body['data'])>0


def test_update_entry(create_event, shared_state, test_user):
    body = {
        "id": shared_state["category_id"],
        "name": "Salary"
    }

    event = create_event("PUT", "/category", body, user_id=test_user["id"])
    response = category_handler(event, None)
    resp_body = json.loads(response["body"])
    print(resp_body)
    assert response["statusCode"] == 200
    assert resp_body["data"][0]["name"] == 'Salary'


def test_delete_entry(create_event, shared_state, test_user):
    body = {"id": shared_state["category_id"]}
    event = create_event("DELETE", "/category", body, user_id=test_user["id"])

    response = category_handler(event, None)
    resp_body = json.loads(response["body"])

    assert response["statusCode"] == 200
    assert resp_body["msg"] == "category deleted"
