import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CalendarDays, CheckCircle, Globe, CalendarX } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  ErrorState,
} from '../../components/common';
import { PageSpinner } from '../../components/common/ProtectedPage';
import { MainLayout } from '../../layouts/MainLayout';
import { eventsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { PHASES, describeRemaining, formatDateTime, initials, withEvent } from '../../utils/format';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setEvent(await eventsApi.get(id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load, user]);

  const handleRegister = async () => {
    setRegistering(true);
    setNotice(null);
    try {
      await eventsApi.register(event.id);
      setNotice({ type: 'success', message: "You're registered! Next, create or join a team." });
      await load();
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
    } finally {
      setRegistering(false);
    }
  };

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
        {error.status === 404 ? (
          <EmptyState
            icon={CalendarX}
            title="Event not found"
            description="The event you're looking for doesn't exist or isn't published."
            action={
              <Link to="/events">
                <Button variant="primary">Back to Events</Button>
              </Link>
            }
          />
        ) : (
          <ErrorState title="Couldn't load this event" message={error.message} onRetry={load} />
        )}
      </MainLayout>
    );
  }

  const phase = PHASES[event.phase] || PHASES.upcoming;
  const { viewer } = event;

  return (
    <MainLayout>
      <Link to="/events" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {!event.is_published && (
        <Alert type="warning" title="Draft event" message="Only organizers can see this event until it is published." className="mb-6" />
      )}
      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}

      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-brand-900 mb-2">{event.name}</h1>
          {event.location && (
            <p className="text-lg text-brand-600 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {event.location}
            </p>
          )}
        </div>
        <Badge variant={phase.variant} className="text-sm px-4 py-2">
          {phase.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader title="Schedule" />
            <CardContent>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <CalendarDays className="w-6 h-6 text-accent-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-brand-600">Event dates</p>
                    <p className="text-lg font-semibold text-brand-900">
                      {formatDateTime(event.starts_at)} – {formatDateTime(event.ends_at)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-brand-200 pt-5 grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-brand-600">Submission deadline</p>
                    <p className="font-semibold text-brand-900">{formatDateTime(event.submission_deadline)}</p>
                    <p className="text-sm text-accent-700">
                      {describeRemaining(event.submission_deadline, event.server_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-600">Registration</p>
                    <p className="font-semibold text-brand-900">{event.registration_open ? 'Open' : 'Closed'}</p>
                    {event.registration_closes_at && (
                      <p className="text-sm text-brand-600">Closes {formatDateTime(event.registration_closes_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="About This Hackathon" />
            <CardContent>
              <p className="text-brand-700 whitespace-pre-line">{event.description || 'No description yet.'}</p>
              {event.rules && (
                <div className="mt-6">
                  <h4 className="font-semibold text-brand-900 mb-2">Rules</h4>
                  <p className="text-brand-700 whitespace-pre-line">{event.rules}</p>
                </div>
              )}
              {event.website_url && (
                <a
                  href={event.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium"
                >
                  <Globe className="w-4 h-4" />
                  Event website
                </a>
              )}
            </CardContent>
          </Card>

          {event.tracks.length > 0 && (
            <Card>
              <CardHeader title="Tracks" subtitle="Choose your focus area" />
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {event.tracks.map(track => (
                    <div key={track.id} className="p-4 border-l-4 border-accent-500 rounded bg-brand-50">
                      <p className="font-semibold text-brand-900">{track.name}</p>
                      {track.description && <p className="text-sm text-brand-600 mt-1">{track.description}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {event.prizes.length > 0 && (
            <Card>
              <CardHeader title="Prizes" subtitle="What you can win" />
              <CardContent>
                <div className="space-y-3">
                  {event.prizes.map(prize => (
                    <div key={prize.id} className="flex items-center justify-between p-4 bg-brand-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-brand-900">{prize.name}</span>
                        {prize.description && <p className="text-sm text-brand-600">{prize.description}</p>}
                      </div>
                      {prize.amount != null && (
                        <span className="text-lg font-bold text-accent-600">${prize.amount.toLocaleString()}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {event.questions.length > 0 && (
            <Card>
              <CardHeader title="Submission Questions" subtitle="Your team will answer these when submitting" />
              <CardContent>
                <ol className="list-decimal pl-5 space-y-2 text-brand-700">
                  {event.questions.map(question => (
                    <li key={question.id}>
                      {question.prompt}
                      {question.is_required && <span className="text-danger-600"> *</span>}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-brand-900 mb-1">{event.participant_count}</div>
                <p className="text-sm text-brand-600">participants registered</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-brand-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-900">{event.team_count}</p>
                  <p className="text-xs text-brand-600">teams</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-900">{event.submission_count}</p>
                  <p className="text-xs text-brand-600">submitted projects</p>
                </div>
              </div>

              <RegistrationActions
                event={event}
                viewer={viewer}
                role={user?.role}
                registering={registering}
                onRegister={handleRegister}
              />

              {event.submission_count > 0 && (
                <Link to={`/gallery?event=${event.id}`} className="block mt-3">
                  <Button variant="secondary" className="w-full">
                    Browse Projects
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Organizer" />
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-accent-100 text-accent-700 font-semibold flex items-center justify-center">
                  {initials(event.organizer.display_name)}
                </span>
                <p className="font-semibold text-brand-900">{event.organizer.display_name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const RegistrationActions = ({ event, viewer, role, registering, onRegister }) => {
  if (viewer.can_manage) {
    return (
      <Link to={`/organizer/events/${event.id}/settings`} className="block">
        <Button variant="primary" className="w-full">
          Manage Event
        </Button>
      </Link>
    );
  }
  if (viewer.is_registered) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-success-600 font-medium">
          <CheckCircle className="w-5 h-5" />
          You're registered
        </div>
        <Link to={withEvent(viewer.team_id ? '/participant/dashboard' : '/participant/team', event.id)} className="block">
          <Button variant="primary" className="w-full">
            {viewer.team_id ? 'Go to Dashboard' : 'Create or Join a Team'}
          </Button>
        </Link>
      </div>
    );
  }
  if (!event.registration_open) {
    return <p className="text-center text-sm text-brand-600">Registration is closed for this event.</p>;
  }
  if (!viewer.is_authenticated) {
    return (
      <Link to={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`} className="block">
        <Button variant="primary" className="w-full">
          Sign in to Register
        </Button>
      </Link>
    );
  }
  if (role !== 'participant') {
    return <p className="text-center text-sm text-brand-600">Only participant accounts can register.</p>;
  }
  return (
    <Button variant="primary" className="w-full" onClick={onRegister} isLoading={registering}>
      Register Now
    </Button>
  );
};
