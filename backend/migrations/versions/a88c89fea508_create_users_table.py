"""create users table

Revision ID: a88c89fea508
Revises: 
Create Date: 2025-12-20 10:19:41.771984

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a88c89fea508'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.execute("""
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    # Refresh tokens
    op.execute("""
    CREATE TABLE refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(512) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
    );
    """)
    
    # Entries (planned recurring or one-time expenses/incomes)
    op.execute("""
    CREATE TABLE entries (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'income' or 'expense'
        frequency VARCHAR(50), -- 'recurring', 'one-time', etc.
        start_date DATE NOT NULL,
        end_date DATE,
        amount NUMERIC(12, 2) NOT NULL,
        scenario_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    # Actuals (user-entered actual amounts)
    op.execute("""
    CREATE TABLE actuals (
        id SERIAL PRIMARY KEY,
        entry_id INT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        actual_date DATE NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Scenario table
    op.execute("""
    CREATE TABLE scenarios (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Overview / Forecast table
    op.execute("""
            CREATE TABLE forecasts (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            scenario_id INT REFERENCES scenarios(id) ON DELETE SET NULL,
            period_start DATE NOT NULL,   -- start of the period
            period_end DATE NOT NULL,     -- end of the period
            period_type VARCHAR(10) NOT NULL, -- 'day', 'week', 'month'
            opening_balance NUMERIC(12,2) DEFAULT 0,
            total_income NUMERIC(12,2) DEFAULT 0,
            total_expense NUMERIC(12,2) DEFAULT 0,
            net_balance NUMERIC(12,2) DEFAULT 0, -- total_income - total_expense
            closing_balance NUMERIC(12,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    

def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS overviews CASCADE;")
    op.execute("DROP TABLE IF EXISTS scenarios CASCADE;")
    op.execute("DROP TABLE IF EXISTS actuals CASCADE;")
    op.execute("DROP TABLE IF EXISTS entries CASCADE;")
    op.execute("DROP TABLE IF EXISTS refresh_tokens CASCADE;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")
