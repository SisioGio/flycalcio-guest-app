import pytest
import json
import random
from auth.handler import lambda_handler
from authorizer.handler import authorizer
# ------------------------
# Fixtures
# ------------------------

@pytest.fixture
def random_user():
    """Generate a random email and password for testing."""
    r_digit = random.randint(1, 10000)
    email = f"test{r_digit}@gmail.com"
    password = f"test_{r_digit}"
    return {"email": email, "password": password}


@pytest.fixture
def create_event():
    """Helper to generate API Gateway style events."""
    def _create_event(method, path, body):
        return {
            "httpMethod": method,
            "path": path,
            "body": json.dumps(body),
            "headers": {"Content-Type": "application/json"}
        }
    return _create_event

# ------------------------
# Tests
# ------------------------

def test_register(create_event, random_user):
    """Test registering a new user."""
    body = {
        "email": random_user["email"],
        "password": random_user["password"]
    }
    event = create_event("POST", "/auth/register", body)
    response = lambda_handler(event, None)
    
    # Parse JSON response
    resp_body = json.loads(response["body"])
    
    assert response["statusCode"] == 201
    assert "id" in resp_body
    assert resp_body["msg"] == "User registered"

def test_login(create_event, random_user):
    """Test logging in with a registered user."""
    # First register the user
    body = {"email": random_user["email"], "password": random_user["password"]}
    event = create_event("POST", "/auth/register", body)
    lambda_handler(event, None)  # Ignore response, already tested in registration

    # Now login
    event = create_event("POST", "/auth/login", body)
    response = lambda_handler(event, None)
    resp_body = json.loads(response["body"])
    
    assert response["statusCode"] == 200
    assert "access_token" in resp_body
    assert "refresh_token" in resp_body



def test_authorizer(create_event, random_user):
    """Test logging in with a registered user."""
    # First register the user
    
    body = {"email": random_user["email"], "password": random_user["password"]}
    event = create_event("POST", "/auth/register", body)
    response_registration=lambda_handler(event, None)  # Ignore response, already tested in registration
    user_id = json.loads(response_registration['body'])['id']
    # Now login
    event = create_event("POST", "/auth/login", body)
    response = lambda_handler(event, None)
    resp_body = json.loads(response["body"])
    
    assert response["statusCode"] == 200
    assert "access_token" in resp_body
    assert "refresh_token" in resp_body
    access_token = resp_body['access_token']
    
    event = {
        'authorizationToken':f'Bearer {access_token}',
        'methodArn':"something"
    }
    
    response = authorizer(event,None)
    assert user_id == response['principalId']
    assert random_user["email"] == response['context']['email']
    assert 'policyDocument' in response
    assert 'Statement' in response['policyDocument']
    assert len(response['policyDocument']['Statement']) >0
    assert 'Allow' == response['policyDocument']['Statement'][0]['Effect']
    
    
