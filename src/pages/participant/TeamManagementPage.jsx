import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, LogOut, Pencil, FileText } from 'lucide-react';
import { Alert, Badge, Button, Card, CardContent, CardHeader, ErrorState, Input } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoRegisteredEvents, PageHeader } from '../../components/participant/ParticipantEventContext';
import { MainLayout } from '../../layouts/MainLayout';
import { teamsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { useParticipantEvents } from '../../hooks/useParticipantEvents';
import { formatDate, initials, withEvent } from '../../utils/format';

export const TeamManagementPage = () => (
  <ProtectedPage roles={['participant']}>
    <TeamManagement />
  </ProtectedPage>
);

const TeamManagement = () => {
  const { user } = useAuth();
  const { items, current, loading, error, reload, selectEvent } = useParticipantEvents();
  const [notice, setNotice] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

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
        <PageHeader title="Team Management" />
        <NoRegisteredEvents />
      </MainLayout>
    );
  }

  const { event, team } = current;
  const isCaptain = team?.captain_id === user.id;
  const isFull = team && team.members.length >= team.max_team_size;
  const open = event.submissions_open;

  const run = async (action, successMessage) => {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      await reload();
      if (successMessage) setNotice({ type: 'success', message: successMessage });
      return true;
    } catch (err) {
      setNotice({ type: 'error', message: err.message, fields: err.fields });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    const left = await run(() => teamsApi.leave(team.id), 'You have left the team');
    if (left) setShowLeaveConfirm(false);
  };

  return (
    <MainLayout>
      <Link
        to={withEvent('/participant/dashboard', event.id)}
        className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <PageHeader title="Team Management" subtitle={event.name} items={items} current={current} onSelect={selectEvent} />

      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}
      {!open && (
        <Alert type="info" title="Submissions are closed" message="Team changes are locked after the submission deadline." className="mb-6" />
      )}

      {!team ? (
        <CreateTeamCard
          disabled={!open}
          busy={busy}
          onCreate={name => run(() => teamsApi.create(event.id, name), `Team "${name}" created`)}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TeamInfoCard
              team={team}
              canRename={isCaptain && open}
              busy={busy}
              onRename={name => run(() => teamsApi.rename(team.id, name), 'Team renamed')}
            />

            <Card>
              <CardHeader
                title="Team Members"
                subtitle={`${team.members.length} of ${team.max_team_size} member${team.max_team_size === 1 ? '' : 's'}`}
              />
              <CardContent>
                <div className="space-y-3">
                  {team.members.map(member => (
                    <div key={member.user_id} className="flex items-center justify-between p-4 bg-brand-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 text-sm font-semibold flex items-center justify-center">
                          {initials(member.display_name)}
                        </span>
                        <div>
                          <p className="font-semibold text-brand-900">
                            {member.display_name}
                            {member.user_id === user.id && <span className="text-brand-500 font-normal"> (you)</span>}
                          </p>
                          <p className="text-sm text-brand-600">{member.email}</p>
                        </div>
                      </div>
                      {member.is_captain && <Badge variant="primary">Captain</Badge>}
                    </div>
                  ))}
                </div>
                {isCaptain && open && !isFull && (
                  <div className="pt-6 mt-6 border-t border-brand-200">
                    <Link to={withEvent('/participant/team/invite', event.id)} className="w-full block">
                      <Button variant="primary" className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Teammate
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Team Actions" />
              <CardContent className="space-y-2">
                {isCaptain && open && !isFull && (
                  <Link to={withEvent('/participant/team/invite', event.id)} className="block">
                    <Button variant="primary" className="w-full">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </Link>
                )}
                <Link to={withEvent('/participant/submission', event.id)} className="block">
                  <Button variant="secondary" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Submission
                  </Button>
                </Link>
                {!isCaptain && open && (
                  <Button variant="danger" onClick={() => setShowLeaveConfirm(true)} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave Team
                  </Button>
                )}
                {isCaptain && <p className="text-xs text-brand-600 pt-2">As captain you manage invitations and stay with the team.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Team Info" />
              <CardContent>
                <div className="space-y-3 text-sm">
                  <InfoRow label="Members" value={`${team.members.length}/${team.max_team_size}`} />
                  <InfoRow label="Submission" value={team.submission ? team.submission.state : 'Not started'} capitalize />
                  <InfoRow label="Created" value={formatDate(team.created_at)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true">
          <Card className="max-w-md w-full">
            <CardHeader title="Leave Team?" />
            <CardContent className="space-y-6">
              <p className="text-brand-600">
                You will lose access to {team?.name}'s submission. You'll need a new invitation to rejoin.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowLeaveConfirm(false)} disabled={busy} className="flex-1">
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleLeave} isLoading={busy} className="flex-1">
                  Leave
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

const CreateTeamCard = ({ disabled, busy, onCreate }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a team name');
      return;
    }
    onCreate(name.trim());
  };

  return (
    <Card className="max-w-lg">
      <CardContent className="pt-10 pb-10">
        <div className="text-center mb-8">
          <Users className="w-16 h-16 text-brand-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-brand-900 mb-2">No Team Yet</h3>
          <p className="text-brand-600">Create a team and invite teammates, or open an invite link to join an existing team.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Team name"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setError('');
            }}
            error={error}
            maxLength={100}
            placeholder="e.g. Neural Flux"
            disabled={disabled}
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={busy} disabled={disabled}>
            Create New Team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const TeamInfoCard = ({ team, canRename, busy, onRename }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);

  const save = async () => {
    if (name.trim() && name.trim() !== team.name && (await onRename(name.trim()))) setEditing(false);
  };

  return (
    <Card>
      <CardHeader title="Team Information" />
      <CardContent>
        <p className="text-sm text-brand-600 font-medium mb-2">Team Name</p>
        {editing ? (
          <div className="flex gap-2">
            <input className="input flex-1" value={name} onChange={e => setName(e.target.value)} maxLength={100} aria-label="Team name" />
            <Button variant="primary" onClick={save} isLoading={busy}>
              Save
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setName(team.name);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-brand-900">{team.name}</h2>
            {canRename && (
              <button type="button" onClick={() => setEditing(true)} className="text-brand-500 hover:text-accent-600" aria-label="Rename team">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <p className="text-brand-600 mt-2">{team.event_name}</p>
      </CardContent>
    </Card>
  );
};

const InfoRow = ({ label, value, capitalize }) => (
  <div className="flex justify-between pb-3 border-b border-brand-200 last:border-0 last:pb-0">
    <span className="text-brand-600">{label}</span>
    <span className={`font-semibold text-brand-900 ${capitalize ? 'capitalize' : ''}`}>{value}</span>
  </div>
);
