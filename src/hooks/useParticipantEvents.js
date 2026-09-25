import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { meApi } from '../api/endpoints';

// Participant pages work on one registered event at a time, chosen via ?event=<id>.
export function useParticipantEvents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setItems(await meApi.events());
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
  const current =
    items.find(item => item.event.id === requestedId) ||
    items.find(item => item.event.submissions_open) ||
    items[0] ||
    null;

  const selectEvent = useCallback(id => setSearchParams({ event: String(id) }), [setSearchParams]);

  return { items, current, loading, error, reload, selectEvent };
}
