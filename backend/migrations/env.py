import os
from alembic import context
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()
# Example using environment variables
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST")
DB_NAME = os.environ.get("DB_NAME")
DB_PORT = os.environ.get("DB_PORT", 5432)

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)

def run_migrations_offline():
    url = DATABASE_URL
    context.configure(url=url, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine.connect()
    context.configure(connection=connectable)
    with connectable.begin() as connection:
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
