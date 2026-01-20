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
def test_create_event():
    print("\n--- CREATE EVENT ---")
    event = create_event(
        ADMIN_USER,
        "POST",
        "/event",
        {
            "title": "Test Match",
            "date": datetime.utcnow().isoformat(),
            "location": "Rome"
        }
    )
    response = lambda_handler(event, None)
    print(response)
    return json.loads(response["body"])["event"]["eventId"]


def test_get_events():
    print("\n--- GET EVENTS ---")
    event = create_event(ADMIN_USER,"GET", "/event")
    response = lambda_handler(event, None)
    print(response)


def test_update_event(event_id):
    print("\n--- UPDATE EVENT ---")
    event = create_event(
        ADMIN_USER,
        "PUT",
        "/event",
        {
            "eventId": event_id,
            "title": "Updated Test Match",
            "location": "Milan"
        }
    )
    response = lambda_handler(event, None)
    print(response)


def test_delete_event(event_id):
    print("\n--- DELETE EVENT ---")
    event = create_event(
        ADMIN_USER,
        "DELETE",
        "/event",
        {
            "eventId": event_id
        }
    )
    response = lambda_handler(event, None)
    print(response)

def test_assign_user(event_id, user_id):
    print("\n--- ASSIGN USER TO EVENT ---")
    event = create_event(
        ADMIN_USER,
        "POST",
        "/event/assign",
        {
            "eventId": event_id,
            "userId": user_id
        }
    )
    response = lambda_handler(event, None)
    print(response)


def test_remove_user(event_id, user_id):
    print("\n--- REMOVE USER FROM EVENT ---")
    event = create_event(
        ADMIN_USER,
        "DELETE",
        "/event/assign",
        {
            "eventId": event_id,
            "userId": user_id
        }
    )
    response = lambda_handler(event, None)
    print(response)
# ---- RUN ALL ----
if __name__ == "__main__":
    print("=== FlyCalcio Events Lambda Tests ===")

    event_id = test_create_event()
    test_get_events()
    test_update_event(event_id)
    test_assign_user(event_id, NORMAL_USER["userId"])

    test_get_events()
    test_remove_user(event_id, NORMAL_USER["userId"])
    test_get_events()
    
    # test_delete_event(event_id)
    test_get_events()
