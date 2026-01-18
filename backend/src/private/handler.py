import json
from utils import generate_response
from db import execute_query



def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path")
    if path  == '/category':
        if method == 'GET':
            return get_category(event)
        if method == 'POST':
            return create_category(event)
        if method == 'PUT':
            return update_category(event)
        if method == 'DELETE':
            return delete_category(event)
    else:
        return generate_response(400, {"msg": "Invalid route or method.", "event": event},event=event)



def get_category(event):
    user_id = event['requestContext']['authorizer']['principalId']
    query = "SELECT * FROM category WHERE user_id = %s"
    result = execute_query(query, (user_id,))
    return generate_response(200, {"data": result},event=event)


def update_category(event):
    user_id = event['requestContext']['authorizer']['principalId']
    body = json.loads(event.get('body', '{}'))
    id = body.get('id')
    name = body.get('name')

    if not id:
        return generate_response(400, {"msg": "'id' is required to update a category."},event=event)

    query = """
        UPDATE category
        SET name = %s
        WHERE user_id = %s AND id = %s
        RETURNING *
    """
    result = execute_query(query, (name, user_id, id),commit=True)
    if not result:
        return generate_response(404, {"msg": "Category not found."},event=event)

    return generate_response(200, {"msg": "Category updated", "data": result},event=event)

def create_category(event):
    user_id = event['requestContext']['authorizer']['principalId']
    body = json.loads(event.get('body', '{}'))
    name = body.get('name')
    

    if not name:
        return generate_response(400, {"msg": "'name'  are required."},event=event)

    query = """
        INSERT INTO category (user_id, name)
        VALUES (%s, %s)
        RETURNING *
    """
    result = execute_query(query, (user_id, name),commit=True)
    return generate_response(201, {"msg": "category created", "data": result},event=event)

def delete_category(event):
    user_id = event['requestContext']['authorizer']['principalId']
    body = json.loads(event.get('body', '{}'))
    id = body.get('id')

    if not id:
        return generate_response(400, {"msg": "'id' is required to delete a category."},event=event)

    query = "DELETE FROM category WHERE user_id = %s AND id = %s RETURNING *"
    result = execute_query(query, (user_id, id),commit=True)
    print(user_id)
    if not result:
        return generate_response(404, {"msg": "category not found."},event=event)

    return generate_response(200, {"msg": "category deleted", "data": result},event=event)