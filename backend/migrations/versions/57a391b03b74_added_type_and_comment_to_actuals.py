"""added type and comment to actuals

Revision ID: 57a391b03b74
Revises: 59e818e3c590
Create Date: 2025-12-22 19:29:02.365757

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '57a391b03b74'
down_revision: Union[str, Sequence[str], None] = '59e818e3c590'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
    """
    ALTER TABLE actuals
    ADD COLUMN type TEXT
    """
    )
    op.execute(
    """
    ALTER TABLE actuals
    ADD COLUMN comment TEXT
    """
    )
    pass


def downgrade() -> None:
    op.execute("""
               ALTER TABLE actuals
               DROP CONSTRAINT IF EXISTS  type
               """)
    op.execute("""
               ALTER TABLE actuals
               DROP COLUMN IF EXISTS comment
               
               """)
