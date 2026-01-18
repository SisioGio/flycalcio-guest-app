import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from utils import get_secret

# Global connection to reuse across Lambda invocations
_conn = None

def get_connection():
    global _conn
    db_secret_name = os.getenv("DB_SECRET_NAME","rds!db-efc52989-89c8-4009-a2c3-e211a33ba1bd")
    
    db_secret = get_secret(db_secret_name)
    if _conn is None or _conn.closed:
        _conn = psycopg2.connect(
            host=os.environ["DB_HOST"],
            database=os.environ["DB_NAME"],
            user=os.environ["DB_USER"],
            password=db_secret["password"],
            cursor_factory=RealDictCursor
        )
    return _conn

def execute_query(query, params=None, fetch=True, commit=False):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            result = cur.fetchall() if fetch else None
        if commit:
            conn.commit()
        return result
    except Exception as e:
        # Rollback to reset transaction state
        conn.rollback()
        raise
