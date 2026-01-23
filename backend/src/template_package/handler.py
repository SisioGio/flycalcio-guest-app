import json
from .src.register import register_user
from .src.login import login_user
from common.utils import generate_response
# from src.verify_account import verify_account
# from src.send_confirmation_email import send_confirmation_email
# from src.refresh_token import refresh_access_token
# from src.request_reset import request_password_reset
# from src.reset_password import reset_password



def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path")

    if method == 'GET' and path == '/scenario':
        return get_scenario(event)
    if method == 'POST' and path == '/scenario':
        return create_scenaro(event)
    if method == 'PUT' and path == '/scenario':
        return update_scenario(event)
    if method == 'DELETE' and path == '/scenario':
        return delete_scenario(event)

    
    return generate_response(400, {"msg": "Invalid route or method."})



def create_scenaro(event):
    pass


def get_scenario(event):
    pass

def update_scenario(event):
    pass

def delete_scenario(event):
    pass