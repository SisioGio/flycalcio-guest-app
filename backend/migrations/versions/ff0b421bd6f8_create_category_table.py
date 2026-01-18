"""create category table

Revision ID: ff0b421bd6f8
Revises: a88c89fea508
Create Date: 2025-12-21 21:57:24.786757

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ff0b421bd6f8'
down_revision: Union[str, Sequence[str], None] = 'a88c89fea508'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create category table
    op.execute("""
        CREATE TABLE category (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    """)

    # Add category_id to entries
    op.execute("""
        ALTER TABLE entries
        ADD COLUMN category_id INTEGER;
    """)

    op.execute("""
        ALTER TABLE entries
        ADD CONSTRAINT fk_entries_category
        FOREIGN KEY (category_id)
        REFERENCES category(id)
        ON DELETE CASCADE;
    """)

    # Add category_id to actuals
    op.execute("""
        ALTER TABLE actuals
        ADD COLUMN category_id INTEGER;
    """)

    op.execute("""
        ALTER TABLE actuals
        ADD CONSTRAINT fk_actuals_category
        FOREIGN KEY (category_id)
        REFERENCES category(id)
        ON DELETE CASCADE;
    """)


def downgrade() -> None:
    # Drop constraints and columns from actuals
    op.execute("""
        ALTER TABLE actuals
        DROP CONSTRAINT IF EXISTS fk_actuals_category;
    """)

    op.execute("""
        ALTER TABLE actuals
        DROP COLUMN IF EXISTS category_id;
    """)

    # Drop constraints and columns from entries
    op.execute("""
        ALTER TABLE entries
        DROP CONSTRAINT IF EXISTS fk_entries_category;
    """)

    op.execute("""
        ALTER TABLE entries
        DROP COLUMN IF EXISTS category_id;
    """)

    # Drop category table
    op.execute("""
        DROP TABLE IF EXISTS category;
    """)
