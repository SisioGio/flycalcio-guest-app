"""linked category to user

Revision ID: 72e5e6d676e5
Revises: ff0b421bd6f8
Create Date: 2025-12-21 22:04:08.953056

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '72e5e6d676e5'
down_revision: Union[str, Sequence[str], None] = 'ff0b421bd6f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
              ALTER TABLE category
              ADD COLUMN user_id INTEGER
               
               """)
    op.execute("""
               ALTER TABLE category
               ADD CONSTRAINT fk_category_user
               FOREIGN KEY (user_id)
               REFERENCES users(id)
               ON DELETE CASCADE
               """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""
               ALTER TABLE category
               DROP CONSTRAINT IF EXISTS  fk_category_user
               """)
    op.execute("""
               ALTER TABLE category
               DROP COLUMN IF EXISTS user_id
               
               """)