from handler import lambda_handler

import json
import random

def create_event(method,path,body):
    event = {
        'methodArn':"method arn",
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

if __name__ == "__main__":
    r_digit = random.randint(1,10000)
    email = f"test{r_digit}@gmail.com"
    password = f"test_{r_digit}"
    test_register(email,password)
    access_token,refresh_token = test_login(email,password)
    