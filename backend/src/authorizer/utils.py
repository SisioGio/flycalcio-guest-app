


import boto3
import json
import os




def get_secret(secret_name: str, region_name: str = "eu-central-1"):
    """
    Fetch a secret's value from AWS Secrets Manager by name.
    Returns the secret as a dict if it's JSON, otherwise a string.
    """

    client = boto3.client("secretsmanager", region_name=region_name)

    try:
        response = client.get_secret_value(SecretId=secret_name)
    except client.exceptions.ResourceNotFoundException:
        raise Exception(f"Secret '{secret_name}' not found")
    except Exception as e:
        raise Exception(f"Error retrieving secret: {e}")

    # The secret is in the "SecretString" key
    secret = response["SecretString"]

    # Try to parse JSON secrets automatically
    try:
        return json.loads(secret)
    except json.JSONDecodeError:
        return secret

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

   