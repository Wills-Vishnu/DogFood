import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, AlertCircle, Link2 } from 'lucide-react';
import { Alert, Badge, Button, Card, CardContent, CardHeader, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoRegisteredEvents } from '../../components/participant/ParticipantEventContext';
import { MainLayout } from '../../layouts/MainLayout';
import { teamsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { useParticipantEvents } from '../../hooks/useParticipantEvents';
import { INVITATION_STATUSES, formatDateTime, withEvent } from '../../utils/format';

const EXPIRY_OPTIONS = [
  { hours: 24, label: '1 day' },
  { hours: 72, label: '3 days' },
  { hours: 168, label: '7 days' },
  { hours: 336, label: '14 days' },
];

export const TeamInvitationPage = () => (
  <ProtectedPage roles={['participant']}>
    <TeamInvitations />
  </ProtectedPage>
);

const TeamInvitations = () => {
  const { user } = useAuth();
  const { current, loading, error, reload } = useParticipantEvents();

  if (loading) {
    return (
      <MainLayout>
        <PageSpinner />
      </MainLayout>
    );
  }
  if (error) {
    return (
      <MainLayout>
        <ErrorState title="Couldn't load your team" message={error.message} onRetry={reload} />
      </MainLayout>
    );
  }
  if (!current) {
    return (
      <MainLayout>
        <NoRegisteredEvents />
      </MainLayout>
    );
  }

  const { event, team } = current;
  const blocker = !team
    ? 'Create a team before inviting teammates.'
    : team.captain_id !== user.id
      ? 'Only the team captain can create invitations.'
      : null;

  if (blocker) {
    return (
      <MainLayout>
        <EmptyState
          icon={AlertCircle}
          title="Can't create invitations"
          description={blocker}
          action={
            <Link to={withEvent('/participant/team', event.id)}>
              <Button variant="primary">Back to Team</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }

  return <InvitationManager event={event} team={team} onTeamChanged={reload} />;
};

const InvitationManager = ({ event, team, onTeamChanged }) => {
  const [invitations, setInvitations] = useState([]);
  const [listError, setListError] = useState(null);
  const [expiresIn, setExpiresIn] = useState(72);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadInvitations = useCallback(async () => {
    try {
      setInvitations(await teamsApi.invitations(team.id));
      setListError(null);
    } catch (err) {
      setListError(err.message);
    }
  }, [team.id]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const spotsLeft = team.max_team_size - team.members.length;
  const canInvite = event.submissions_open && spotsLeft > 0;
  const inviteLink = generated ? `${window.location.origin}/invite/${generated.token}` : '';

  const handleGenerate = async () => {
    setGenerating(true);
    setNotice(null);
    setCopied(false);
    try {
      setGenerated(await teamsApi.createInvitation(team.id, expiresIn));
      await loadInvitations();
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
      onTeamChanged();
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice({ type: 'warning', message: 'Copy failed. Select the link and copy it manually.' });
    }
  };

  const handleRevoke = async invitation => {
    try {
      await teamsApi.revokeInvitation(team.id, invitation.id);
      await loadInvitations();
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    }
  };

  return (
    <MainLayout>
      <Link
        to={withEvent('/participant/team', event.id)}
        className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Team
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Invite Teammates</h1>
        <p className="text-lg text-brand-600">Share a single-use link to add someone to {team.name}</p>
      </div>

      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader title="Create Invitation Link" subtitle="Each link can be used by one person" />
            <CardContent className="space-y-4">
              {!canInvite && (
                <Alert
                  type="info"
                  message={spotsLeft <= 0 ? 'Your team is full.' : 'Invitations are closed because the submission deadline has passed.'}
                />
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                  <label className="label" htmlFor="invite-expiry">
                    Link expires after
                  </label>
                  <select
                    id="invite-expiry"
                    className="input"
                    value={expiresIn}
                    onChange={e => setExpiresIn(Number(e.target.value))}
                    disabled={!canInvite}
                  >
                    {EXPIRY_OPTIONS.map(option => (
                      <option key={option.hours} value={option.hours}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="primary" onClick={handleGenerate} isLoading={generating} disabled={!canInvite}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Generate Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {generated && (
            <Card className="border-2 border-success-200 bg-success-50">
              <CardHeader title="Invitation Link Created" />
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input type="text" value={inviteLink} readOnly className="input flex-1" aria-label="Invitation link" onFocus={e => e.target.select()} />
                  <Button variant="primary" onClick={handleCopy} className="flex-shrink-0">
                    {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm text-brand-600">
                  Copy it now — for security the link is only shown once. It expires {formatDateTime(generated.expires_at)}.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader title="Invitations" subtitle={`${invitations.filter(item => item.status === 'active').length} active`} />
            <CardContent>
              {listError ? (
                <p className="text-danger-600 text-sm">{listError}</p>
              ) : invitations.length === 0 ? (
                <p className="text-center text-brand-600 py-8">No invitations created yet</p>
              ) : (
                <div className="space-y-3">
                  {invitations.map(invitation => {
                    const status = INVITATION_STATUSES[invitation.status] || INVITATION_STATUSES.active;
                    return (
                      <div key={invitation.id} className="p-4 border border-brand-200 rounded-lg flex items-center justify-between gap-4">
                        <div className="text-sm">
                          <p className="font-semibold text-brand-900">
                            {invitation.accepted_by_name ? `Joined by ${invitation.accepted_by_name}` : `Invitation #${invitation.id}`}
                          </p>
                          <p className="text-brand-600">
                            Created {formatDateTime(invitation.created_at)} · Expires {formatDateTime(invitation.expires_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {invitation.status === 'active' && (
                            <Button variant="ghost" size="sm" onClick={() => handleRevoke(invitation)}>
                              Revoke
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Team Info" />
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-brand-600 font-medium mb-1">Team Name</p>
                <p className="font-semibold text-brand-900">{team.name}</p>
              </div>
              <div className="pb-4 border-b border-brand-200">
                <p className="text-sm text-brand-600 font-medium mb-1">Members</p>
                <p className="font-semibold text-brand-900">
                  {team.members.length}/{team.max_team_size}
                </p>
              </div>
              <div>
                <p className="text-sm text-brand-600 font-medium mb-1">Spots Available</p>
                <p className="font-semibold text-brand-900">{Math.max(spotsLeft, 0)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="How It Works" />
            <CardContent>
              <ol className="text-sm text-brand-600 space-y-3 list-decimal pl-5">
                <li>Generate an invitation link</li>
                <li>Send it to your teammate</li>
                <li>They sign in and accept</li>
                <li>They join your team and can edit the submission</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
