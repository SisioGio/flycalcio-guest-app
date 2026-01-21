import json
import os
import uuid
from datetime import datetime

import boto3
from boto3.dynamodb.conditions import Key

from utils import generate_response, logger, tracer
from dotenv import load_dotenv
load_dotenv()

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DB_TABLE"])

@tracer.capture_lambda_handler
def lambda_handler(event, context):
    

    method = event.get("httpMethod")
    path = event.get("path")

    logger.info("Incoming request", extra={"method": method, "path": path})

    if path == "/event":
        if method == "GET":
            return get_events(event)
        if method == "POST":
            return create_event(event)
        if method == "PUT":
            return update_event(event)
        if method == "DELETE":
            return delete_event(event)
    
    if path == "/event/assign":
        if method == "POST":
            return assign_user_to_event(event)
        if method == "DELETE":
            return remove_user_from_event(event)
        

    return generate_response(
        400, {"msg": "Invalid route or method"}, event=event
    )

# ---------------- helpers ----------------

def _auth_context(event):
    auth = event["requestContext"]["authorizer"]
    return auth["principalId"], auth.get("role")

def get_events(event):
    """
    USER  → events assigned to user
    ADMIN → all events
    """
    user_id, role = _auth_context(event)

    try:
        if role == "ADMIN":
            logger.info("Listing all events (admin)")
            resp = table.query(
                IndexName="GSI1",
                KeyConditionExpression=Key("GSI1PK").eq("EVENT")
            )
            return generate_response(200, {"events": resp["Items"]})

        # USER → assigned events
        logger.info("Listing user events", extra={"userId": user_id})
        assignments = table.query(
            KeyConditionExpression=(
                Key("PK").eq(f"USER#{user_id}") &
                Key("SK").begins_with("EVENT#")
            )
        )

        events = []
        for a in assignments["Items"]:
            event_id = a["SK"].replace("EVENT#", "")
            event_item = table.get_item(
                Key={
                    "PK": f"EVENT#{event_id}",
                    "SK": "METADATA"
                }
            ).get("Item")

            if event_item:
                events.append(event_item)

        return generate_response(200, {"events": events})

    except Exception:
        logger.exception("Failed to fetch events")
        tracer.put_annotation("error_type", "unhandled")
        return generate_response(500, {"msg": "Internal server error"})


def create_event(event):
    user_id, role = _auth_context(event)

    if role != "ADMIN":
        return generate_response(403, {"msg": "Forbidden"})

    try:
        body = json.loads(event.get("body", "{}"))
        title = body.get("title")
        date = body.get("date")
        location = body.get("location")

        if not title or not date:
            return generate_response(
                400, {"msg": "title and date are required"}, event
            )

        event_id = str(uuid.uuid4())

        item = {
            "PK": f"EVENT#{event_id}",
            "SK": "METADATA",
            "GSI1PK": "EVENT",
            "GSI1SK": date,
            "eventId": event_id,
            "title": title,
            "date": date,
            "location": location,
            "createdBy": user_id,
            "createdAt": datetime.utcnow().isoformat()
        }

        
        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(PK)"
        )

        logger.info("Event created", extra={"eventId": event_id})
        return generate_response(201, {"event": item})

    except Exception:
        logger.exception("Failed to create event")
        tracer.put_annotation("error_type", "unhandled")
        return generate_response(500, {"msg": "Internal server error"})


def update_event(event):
    user_id, role = _auth_context(event)

    if role != "ADMIN":
        return generate_response(403, {"msg": "Forbidden"})

    try:
        body = json.loads(event.get("body", "{}"))
        event_id = body.get("eventId")

        if not event_id:
            return generate_response(400, {"msg": "eventId required"})

        update_expr = []
        expr_vals = {}
        expr_names = {}

        for field in ["title", "date", "location"]:
            if field in body:
                placeholder_name = f"#{field}"
                placeholder_value = f":{field}"

                update_expr.append(f"{placeholder_name} = {placeholder_value}")
                expr_names[placeholder_name] = field
                expr_vals[placeholder_value] = body[field]

        if not update_expr:
            return generate_response(400, {"msg": "No fields to update"})

        
        table.update_item(
            Key={
                "PK": f"EVENT#{event_id}",
                "SK": "METADATA"
            },
            UpdateExpression="SET " + ", ".join(update_expr),
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_vals
        )

        logger.info("Event updated", extra={"eventId": event_id})
        return generate_response(200, {"msg": "Event updated"})

    except Exception:
        logger.exception("Failed to update event")
        tracer.put_annotation("error_type", "unhandled")
        return generate_response(500, {"msg": "Internal server error"})



def delete_event(event):
    user_id, role = _auth_context(event)

    if role != "ADMIN":
        return generate_response(403, {"msg": "Forbidden"})

    try:
        body = json.loads(event.get("body", "{}"))
        event_id = body.get("eventId")

        if not event_id:
            return generate_response(400, {"msg": "eventId required"})

        
        table.delete_item(
            Key={
                "PK": f"EVENT#{event_id}",
                "SK": "METADATA"
            }
        )

        logger.info("Event deleted", extra={"eventId": event_id})
        return generate_response(200, {"msg": "Event deleted"})

    except Exception:
        logger.exception("Failed to delete event")
        tracer.put_annotation("error_type", "unhandled")
        return generate_response(500, {"msg": "Internal server error"})
    
    
    
def assign_user_to_event(event):
    admin_id, role = _auth_context(event)

    if role != "ADMIN":
        return generate_response(403, {"msg": "Forbidden"})

    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("userId")
        event_id = body.get("eventId")

        if not user_id or not event_id:
            return generate_response(400, {"msg": "userId and eventId required"})

        item = {
            "PK": f"USER#{user_id}",
            "SK": f"EVENT#{event_id}",
            "GSI1PK": f"EVENT#{event_id}",
            "GSI1SK": f"USER#{user_id}",
            "status": "CONFIRMED",
            "assignedBy": admin_id,
            "assignedAt": datetime.utcnow().isoformat(),
        }

        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(PK) AND attribute_not_exists(SK)"
        )

        logger.info("User assigned to event", extra={"userId": user_id, "eventId": event_id})
        return generate_response(201, {"msg": "User assigned to event", "assignment": item})

    except Exception:
        logger.exception("Failed to assign user to event")
        return generate_response(500, {"msg": "Internal server error"})


# ---------------- remove user ----------------
def remove_user_from_event(event):
    admin_id, role = _auth_context(event)

    if role != "ADMIN":
        return generate_response(403, {"msg": "Forbidden"})

    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("userId")
        event_id = body.get("eventId")

        if not user_id or not event_id:
            return generate_response(400, {"msg": "userId and eventId required"})

        table.delete_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"EVENT#{event_id}"
            }
        )

        logger.info("User removed from event", extra={"userId": user_id, "eventId": event_id})
        return generate_response(200, {"msg": "User removed from event"})

    except Exception:
        logger.exception("Failed to remove user from event")
        return generate_response(500, {"msg": "Internal server error"})