"""unique constraint voto por residente

Revision ID: 0002_unique_vote_constraint
Revises: 0001_initial_tables
Create Date: 2026-07-17 22:45:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_unique_vote_constraint'
down_revision = '0001_initial_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Agregamos la restricción única a la tabla voterecord
    op.create_unique_constraint('uq_vote_per_resident', 'voterecord', ['voting_id', 'residente_id'])


def downgrade():
    # Eliminamos la restricción única
    op.drop_constraint('uq_vote_per_resident', 'voterecord', type_='unique')
