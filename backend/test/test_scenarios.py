import pytest
import json
import random
from scenario.handler import lambda_handler as scenario_handler
from auth.handler import lambda_handler as auth_handler

# ------------------------
# Fixtures
# ------------------------

@pytest.fixture(scope="module")
def shared_state():
    return {}



@pytest.fixture(scope="module")
def test_user():
    """
    Create a single test user once per module and reuse it across all tests.
    """
    # Create a new user only once
    random_int = random.randint(0,10000)
    body = {"email": f"testuser{random_int}@example.com", "password": "password123"}
    event = {
        "httpMethod": "POST",
        "path": "/auth/register",
        "body": json.dumps(body),
        "headers": {"Content-Type": "application/json"},
        "requestContext": {"authorizer": {"principalId": None}}
    }

    response = auth_handler(event, None)
    user_data = json.loads(response["body"])
    
    user_id = user_data.get("id", 1)  # fallback if already exists

    # Optionally login and store tokens if needed
    login_event = {
        "httpMethod": "POST",
        "path": "/auth/login",
        "body": json.dumps(body),
        "headers": {"Content-Type": "application/json"},
        "requestContext": {"authorizer": {"principalId": None}}
    }
    login_response = auth_handler(login_event, None)
    tokens = json.loads(login_response["body"])

    # Return user info to reuse in other tests
    return {"id": user_id, "email": body["email"], "tokens": tokens}

@pytest.fixture
def create_event():
    """Helper to generate API Gateway style events"""
    def _create_event(method, path, body, user_id=None):
        return {
            "httpMethod": method,
            "path": path,
            "body": json.dumps(body),
            "headers": {"Content-Type": "application/json"},
            "requestContext": {"authorizer": {"principalId": user_id}}
        }
    return _create_event

# ------------------------
# Tests
# ------------------------

def test_create_scenario(create_event,shared_state, test_user):
    """Test creating a scenario using the single shared user"""
    scenario_code = f"Standard"+str(random.randint(1,10000))
    body = {"code": scenario_code, "description": "Basic scenario"}
    event = create_event("POST", "/scenario", body, user_id=test_user["id"])

    response = scenario_handler(event, None)
    resp_body = json.loads(response["body"])
    print("Create Scenario Response:", response)

    assert response["statusCode"] == 201
    assert "data" in resp_body
    assert resp_body["data"][0]["code"] == scenario_code
    
    
    shared_state['code'] = resp_body['data'][0]['code']


def test_get_scenarios(create_event,shared_state, test_user):
    """Test retrieving scenarios for the shared user"""
    event = create_event("GET", "/scenario", body={}, user_id=test_user["id"])
    response = scenario_handler(event, None)
    resp_body = json.loads(response["body"])
    print("Get Scenario Response:", response)

    assert response["statusCode"] == 200
    assert isinstance(resp_body["data"], list)
    # assert any(s["code"] == "Standard" for s in resp_body["data"])


def test_update_scenario(create_event,shared_state,test_user):
    event = create_event("PUT", "/scenario", body={'code':shared_state['code'],'description':"Updated"}, user_id=test_user["id"])
    response = scenario_handler(event, None)
    resp_body = json.loads(response['body'])
    assert response['statusCode'] == 200
    assert 'data' in resp_body
    assert 'Updated' == resp_body['data'][0]['description']

def test_delete_scenario(create_event,shared_state,test_user):
    event = create_event("DELETE", "/scenario", body={'code':shared_state['code'],'description':"Updated"}, user_id=test_user["id"])
    response = scenario_handler(event, None)
    resp_body = json.loads(response['body'])
    assert response['statusCode'] == 200
    assert 'data' in resp_body
    assert 'Scenario deleted' == resp_body['msg']