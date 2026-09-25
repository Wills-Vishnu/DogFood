import React, { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Badge, Card, CardContent, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoManagedEvents, OrganizerHeader } from '../../components/organizer/OrganizerEventPicker';
import { MainLayout } from '../../layouts/MainLayout';
import { eventsApi } from '../../api/endpoints';
import { useManagedEvents } from '../../hooks/useManagedEvents';
import { SUBMISSION_STATES, formatDate } from '../../utils/format';

export const OrganizerTeamsPage = () => (
  <ProtectedPage roles={['organizer', 'admin']}>
    <Teams />
  </ProtectedPage>
);

const STATUS_FILTERS = {
  all: () => true,
  none: team => !team.submission,
  draft: team => team.submission && team.submission.status === 'draft',
  submitted: team => team.submission?.status === 'submitted',
};

const Teams = () => {
  const { events, selected, selectEvent, loading, error, reload } = useManagedEvents();
  const [teams, setTeams] = useState(null);
  const [teamsError, setTeamsError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!selected) return;
    setTeams(null);
    setTeamsError(null);
    eventsApi.teams(selected.id).then(setTeams).catch(err => setTeamsError(err.message));
  }, [selected]);

  const query = search.trim().toLowerCase();
  const filtered = (teams || []).filter(
    team =>
      STATUS_FILTERS[statusFilter](team) &&
      (!query || `${team.name} ${team.members.map(m => m.display_name).join(' ')}`.toLowerCase().includes(query))
  );

  return (
    <MainLayout>
      <OrganizerHeader
        title="Teams"
        subtitle={selected ? `${selected.name} · ${selected.team_count} teams` : undefined}
        events={events}
        selected={selected}
        onSelect={selectEvent}
      />

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState title="Couldn't load events" message={error.message} onRetry={reload} />
      ) : !selected ? (
        <NoManagedEvents />
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type="text"
                  placeholder="Search teams or members..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-12"
                  aria-label="Search teams"
                />
              </div>
              <select className="input sm:w-56" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Submission status">
                <option value="all">All submission states</option>
                <option value="none">No submission</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </CardContent>
          </Card>

          {teamsError ? (
            <ErrorState title="Couldn't load teams" message={teamsError} />
          ) : !teams ? (
            <PageSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No teams found" description={teams.length ? 'Try a different filter.' : 'No teams have formed yet.'} />
          ) : (
            <div className="grid gap-4">
              {filtered.map(team => {
                const state = team.submission ? SUBMISSION_STATES[team.submission.state] : null;
                const captain = team.members.find(member => member.is_captain);
                return (
                  <Card key={team.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-brand-900 mb-1">{team.name}</h3>
                          <p className="text-sm text-brand-600 mb-3">
                            {team.members.length}/{team.max_team_size} members · Captain {captain?.display_name} · Created {formatDate(team.created_at)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {team.members.map(member => (
                              <span key={member.user_id} className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded" title={member.email}>
                                {member.display_name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          {state ? <Badge variant={state.variant}>{state.label}</Badge> : <Badge variant="neutral">No submission</Badge>}
                          {team.submission?.title && <p className="text-sm text-brand-600 mt-2">{team.submission.title}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};
