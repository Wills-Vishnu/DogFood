import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Trophy, Search, CalendarX } from 'lucide-react';
import { Button, Card, CardContent, Badge, EmptyState, ErrorState, LoadingSpinner } from '../../components/common';
import { MainLayout } from '../../layouts/MainLayout';
import { eventsApi } from '../../api/endpoints';
import { PHASES, describeRemaining, formatDate } from '../../utils/format';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await eventsApi.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const query = searchQuery.trim().toLowerCase();
  const filteredEvents = events.filter(
    event =>
      (phaseFilter === 'all' || event.phase === phaseFilter) &&
      (!query || `${event.name} ${event.description} ${event.location || ''}`.toLowerCase().includes(query))
  );

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Hackathons</h1>
        <p className="text-lg text-brand-600">Discover and join hackathon events</p>
      </div>

      <div className="bg-white rounded-lg border border-brand-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-12"
              aria-label="Search events"
            />
          </div>
          <select
            value={phaseFilter}
            onChange={e => setPhaseFilter(e.target.value)}
            className="input sm:w-56"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {Object.entries(PHASES).map(([value, phase]) => (
              <option key={value} value={value}>
                {phase.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load events" message={error} onRetry={load} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No events found"
          description={
            events.length > 0 ? 'Try adjusting your search or filters.' : 'Check back soon for upcoming hackathons.'
          }
        />
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </MainLayout>
  );
};

const EventCard = ({ event }) => {
  const phase = PHASES[event.phase] || PHASES.upcoming;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-brand-900 mb-2">{event.name}</h3>
            <p className="text-brand-600 mb-4 line-clamp-2">{event.description}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-brand-600">Dates</p>
                  <p className="text-sm font-medium text-brand-900">
                    {formatDate(event.starts_at)} – {formatDate(event.ends_at)}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-brand-600">Location</p>
                    <p className="text-sm font-medium text-brand-900">{event.location}</p>
                  </div>
                </div>
              )}
            </div>

            {event.tracks.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-brand-600 mb-2">Tracks</p>
                <div className="flex flex-wrap gap-2">
                  {event.tracks.map(track => (
                    <Badge key={track.id} variant="primary">
                      {track.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {event.prizes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-brand-600 mb-2">Prizes</p>
                <div className="flex flex-wrap gap-4">
                  {event.prizes.map(prize => (
                    <div key={prize.id} className="flex items-center gap-1 text-sm text-brand-700">
                      <Trophy className="w-4 h-4 text-accent-600" />
                      {prize.name}
                      {prize.amount != null && ` – $${prize.amount.toLocaleString()}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="mb-6 p-4 rounded-lg border border-brand-200 bg-brand-50">
              <Badge variant={phase.variant}>{phase.label}</Badge>
              {event.phase !== 'closed' && (
                <div className="mt-4">
                  <p className="text-xs text-brand-600 font-medium">Submission Deadline</p>
                  <p className="text-lg font-bold text-brand-900">
                    {describeRemaining(event.submission_deadline, event.server_time)}
                  </p>
                  <p className="text-xs text-brand-600">{formatDate(event.submission_deadline)}</p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-brand-600 font-medium">Participants</p>
                  <p className="text-lg font-bold text-brand-900">{event.participant_count}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-600 font-medium">Projects</p>
                  <p className="text-lg font-bold text-brand-900">{event.submission_count}</p>
                </div>
              </div>
            </div>

            <Link to={`/events/${event.id}`}>
              <Button variant="primary" className="w-full">
                View Event
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
