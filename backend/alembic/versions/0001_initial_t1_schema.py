"""initial t1 schema

Revision ID: 0001
Revises: 
Create Date: 2026-09-25 10:35:18.544532
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql

revision: str = '0001'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('display_name', sa.String(length=100), nullable=False),
    sa.Column('bio', sa.String(length=500), nullable=True),
    sa.Column('role', sa.String(length=20), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('updated_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_users')),
    sa.UniqueConstraint('email', name=op.f('uq_users_email'))
    )
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    op.create_table('events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=120), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('rules', sa.Text(), nullable=True),
    sa.Column('location', sa.String(length=200), nullable=True),
    sa.Column('website_url', sa.String(length=500), nullable=True),
    sa.Column('registration_opens_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=True),
    sa.Column('registration_closes_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=True),
    sa.Column('starts_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('ends_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('submission_deadline', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('max_team_size', sa.Integer(), nullable=False),
    sa.Column('is_published', sa.Boolean(), nullable=False),
    sa.Column('published_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=True),
    sa.Column('organizer_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('updated_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.ForeignKeyConstraint(['organizer_id'], ['users.id'], name=op.f('fk_events_organizer_id_users'), ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_events')),
    sa.UniqueConstraint('slug', name=op.f('uq_events_slug'))
    )
    op.create_index(op.f('ix_events_is_published'), 'events', ['is_published'], unique=False)
    op.create_index(op.f('ix_events_organizer_id'), 'events', ['organizer_id'], unique=False)

    op.create_table('sessions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('token_hash', sa.String(length=64), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('expires_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_sessions_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_sessions')),
    sa.UniqueConstraint('token_hash', name=op.f('uq_sessions_token_hash'))
    )
    op.create_index(op.f('ix_sessions_expires_at'), 'sessions', ['expires_at'], unique=False)
    op.create_index(op.f('ix_sessions_user_id'), 'sessions', ['user_id'], unique=False)

    op.create_table('event_prizes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=150), nullable=False),
    sa.Column('description', sa.String(length=500), nullable=True),
    sa.Column('amount', sa.Integer(), nullable=True),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_event_prizes_event_id_events'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_prizes'))
    )
    op.create_index(op.f('ix_event_prizes_event_id'), 'event_prizes', ['event_id'], unique=False)

    op.create_table('event_registrations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_event_registrations_event_id_events'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_event_registrations_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_registrations')),
    sa.UniqueConstraint('event_id', 'user_id', name=op.f('uq_event_registrations_event_id_user_id'))
    )
    op.create_index(op.f('ix_event_registrations_user_id'), 'event_registrations', ['user_id'], unique=False)

    op.create_table('event_tracks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.String(length=500), nullable=True),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_event_tracks_event_id_events'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_event_tracks')),
    sa.UniqueConstraint('event_id', 'name', name=op.f('uq_event_tracks_event_id_name'))
    )
    op.create_table('submission_questions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('prompt', sa.String(length=500), nullable=False),
    sa.Column('help_text', sa.String(length=500), nullable=True),
    sa.Column('is_required', sa.Boolean(), nullable=False),
    sa.Column('max_length', sa.Integer(), nullable=False),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_submission_questions_event_id_events'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_submission_questions'))
    )
    op.create_index(op.f('ix_submission_questions_event_id'), 'submission_questions', ['event_id'], unique=False)

    op.create_table('teams',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('captain_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('updated_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.ForeignKeyConstraint(['captain_id'], ['users.id'], name=op.f('fk_teams_captain_id_users'), ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_teams_event_id_events'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_teams')),
    sa.UniqueConstraint('event_id', 'name', name=op.f('uq_teams_event_id_name'))
    )
    op.create_index(op.f('ix_teams_captain_id'), 'teams', ['captain_id'], unique=False)

    op.create_table('submissions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('team_id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.Column('tagline', sa.String(length=300), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
    sa.Column('demo_video_url', sa.String(length=500), nullable=True),
    sa.Column('repo_url', sa.String(length=500), nullable=True),
    sa.Column('live_url', sa.String(length=500), nullable=True),
    sa.Column('track_id', sa.Integer(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('submitted_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=True),
    sa.Column('created_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('updated_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_submissions_event_id_events'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['team_id'], ['teams.id'], name=op.f('fk_submissions_team_id_teams'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['track_id'], ['event_tracks.id'], name=op.f('fk_submissions_track_id_event_tracks'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_submissions')),
    sa.UniqueConstraint('team_id', name=op.f('uq_submissions_team_id'))
    )
    op.create_index(op.f('ix_submissions_event_id'), 'submissions', ['event_id'], unique=False)
    op.create_index('ix_submissions_status_submitted_at', 'submissions', ['status', 'submitted_at'], unique=False)
    op.create_index(op.f('ix_submissions_track_id'), 'submissions', ['track_id'], unique=False)

    op.create_table('team_invitations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('team_id', sa.Integer(), nullable=False),
    sa.Column('token_hash', sa.String(length=64), nullable=False),
    sa.Column('created_by_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('expires_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.Column('accepted_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=True),
    sa.Column('accepted_by_id', sa.Integer(), nullable=True),
    sa.Column('revoked_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=True),
    sa.ForeignKeyConstraint(['accepted_by_id'], ['users.id'], name=op.f('fk_team_invitations_accepted_by_id_users'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], name=op.f('fk_team_invitations_created_by_id_users'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['team_id'], ['teams.id'], name=op.f('fk_team_invitations_team_id_teams'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_team_invitations')),
    sa.UniqueConstraint('token_hash', name=op.f('uq_team_invitations_token_hash'))
    )
    op.create_index(op.f('ix_team_invitations_accepted_by_id'), 'team_invitations', ['accepted_by_id'], unique=False)
    op.create_index(op.f('ix_team_invitations_created_by_id'), 'team_invitations', ['created_by_id'], unique=False)
    op.create_index(op.f('ix_team_invitations_team_id'), 'team_invitations', ['team_id'], unique=False)

    op.create_table('team_members',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('team_id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('joined_at', sa.DateTime().with_variant(mysql.DATETIME(fsp=6), 'mysql'), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_team_members_event_id_events'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['team_id'], ['teams.id'], name=op.f('fk_team_members_team_id_teams'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_team_members_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_team_members')),
    sa.UniqueConstraint('event_id', 'user_id', name=op.f('uq_team_members_event_id_user_id'))
    )
    op.create_index(op.f('ix_team_members_team_id'), 'team_members', ['team_id'], unique=False)
    op.create_index(op.f('ix_team_members_user_id'), 'team_members', ['user_id'], unique=False)

    op.create_table('submission_answers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('submission_id', sa.Integer(), nullable=False),
    sa.Column('question_id', sa.Integer(), nullable=False),
    sa.Column('answer', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['question_id'], ['submission_questions.id'], name=op.f('fk_submission_answers_question_id_submission_questions'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['submission_id'], ['submissions.id'], name=op.f('fk_submission_answers_submission_id_submissions'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_submission_answers')),
    sa.UniqueConstraint('submission_id', 'question_id', name=op.f('uq_submission_answers_submission_id_question_id'))
    )
    op.create_index(op.f('ix_submission_answers_question_id'), 'submission_answers', ['question_id'], unique=False)

    op.create_table('submission_images',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('submission_id', sa.Integer(), nullable=False),
    sa.Column('url', sa.String(length=500), nullable=False),
    sa.Column('sort_order', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['submission_id'], ['submissions.id'], name=op.f('fk_submission_images_submission_id_submissions'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_submission_images'))
    )
    op.create_index(op.f('ix_submission_images_submission_id'), 'submission_images', ['submission_id'], unique=False)

    op.create_table('submission_tags',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('submission_id', sa.Integer(), nullable=False),
    sa.Column('tag', sa.String(length=50), nullable=False),
    sa.ForeignKeyConstraint(['submission_id'], ['submissions.id'], name=op.f('fk_submission_tags_submission_id_submissions'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_submission_tags')),
    sa.UniqueConstraint('submission_id', 'tag', name=op.f('uq_submission_tags_submission_id_tag'))
    )
    op.create_index(op.f('ix_submission_tags_tag'), 'submission_tags', ['tag'], unique=False)



def downgrade() -> None:
    op.drop_index(op.f('ix_submission_tags_tag'), table_name='submission_tags')

    op.drop_table('submission_tags')
    op.drop_index(op.f('ix_submission_images_submission_id'), table_name='submission_images')

    op.drop_table('submission_images')
    op.drop_index(op.f('ix_submission_answers_question_id'), table_name='submission_answers')

    op.drop_table('submission_answers')
    op.drop_index(op.f('ix_team_members_user_id'), table_name='team_members')
    op.drop_index(op.f('ix_team_members_team_id'), table_name='team_members')

    op.drop_table('team_members')
    op.drop_index(op.f('ix_team_invitations_team_id'), table_name='team_invitations')
    op.drop_index(op.f('ix_team_invitations_created_by_id'), table_name='team_invitations')
    op.drop_index(op.f('ix_team_invitations_accepted_by_id'), table_name='team_invitations')

    op.drop_table('team_invitations')
    op.drop_index(op.f('ix_submissions_track_id'), table_name='submissions')
    op.drop_index('ix_submissions_status_submitted_at', table_name='submissions')
    op.drop_index(op.f('ix_submissions_event_id'), table_name='submissions')

    op.drop_table('submissions')
    op.drop_index(op.f('ix_teams_captain_id'), table_name='teams')

    op.drop_table('teams')
    op.drop_index(op.f('ix_submission_questions_event_id'), table_name='submission_questions')

    op.drop_table('submission_questions')
    op.drop_table('event_tracks')
    op.drop_index(op.f('ix_event_registrations_user_id'), table_name='event_registrations')

    op.drop_table('event_registrations')
    op.drop_index(op.f('ix_event_prizes_event_id'), table_name='event_prizes')

    op.drop_table('event_prizes')
    op.drop_index(op.f('ix_sessions_user_id'), table_name='sessions')
    op.drop_index(op.f('ix_sessions_expires_at'), table_name='sessions')

    op.drop_table('sessions')
    op.drop_index(op.f('ix_events_organizer_id'), table_name='events')
    op.drop_index(op.f('ix_events_is_published'), table_name='events')

    op.drop_table('events')
    op.drop_index(op.f('ix_users_role'), table_name='users')

    op.drop_table('users')
