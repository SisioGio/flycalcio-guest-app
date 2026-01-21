import hashlib
import hmac
import jwt
import os
import boto3
from botocore.exceptions import ClientError
import json
from dotenv import load_dotenv
from datetime import datetime, date
from decimal import Decimal
from dateutil.relativedelta import relativedelta
from datetime import date, timedelta

load_dotenv()

from aws_lambda_powertools import Logger, Tracer

logger = Logger(service="flycalcio-app")
tracer = Tracer(service="flycalcio-app")


def get_secret(secret_name, region_name="eu-central-1"):
    """
    Retrieve a secret from AWS Secrets Manager
    """
    # Create a Secrets Manager client
    client = boto3.client("secretsmanager", region_name=region_name)

    try:
        response = client.get_secret_value(SecretId=secret_name)
    except ClientError as e:
        raise e
    else:
        # Secret is stored either as string or binary
        if 'SecretString' in response:
            try:
                return json.loads(response['SecretString'])
            except Exception:
                return response['SecretString']
        else:
            import base64
            return json.loads(base64.b64decode(response['SecretBinary']))
JWT_SECRET_NAME = os.environ.get("JWT_SECRET_NAME",'finalyze-jwtkey-dev-secret')
JWT_REFRESH_NAME= os.environ.get("JWT_REFRESH_SECRET_NAME",'finalyze-jwt-refresh-key-dev-secret')



def end_of_month(d: date) -> date:
    return (d.replace(day=1) + relativedelta(months=1)) - timedelta(days=1)

def start_of_month(d: date) -> date:
    return d.replace(day=1)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    return hash_password(password) == hashed

def generate_access_token(user_id,email,role,duration):
    JWT_SECRET = get_secret(JWT_SECRET_NAME)
    return jwt.encode({"id": user_id,"email":email,'role':role,"iat":datetime.utcnow() ,"exp":datetime.utcnow() + timedelta(seconds=duration)}, JWT_SECRET, algorithm="HS256")

def decode_token(token,token_type='access',algorithms=["HS256"]):
    secret_name = JWT_SECRET_NAME if token_type == "access" else JWT_REFRESH_NAME
    
    jwt_secret = get_secret(secret_name)
    decoded=jwt.decode(token,jwt_secret,algorithms=algorithms)
    return decoded
    
def generate_refresh_token(user_id,email,role,duration):
    jwt_secret = get_secret(JWT_REFRESH_NAME)
    payload ={"id": user_id, "email":email,'role':role,"type": "refresh","iat":datetime.utcnow() ,"exp":datetime.utcnow() + timedelta(seconds=duration)}
    return jwt.encode(
        payload, 
        jwt_secret, 
        algorithm="HS256")

def send_email(to, subject, body):
    # placeholder for SES or other service
    print(f"Sending email to {to}: {subject}")
         
def serialize(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://finalyze.alessiogiovannini.com"
]



def generate_response(
    status_code,
    body,
    headers=None,
    access_token=None,
    refresh_token=None,
    event=None
):
    # ---- Origin handling ----
    origin = None
    if event and "headers" in event:
        origin = event["headers"].get("origin") or event["headers"].get("Origin")
    if origin is None:
        origin = os.getenv("DEFAULT_CORS_ORIGIN")
        
        
    print(f"Found origin: {origin}")

    # ---- Base CORS headers ----
    response_headers = {
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json"
    }

    if headers:
        response_headers.update(headers)

    if origin and origin in ALLOWED_ORIGINS:
        response_headers["Access-Control-Allow-Origin"] = origin
    else:
        print(f"Origin not allowed or missing: {origin}")

    # ---- Cookies (REST API requires multiValueHeaders) ----
    cookies = []

    if access_token:
        cookies.append(
            f"access_token={access_token}; "
            "HttpOnly; Secure; SameSite=None; Path=/"
        )

    if refresh_token:
        cookies.append(
            f"refresh_token={refresh_token}; "
            "HttpOnly; Secure; SameSite=None; Path=/dev/auth/refresh"
        )

    response = {
        "statusCode": status_code,
        "headers": response_headers,
        "body": json.dumps(body, default=serialize)
    }

    # IMPORTANT: only add multiValueHeaders if cookies exist
    # if cookies:
    #     response["multiValueHeaders"] = {
    #         "Set-Cookie": cookies
    #     }

    return response
  
    
def get_cookie(event, name):
    # HTTP API (v2)
    if "cookies" in event:
        for cookie in event["cookies"]:
            key, _, value = cookie.partition("=")
            if key == name:
                return value

    # REST API (v1)
    headers = event.get("headers", {})
    cookie_header = headers.get("Cookie") or headers.get("cookie")
    if not cookie_header:
        return None

    cookies = cookie_header.split(";")
    for c in cookies:
        key, _, value = c.strip().partition("=")
        if key == name:
            return value

    return None






