"""added type and comment to actuals

Revision ID: 517995b4dc57
Revises: 57a391b03b74
Create Date: 2025-12-22 19:30:24.922200

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '517995b4dc57'
down_revision: Union[str, Sequence[str], None] = '57a391b03b74'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
