import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge, Button, Card, CardContent, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { MainLayout } from '../../layouts/MainLayout';
import { useManagedEvents } from '../../hooks/useManagedEvents';
import { PHASES, formatDate } from '../../utils/format';

export const AdminEventsPage = () => (
  <ProtectedPage roles={['admin']}>
    <AdminEvents />
  </ProtectedPage>
);

const AdminEvents = () => {
  const { events, loading, error, reload } = useManagedEvents();

  return (
    <MainLayout>
      <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Events</h1>
        <p className="text-lg text-brand-600">{events.length} total events</p>
      </div>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState title="Couldn't load events" message={error.message} onRetry={reload} />
      ) : events.length === 0 ? (
        <EmptyState title="No events yet" />
      ) : (
        <div className="grid gap-4">
          {events.map(event => {
            const phase = PHASES[event.phase] || PHASES.upcoming;
            return (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-900">{event.name}</h3>
                      <p className="text-sm text-brand-600 mt-1">
                        {formatDate(event.starts_at)} – {formatDate(event.ends_at)} · Organizer {event.organizer.display_name}
                      </p>
                      <p className="text-xs text-brand-600 mt-2">
                        {event.participant_count} participants · {event.team_count} teams · {event.submission_count} submitted
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={event.is_published ? 'success' : 'warning'}>{event.is_published ? 'Published' : 'Draft'}</Badge>
                      <Badge variant={phase.variant}>{phase.label}</Badge>
                      <Link to={`/organizer/events/${event.id}/settings`}>
                        <Button variant="secondary" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};
