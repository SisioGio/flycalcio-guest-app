from handler import lambda_handler

import json
import random
from utils import generate_refresh_token
def create_event(method,path,body,cookies=None):
    event = {
        'headers':{'Cookie':cookies,'Origin':"http://localhost:3000"},
        'methodArn':"method arn",
        "cookies":cookies,
        'httpMethod':method,
        'path':path,
        'body':json.dumps(body)
    }
    return event


def test_register(email,password):
    body = {
        'email':email,
        "password":password
    }
    event = create_event('POST','/auth/register',body)
    response = lambda_handler(event,None)
    print(response)
    return response
    

def test_login(email,password):
    body = {
        'email':email,
        "password":password
    }
    event = create_event('POST','/auth/login',body)
    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token

def test_reset_refresh_token(email,passwordc,cookies):
    body = {
        'email':email,
        "password":password
    }
    event = create_event('POST','/auth/login',body,cookies=cookies)
    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token


def test_login_google(token):
    body = {
        'google_token':token
    }
    event = create_event('POST','/auth/google',body)
    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token


def test_refresh_token(event):


    response = lambda_handler(event,None)
    print(response)
    body = json.loads(response['body'])
    
    access_token = body['access_token']
    refresh_token = body['refresh_token']
    return access_token,refresh_token

def create_admin():

    email = "alessio@gmail.com"
    password = "password"

    response = test_register(email,password)

    access_token,refresh_token = test_login(email,password)
    
    access_token,refresh_token = test_refresh_token(event=create_event('POST','/auth/refresh',{'refresh_token':refresh_token},cookies=f"refresh_token={refresh_token}"))
    
def create_user():

    email = "user@gmail.com"
    password = "password"

    response = test_register(email,password)

    access_token,refresh_token = test_login(email,password)
    
    access_token,refresh_token = test_refresh_token(event=create_event('POST','/auth/refresh',{'refresh_token':refresh_token},cookies=f"refresh_token={refresh_token}"))
    
if __name__ == "__main__":

    create_user()