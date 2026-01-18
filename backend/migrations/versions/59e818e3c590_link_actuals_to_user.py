"""link actuals to user

Revision ID: 59e818e3c590
Revises: 72e5e6d676e5
Create Date: 2025-12-22 19:13:02.961293

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '59e818e3c590'
down_revision: Union[str, Sequence[str], None] = '72e5e6d676e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
    """
    ALTER TABLE actuals
    ADD COLUMN user_id INT
    """
    )
    op.execute(
        """
        ALTER TABLE actuals
        ADD CONSTRAINT fk_actuals_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        
        """
    )
    


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""
               ALTER TABLE actuals
               DROP CONSTRAINT IF EXISTS  fk_actuals_user
               """)
    op.execute("""
               ALTER TABLE actuals
               DROP COLUMN IF EXISTS user_id
               
               """)
