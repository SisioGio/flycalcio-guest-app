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
import pandas as pd
load_dotenv()

from aws_lambda_powertools import Logger, Tracer

logger = Logger(service="finance-app")
tracer = Tracer(service="finance-app")


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

def generate_access_token(user_id,email,duration):
    JWT_SECRET = get_secret(JWT_SECRET_NAME)
    return jwt.encode({"id": user_id,"email":email,"iat":datetime.utcnow() ,"exp":datetime.utcnow() + timedelta(seconds=duration)}, JWT_SECRET, algorithm="HS256")

def decode_token(token,token_type='access',algorithms=["HS256"]):
    secret_name = JWT_SECRET_NAME if token_type == "access" else JWT_REFRESH_NAME
    
    jwt_secret = get_secret(secret_name)
    decoded=jwt.decode(token,jwt_secret,algorithms=algorithms)
    return decoded
    
def generate_refresh_token(user_id,email,duration):
    jwt_secret = get_secret(JWT_REFRESH_NAME)
    payload ={"id": user_id, "email":email,"type": "refresh","iat":datetime.utcnow() ,"exp":datetime.utcnow() + timedelta(seconds=duration)}
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

   

def expand_entries(entries, start_date, forecast_length, time_frame="monthly"):
    # Determine end date of forecast
    if time_frame == "daily":
        end_date = start_date + timedelta(days=forecast_length-1)
    elif time_frame == "weekly":
        end_date = start_date + timedelta(weeks=forecast_length-1)
    elif time_frame == "monthly":
        end_date = start_date + relativedelta(months=forecast_length-1)
    elif time_frame == "quarterly":
        end_date = start_date + relativedelta(months=3*forecast_length-1)
    elif time_frame == "yearly":
        end_date = start_date + relativedelta(years=forecast_length-1)
    else:
        raise ValueError("Invalid time_frame")
    all_occurrences = []
    
    start_date=start_date + relativedelta(days=1)
    for e in entries:
        freq= e['entry_frequency']
        e_start=e['entry_start_date']
        e_end = e['entry_end_date']
        e_name = e['entry_name']
        print(f"Expanding entry {e_name}: {e_start}-{e_end} ({freq})")
        if freq =='one_time':
            if start_date <= e_start <= end_date:
                print(f"Adding entry {e_name}")
                all_occurrences.append({**e,"occurrence_date":e_start})
            continue
        freq_map = {
                "daily": relativedelta(days=1),
                "weekly": relativedelta(weeks=1),
                "monthly": relativedelta(months=1),
                "quarterly": relativedelta(months=3),
                "yearly": relativedelta(years=1),
            }
        delta = freq_map[freq]
        current = e_start
        # If entry end date is within the period end date and current date is before the entry_end
        while (e_end is None or current <= e_end)  and current <= end_date:
            print(f"")
            if current >= start_date:
                print(f"Adding entry {e_name} for date {current}")
                all_occurrences.append({**e,"occurrence_date":current})
            current += delta
    df = pd.DataFrame(all_occurrences)
    if df.empty:
        return df

    # Annotate with calendar info
    df["occurrence_date"] = pd.to_datetime(df["occurrence_date"], errors="coerce")
    df["year"] = df["occurrence_date"].apply(lambda d: d.year)
    df["month"] = df["occurrence_date"].apply(lambda d: d.month)
    df["day"] = df["occurrence_date"].apply(lambda d: d.day)
    df["week_no"] = df["occurrence_date"].apply(lambda d: d.isocalendar()[1])
    
    return df


def get_user_balance(user_id):
    from db import execute_query
    row = execute_query("SELECT id, email,initial_balance FROM users WHERE id = %s",(user_id,))
    if not row or len(row) ==0:
        return 0
    row = row[0]
    initial_balance = row['initial_balance']
    return initial_balance

def get_user_actual_balance(user_id):
    from db import execute_query
    query="""
    SELECT
    u.initial_balance
    + COALESCE(
        SUM(
            CASE
                WHEN a.type = 'expense' THEN -a.amount
                ELSE a.amount
            END
        ),
        0
    ) AS current_balance
FROM users u
LEFT JOIN actuals a
    ON a.user_id = u.id
WHERE u.id = %s
GROUP BY u.initial_balance
"""
    row = execute_query(query,(user_id,))
    return row[0]['current_balance']
    
    
    
def aggregate_forecast(df,user_id, time_frame="monthly"):
    if df.empty:
        return []

    if time_frame == "daily":
        grouped = df.groupby("occurrence_date")
    elif time_frame == "weekly":
        grouped = df.groupby(["year", "week_no"])
    elif time_frame == "monthly":
        grouped = df.groupby(["year", "month"])
    elif time_frame == "quarterly":
        grouped = df.groupby([pd.Grouper(key="occurrence_date", freq="Q")])
    elif time_frame == "yearly":
        grouped = df.groupby("year")
    else:
        raise ValueError("Invalid time_frame")

    forecast = []
    initial_balance=get_user_actual_balance(user_id)
    balance = initial_balance
    
    forecast.append({
            "period_start": 'today',
            "period_end": 'today',
            "income":0,
            "expense":0,
            "profit_loss": 0,
            "opening_balance": float(balance),
            "closing_balance": float(balance),
            
        })
    
    for period, group in grouped:
        profit_loss = group.apply(
            lambda row: row["entry_amount"] if row["entry_type"] == "income" else -row["entry_amount"], axis=1
        ).sum()
        
        income = group.apply(
            lambda row: row["entry_amount"] if row["entry_type"] == "income" else 0, axis=1
        ).sum()
        expenses = group.apply(
            lambda row: row["entry_amount"] if row["entry_type"] == "expense" else 0, axis=1
        ).sum()
        period_start = group["occurrence_date"].min()
        period_end = group["occurrence_date"].max()
        
        opening_balance = balance
        closing_balance = balance + profit_loss
        balance = closing_balance
        
        forecast.append({
            "period_start": period_start.strftime("%b %d, %Y"),
            "period_end": period_end.strftime("%b %d, %Y"),
            "label": f"{period_start.strftime('%b %d')} – {period_end.strftime('%b %d, %Y')}",
            "income": float(income),
            "expense": float(expenses),
            "profit_loss": float(profit_loss),
            "opening_balance": float(opening_balance),
            "closing_balance": float(closing_balance),
            "entries": group.to_dict(orient="records")
            })

    return forecast

    



