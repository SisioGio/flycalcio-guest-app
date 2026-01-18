import json
from utils import  get_secret,JWT_REFRESH_NAME,JWT_SECRET_NAME
from src.register import register_user
from src.login import login_user
from src.loging_google import login_google
from src.refresh_token import refresh_access_token
from utils import generate_response

# from src.verify_account import verify_account
# from src.send_confirmation_email import send_confirmation_email
# from src.refresh_token import refresh_access_token
# from src.request_reset import request_password_reset
# from src.reset_password import reset_password



def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path")

    if method == 'POST' and path == '/auth/register':
        return register_user(event)
    if method == 'POST' and path == '/auth/login':
        return login_user(event)
    if method == 'POST' and path == '/auth/google':
        return login_google(event)
    
    # if method == 'POST' and path == '/auth/confirm':
    #     return verify_account(event)
    # if method == 'GET' and path == '/auth/confirm':
    #     return send_confirmation_email(event)
    if method == 'POST' and path == '/auth/refresh':
        return refresh_access_token(event)
    # if method == 'POST' and path == '/auth/request-password-reset':
    #     return request_password_reset(event)
    # if method == 'POST' and path == '/auth/reset-password':
    #     return reset_password(event)
    
    return generate_response(400, {"msg": "Invalid route or method.", "event": event},event=event)



