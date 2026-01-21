import json
from utils import  get_secret,JWT_REFRESH_NAME,JWT_SECRET_NAME
from src.register import register_user
from src.login import login
from src.loging_google import login_google
from src.refresh_token import refresh_access_token
from utils import generate_response




def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path")

    if method == 'POST' and path == '/auth/register':
        return register_user(event,context)
    if method == 'POST' and path == '/auth/login':
        return login(event,context)
    if method == 'POST' and path == '/auth/google':
        return login_google(event,context)

    if method == 'POST' and path == '/auth/refresh':
        return refresh_access_token(event,context)

    
    return generate_response(400, {"msg": "Invalid route or method.", "event": event},event=event)



