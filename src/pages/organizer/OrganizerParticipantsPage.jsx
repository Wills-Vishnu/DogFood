import React, { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Badge, Card, CardContent, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoManagedEvents, OrganizerHeader } from '../../components/organizer/OrganizerEventPicker';
import { MainLayout } from '../../layouts/MainLayout';
import { eventsApi } from '../../api/endpoints';
import { useManagedEvents } from '../../hooks/useManagedEvents';
import { formatDateTime } from '../../utils/format';

export const OrganizerParticipantsPage = () => (
  <ProtectedPage roles={['organizer', 'admin']}>
    <Participants />
  </ProtectedPage>
);

const Participants = () => {
  const { events, selected, selectEvent, loading, error, reload } = useManagedEvents();
  const [rows, setRows] = useState(null);
  const [rowsError, setRowsError] = useState(null);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    if (!selected) return;
    setRows(null);
    setRowsError(null);
    eventsApi.registrations(selected.id).then(setRows).catch(err => setRowsError(err.message));
  }, [selected]);

  const query = search.trim().toLowerCase();
  const filtered = (rows || []).filter(
    row =>
      (!query || `${row.display_name} ${row.email} ${row.team_name || ''}`.toLowerCase().includes(query)) &&
      (teamFilter === 'all' || (teamFilter === 'with' ? row.team_id : !row.team_id))
  );

  return (
    <MainLayout>
      <OrganizerHeader
        title="Participants"
        subtitle={selected ? `${selected.name} · ${selected.participant_count} registered` : undefined}
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
                  placeholder="Search by name, email or team..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-12"
                  aria-label="Search participants"
                />
              </div>
              <select className="input sm:w-48" value={teamFilter} onChange={e => setTeamFilter(e.target.value)} aria-label="Team filter">
                <option value="all">All participants</option>
                <option value="with">On a team</option>
                <option value="without">Without a team</option>
              </select>
            </CardContent>
          </Card>

          {rowsError ? (
            <ErrorState title="Couldn't load participants" message={rowsError} />
          ) : !rows ? (
            <PageSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No participants found" description={rows.length ? 'Try a different search.' : 'Nobody has registered yet.'} />
          ) : (
            <Card>
              <CardContent className="pt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-200 text-left">
                      <th className="py-3 px-4 font-semibold text-brand-900">Name</th>
                      <th className="py-3 px-4 font-semibold text-brand-900">Email</th>
                      <th className="py-3 px-4 font-semibold text-brand-900">Team</th>
                      <th className="py-3 px-4 font-semibold text-brand-900">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => (
                      <tr key={row.user_id} className="border-b border-brand-100 hover:bg-brand-50">
                        <td className="py-3 px-4 text-brand-900 font-medium">{row.display_name}</td>
                        <td className="py-3 px-4 text-brand-600">{row.email}</td>
                        <td className="py-3 px-4">
                          {row.team_name ? <Badge variant="primary">{row.team_name}</Badge> : <Badge variant="neutral">No team</Badge>}
                        </td>
                        <td className="py-3 px-4 text-brand-600">{formatDateTime(row.registered_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </MainLayout>
  );
};
