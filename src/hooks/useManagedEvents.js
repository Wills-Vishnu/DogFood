import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsApi } from '../api/endpoints';

// Events the signed-in organizer (or admin) may manage; the selected one comes from ?event=<id>.
export function useManagedEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setEvents(await eventsApi.listManaged());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const requestedId = Number(searchParams.get('event'));
  const selected = events.find(event => event.id === requestedId) || events[0] || null;
  const selectEvent = useCallback(id => setSearchParams({ event: String(id) }), [setSearchParams]);

  return { events, selected, selectEvent, loading, error, reload };
}
