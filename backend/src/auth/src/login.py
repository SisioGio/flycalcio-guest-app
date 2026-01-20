import json
from db import execute_query
from utils import verify_password, generate_access_token, generate_refresh_token,generate_response,tracer,logger,hash_password
import os
from dotenv import load_dotenv
import boto3
from boto3.dynamodb.conditions import Key
load_dotenv()

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["DB_TABLE"])




ACCESS_TOKEN_EXPIRATION= os.environ.get("ACCESS_TOKEN_EXPIRATION",120)
REFRESH_TOKEN_EXPIRATION= os.environ.get("REFRESH_TOKEN_EXPIRATION",600)

@tracer.capture_lambda_handler
def login(event: dict, context):
   
    try:
        logger.info("Login request received")
        if not event.get("body"):
            logger.warning("Missing body")
            return generate_response(400, {"msg": "Invalid request"}, event)

        body = json.loads(event["body"])
        email = body.get("email")
        password = body.get("password")

        if not email or not password:
            logger.warning("Missing credentials")
            return generate_response(
                400, {"msg": "Email and password required"}, event
            )

        # 🔍 Fetch user by email (GSI)
        response = table.query(
            IndexName="GSI1",
            KeyConditionExpression=(
                Key("GSI1PK").eq("USER") &
                Key("GSI1SK").eq(email)
            ),
            Limit=1
        )

        if response["Count"] == 0:
            logger.info("User not found", extra={"email": email})
            return generate_response(
                401, {"msg": "Invalid credentials"}, event
            )

        user = response["Items"][0]

        # 🔐 Password check
        if user["password"] != hash_password(password):
            logger.info("Invalid password", extra={"email": email})
            return generate_response(
                401, {"msg": "Invalid credentials"}, event
            )

        # if not user.get("confirmed", False):
        #     logger.info("User not confirmed", extra={"email": email})
        #     return generate_response(
        #         403, {"msg": "Account not confirmed"}, event
        #     )

        access_token=generate_access_token(user['userId'],email,user["role"],int(ACCESS_TOKEN_EXPIRATION))
        refresh_token = generate_refresh_token(user['userId'],email,user["role"],int(REFRESH_TOKEN_EXPIRATION))

        logger.info(
            "User logged in successfully",
            extra={"userId": user["userId"]}
        )

        return generate_response(200,{
                "msg": "Login successful",
                'access_token': access_token,
                'refresh_token': refresh_token,
                "user": {
                    "userId": user["userId"],
                    "email": user["email"],
                    "role": user["role"],
                }     })

    except Exception as e:
        logger.exception("Unhandled login error")
        tracer.put_annotation("error_type", "unhandled")
        return generate_response(
            500,
            {"msg": "Internal server error"},
            event
        )
    try:
        data = json.loads(event["body"])
        email = data["email"]
        password = data["password"]

        query = "SELECT * FROM users WHERE email=%s;"
        users = execute_query(query, (email,))
        if not users:
            return generate_response(401,{"msg": "Invalid credentials"},event=event)


        user = users[0]
        if not verify_password(password, user["password_hash"]):

            return generate_response(401,{"msg": "Invalid credentials"},event=event)
        access_token = generate_access_token(user["id"],user['email'],duration=int(ACCESS_TOKEN_EXPIRATION))
        refresh_token = generate_refresh_token(user["id"],user['email'],duration=int(REFRESH_TOKEN_EXPIRATION))
        return generate_response(200,{
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            access_token=access_token,refresh_token=refresh_token,event=event)
        
    except Exception as e:
    
        return generate_response(500,{"msg": str(e)},event=event)