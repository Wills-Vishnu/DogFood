import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, Settings, Users, FileText, ExternalLink } from 'lucide-react';
import { Badge, Button, Card, CardContent, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoManagedEvents, OrganizerHeader } from '../../components/organizer/OrganizerEventPicker';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../auth/AuthContext';
import { useManagedEvents } from '../../hooks/useManagedEvents';
import { PHASES, describeRemaining, formatDate, withEvent } from '../../utils/format';

export const OrganizerEventsPage = () => (
  <ProtectedPage roles={['organizer', 'admin']}>
    <OrganizerEvents />
  </ProtectedPage>
);

const OrganizerEvents = () => {
  const { user } = useAuth();
  const { events, loading, error, reload } = useManagedEvents();

  const createButton = (
    <Link to="/organizer/events/new">
      <Button variant="primary">
        <Plus className="w-4 h-4 mr-2" />
        Create Event
      </Button>
    </Link>
  );

  return (
    <MainLayout>
      <OrganizerHeader
        title={user.role === 'admin' ? 'All Events' : 'My Events'}
        subtitle="Create and manage your hackathons"
        actions={createButton}
      />

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState title="Couldn't load events" message={error.message} onRetry={reload} />
      ) : events.length === 0 ? (
        <NoManagedEvents />
      ) : (
        <div className="grid gap-6">
          {events.map(event => {
            const phase = PHASES[event.phase] || PHASES.upcoming;
            return (
              <Card key={event.id}>
                <CardContent className="py-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-brand-900">{event.name}</h3>
                        <Badge variant={event.is_published ? 'success' : 'warning'}>{event.is_published ? 'Published' : 'Draft'}</Badge>
                        <Badge variant={phase.variant}>{phase.label}</Badge>
                      </div>
                      <p className="text-sm text-brand-600 flex items-center gap-2 mb-4">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(event.starts_at)} – {formatDate(event.ends_at)} · deadline {formatDate(event.submission_deadline)}
                        {event.phase !== 'closed' && ` (${describeRemaining(event.submission_deadline, event.server_time)})`}
                      </p>
                      <div className="grid grid-cols-3 gap-4 max-w-md">
                        <Stat label="Participants" value={event.participant_count} />
                        <Stat label="Teams" value={event.team_count} />
                        <Stat label="Submitted" value={event.submission_count} />
                      </div>
                      {user.role === 'admin' && <p className="text-xs text-brand-500 mt-3">Organizer: {event.organizer.display_name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:w-72">
                      <Link to={`/organizer/events/${event.id}/settings`}>
                        <Button variant="primary" size="sm" className="w-full">
                          <Settings className="w-4 h-4 mr-1" /> Settings
                        </Button>
                      </Link>
                      <Link to={`/events/${event.id}`}>
                        <Button variant="secondary" size="sm" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-1" /> Event Page
                        </Button>
                      </Link>
                      <Link to={withEvent('/organizer/participants', event.id)}>
                        <Button variant="secondary" size="sm" className="w-full">
                          <Users className="w-4 h-4 mr-1" /> Participants
                        </Button>
                      </Link>
                      <Link to={withEvent('/organizer/submissions', event.id)}>
                        <Button variant="secondary" size="sm" className="w-full">
                          <FileText className="w-4 h-4 mr-1" /> Submissions
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

const Stat = ({ label, value }) => (
  <div>
    <p className="text-2xl font-bold text-brand-900">{value}</p>
    <p className="text-xs text-brand-600">{label}</p>
  </div>
);
