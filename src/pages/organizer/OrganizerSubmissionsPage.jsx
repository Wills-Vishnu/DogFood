import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, X } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, EmptyState, ErrorState, LoadingSpinner } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoManagedEvents, OrganizerHeader } from '../../components/organizer/OrganizerEventPicker';
import { MainLayout } from '../../layouts/MainLayout';
import { eventsApi, submissionsApi } from '../../api/endpoints';
import { useManagedEvents } from '../../hooks/useManagedEvents';
import { SUBMISSION_STATES, formatDateTime } from '../../utils/format';

export const OrganizerSubmissionsPage = () => (
  <ProtectedPage roles={['organizer', 'admin']}>
    <Submissions />
  </ProtectedPage>
);

const Submissions = () => {
  const { events, selected, selectEvent, loading, error, reload } = useManagedEvents();
  const [rows, setRows] = useState(null);
  const [rowsError, setRowsError] = useState(null);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    if (!selected) return;
    setRows(null);
    setRowsError(null);
    setTrackFilter('');
    eventsApi.submissions(selected.id).then(setRows).catch(err => setRowsError(err.message));
  }, [selected]);

  const query = search.trim().toLowerCase();
  const filtered = (rows || []).filter(
    row =>
      (!query || `${row.title} ${row.team_name}`.toLowerCase().includes(query)) &&
      (!trackFilter || row.track_name === trackFilter) &&
      (!statusFilter || row.status === statusFilter)
  );

  return (
    <MainLayout>
      <OrganizerHeader
        title="Submissions"
        subtitle={selected ? `${selected.name} · ${selected.submission_count} submitted` : undefined}
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
            <CardContent className="pt-6 grid sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
                <input
                  type="text"
                  placeholder="Search projects or teams..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-12"
                  aria-label="Search submissions"
                />
              </div>
              <select className="input" value={trackFilter} onChange={e => setTrackFilter(e.target.value)} aria-label="Track">
                <option value="">All tracks</option>
                {selected.tracks.map(track => (
                  <option key={track.id} value={track.name}>
                    {track.name}
                  </option>
                ))}
              </select>
              <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Status">
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
              </select>
            </CardContent>
          </Card>

          {rowsError ? (
            <ErrorState title="Couldn't load submissions" message={rowsError} />
          ) : !rows ? (
            <PageSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState icon={FileText} title="No submissions found" description={rows.length ? 'Try a different filter.' : 'No team has started a submission yet.'} />
          ) : (
            <Card>
              <CardContent className="pt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-200 text-left">
                      <th className="py-3 px-4 font-semibold text-brand-900">Project</th>
                      <th className="py-3 px-4 font-semibold text-brand-900">Team</th>
                      <th className="py-3 px-4 font-semibold text-brand-900">Track</th>
                      <th className="py-3 px-4 font-semibold text-brand-900">Status</th>
                      <th className="py-3 px-4 font-semibold text-brand-900">Submitted</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => {
                      const state = SUBMISSION_STATES[row.state];
                      return (
                        <tr key={row.id} className="border-b border-brand-100 hover:bg-brand-50">
                          <td className="py-3 px-4 text-brand-900 font-medium">{row.title || 'Untitled'}</td>
                          <td className="py-3 px-4 text-brand-600">{row.team_name}</td>
                          <td className="py-3 px-4 text-brand-600">{row.track_name || '—'}</td>
                          <td className="py-3 px-4">
                            <Badge variant={state.variant}>{state.label}</Badge>
                          </td>
                          <td className="py-3 px-4 text-brand-600">{formatDateTime(row.submitted_at)}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setViewing(row.id)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {viewing && <SubmissionDetail id={viewing} event={selected} onClose={() => setViewing(null)} />}
    </MainLayout>
  );
};

const SubmissionDetail = ({ id, event, onClose }) => {
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    submissionsApi.get(id).then(setSubmission).catch(err => setError(err.message));
  }, [id]);

  const questions = Object.fromEntries(event.questions.map(question => [question.id, question.prompt]));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true" onClick={onClose}>
      <Card className="max-w-2xl w-full max-h-[85vh] overflow-y-auto" elevated>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <CardHeader title={submission?.title || 'Submission'} subtitle={submission ? `${submission.team_name} · ${SUBMISSION_STATES[submission.state].label}` : undefined}>
            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-brand-500 hover:text-brand-900" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-5 relative">
            {error ? (
              <p className="text-danger-600">{error}</p>
            ) : !submission ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {submission.tagline && <p className="text-brand-700 font-medium">{submission.tagline}</p>}
                <p className="text-brand-700 whitespace-pre-line">{submission.description || 'No description yet.'}</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Info label="Track" value={submission.track_name || '—'} />
                  <Info label="Last updated" value={formatDateTime(submission.updated_at)} />
                  <Info label="Repository" value={submission.repo_url} link />
                  <Info label="Live link" value={submission.live_url} link />
                  <Info label="Demo video" value={submission.demo_video_url} link />
                  <Info label="Technologies" value={submission.tags.join(', ') || '—'} />
                </div>
                {event.questions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-brand-900 mb-2">Answers</h4>
                    <div className="space-y-3">
                      {event.questions.map(question => {
                        const answer = submission.answers.find(item => item.question_id === question.id);
                        return (
                          <div key={question.id} className="p-3 bg-brand-50 rounded-lg">
                            <p className="text-sm font-medium text-brand-700">{questions[question.id]}</p>
                            <p className="text-sm text-brand-900 whitespace-pre-line mt-1">{answer?.answer || '—'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {submission.status === 'submitted' && (
                  <Link to={`/gallery/${submission.id}`}>
                    <Button variant="secondary" size="sm">
                      Open public page
                    </Button>
                  </Link>
                )}
              </>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

const Info = ({ label, value, link }) => (
  <div>
    <p className="text-brand-600 font-medium">{label}</p>
    {link && value ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-accent-600 break-all">
        {value}
      </a>
    ) : (
      <p className="text-brand-900 break-words">{value || '—'}</p>
    )}
  </div>
);
