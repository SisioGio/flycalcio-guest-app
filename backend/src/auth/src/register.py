import json

from utils import hash_password, send_email,generate_response,tracer,logger
import uuid
from datetime import datetime
from boto3.dynamodb.conditions import Key
import boto3
import os
from dotenv import load_dotenv
load_dotenv()

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DB_TABLE"])


@tracer.capture_lambda_handler
def register_user(event,context):
    try:
        logger.info("Incoming request", extra={"event": event})
        if "body" not in event or not event["body"]:
            logger.warning("Missing request body")
            return generate_response(400, {"msg": "Invalid request"}, event)

        data = json.loads(event["body"])
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            logger.warning("Missing email or password")
            return generate_response(400, {"msg": "Email and password are required"}, event)

        # 🔍 Check if user already exists (GSI)
        existing_user = table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq("USER") & Key("GSI1SK").eq(email),
            Limit=1
        )

        if existing_user["Count"] > 0:
            logger.info("User already exists", extra={"email": email})
            return generate_response(409, {"msg": "User already exists"}, event)

        user_id = str(uuid.uuid4())
        hashed_password = hash_password(password)

        item = {
            "PK": f"USER#{user_id}",
            "SK": "PROFILE",
            "GSI1PK": "USER",
            "GSI1SK": email,
            "userId": user_id,
            "email": email,
            "password": hashed_password,
            "role": "USER",
            "createdAt": datetime.utcnow().isoformat(),
            "confirmed": False,
        }

        #  DynamoDB write (traced)

        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(PK)"
        )

        send_email(
            email,
            "Welcome to FlyCalcio",
            "Please confirm your account."
        )

        logger.info(
            "User registered successfully",
            extra={"userId": user_id, "email": email}
        )

        return generate_response(
            201,
            {"msg": "User registered successfully"},
            event
        )


    except Exception as e:
        logger.exception("Unhandled error during registration")
        tracer.put_annotation("error_type", "unhandled")
        return generate_response(
            500,
            {"msg": "Internal server error"},
            event
        )


