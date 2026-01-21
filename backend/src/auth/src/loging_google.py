import json

from utils import verify_password, generate_access_token, generate_refresh_token,generate_response
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
import os
load_dotenv()


ACCESS_TOKEN_EXPIRATION= os.environ.get("ACCESS_TOKEN_EXPIRATION",600)
REFRESH_TOKEN_EXPIRATION= os.environ.get("REFRESH_TOKEN_EXPIRATION",600)



def login_google(event):
    try:
        data = json.loads(event["body"])
        google_token = data["google_token"]
        idinfo = id_token.verify_oauth2_token(
            google_token,
            requests.Request(),
            audience=os.getenv("GOOGLE_CLIENT_ID")
        )

        email = idinfo.get("email")
        

        access_token = generate_access_token(id,email,duration=int(ACCESS_TOKEN_EXPIRATION))
        refresh_token = generate_refresh_token(id,email,duration=int(REFRESH_TOKEN_EXPIRATION))
        response = generate_response(200,{
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            access_token=access_token,refresh_token=refresh_token,event=event)
        print(response)

        return response
        
    except Exception as e:
        print(e)
        return generate_response(500,{"msg": str(e)},event=event)
    except ValueError as e:
        # Token verification failed
        print(e)
        return generate_response(500,{"msg": "Invalid Google token"},event=event)
    except Exception as e:
        print(e)
        return generate_response(500,{"msg": str(e)},event=event)