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
    
    if path  == '/private/me' and method == 'GET':
        return get_user_data(event)
    if path  == '/private/events' and method == 'GET':
        return get_user_events(event)
    else:
        return generate_response(400, {"msg": "Invalid route or method.", "event": event},event=event)
@tracer.capture_method
def get_user_data(event):
    try:
        authorizer = event['requestContext']['authorizer']
        user_id = authorizer['principalId']
        role = authorizer.get('role')
        
        # Fetch user data from DynamoDB
        response = table.get_item(
            Key = {"PK":f"USER#{user_id}","SK":"PROFILE"}
        )
        if 'Item' not in response:
            logger.warning(f"User not found: {user_id}")
            return generate_response(404, {"msg": "User not found"}, event=event)
        user = response['Item']
        # Remove sensitive information
        user.pop('password', None)
        return generate_response(200, {"user": user}, event=event)
    
    except Exception as e:
        logger.exception(f"Error retrieving user data: {str(e)}")


@tracer.capture_method
def get_user_events(event):
    try:
        authorizer = event['requestContext']['authorizer']
        user_id = authorizer['principalId']
        role = authorizer.get('role')
        
        # Fetch user data from DynamoDB
        response = table.get_item(
            Key = {"PK":f"USER#{user_id}","SK":"PROFILE"}
        )
        if 'Item' not in response:
            logger.warning(f"User not found: {user_id}")
            return generate_response(404, {"msg": "User not found"}, event=event)
        user = response['Item']
        
        user_events_response = table.query(
            IndexName="GSI1",
            KeyConditionExpression=(
                Key("GSI1PK").eq(f"USER#{user_id}") &
                Key("GSI1SK").begins_with("EVENT#")
            ))
        
        
        events= user_events_response.get('Items', [])
        events = sorted(events, key=lambda x: x["date"], reverse=True)
        
        return generate_response(200, {"events": events}, event=event)
    
    except Exception as e:
        logger.exception(f"Error retrieving user data: {str(e)}")