"""initial tables

Revision ID: 0001_initial_tables
Revises: 
Create Date: 2026-07-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Use SQLModel metadata to create all tables
    from app.core.database import engine
    from app.models import entities as models
    models.SQLModel.metadata.create_all(engine)


def downgrade():
    from app.core.database import engine
    from app.models import entities as models
    models.SQLModel.metadata.drop_all(engine)
