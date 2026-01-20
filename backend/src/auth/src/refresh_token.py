import json
from db import execute_query
from utils import verify_password, generate_access_token, generate_refresh_token,generate_response,get_secret,decode_token,get_cookie
import jwt
import os
from dotenv import load_dotenv
load_dotenv()


ACCESS_TOKEN_EXPIRATION= os.environ.get("ACCESS_TOKEN_EXPIRATION",600)
REFRESH_TOKEN_EXPIRATION= os.environ.get("REFRESH_TOKEN_EXPIRATION",600)


def refresh_access_token(event,context):
    try:

        # refresh_token = get_cookie(event, "refresh_token")
        refresh_token = json.loads(event['body'])['refresh_token']
        decoded = decode_token(refresh_token,'refresh')
        principal_id = decoded['id']
        email = decoded['email']
        role = decoded['role']
        access_token = generate_access_token(principal_id,email,role,duration=int(ACCESS_TOKEN_EXPIRATION))
        refresh_token = generate_refresh_token(principal_id,email,role,duration=int(REFRESH_TOKEN_EXPIRATION))
        
        
        return generate_response(200,{
                'msg':'new_token',
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            access_token=access_token,refresh_token=refresh_token,event=event)
        
    except jwt.ExpiredSignatureError:
        return generate_response(401, {"error": "Refresh token expired"},event=event)

    except jwt.InvalidTokenError:
        return generate_response(401, {"error": "Invalid refresh token"},event=event)