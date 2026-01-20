from handler import lambda_handler
import json
import uuid
from datetime import datetime

# ---- MOCK ADMIN USER ----
ADMIN_USER = {
    "userId": "d2ee996b-0dfe-4958-846c-139cf251f384",
    "email": "alessio@gmail.com",
    "role": "ADMIN",  # force admin for tests
}
NORMAL_USER = {
    "userId": "570046bc-50f2-4ca9-94d0-1d2b70179522",
    "email": "user@gmail.com",
    "role": "USER",
}

# ---- EVENT FACTORY ----
def create_event(user,method, path, body=None):
    return {
        "httpMethod": method,
        "path": path,
        "headers": {
            "origin": "http://localhost:3000"
        },
        "body": json.dumps(body) if body else None,
        "requestContext": {
            "authorizer": {
                "principalId": user["userId"],
                "role": user["role"],
                "email": user["email"],
            }
        }
    }


# ---- TESTS ----
def test_get_user_profiel():
    print("\n--- GET USER ---")
    event = create_event(
        NORMAL_USER,
        "GET",
        "/private/me",
      None)
    response = lambda_handler(event, None)
    print(response)
    return json.loads(response["body"])['user']


def test_get_user_events():
    print("\n--- GET USER EVENTS ---")
    event = create_event(NORMAL_USER,"GET", "/private/events")
    response = lambda_handler(event, None)
    print(response)


# ---- RUN ALL ----
if __name__ == "__main__":
    print("=== FlyCalcio Events Lambda Tests ===")

    test_get_user_profiel()
    test_get_user_events()
