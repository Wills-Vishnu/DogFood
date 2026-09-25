import { useCallback, useEffect, useState } from 'react';
import { submissionsApi } from '../api/endpoints';

export function useTeamSubmission(teamId) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(Boolean(teamId));
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setSubmission(await submissionsApi.forTeam(teamId));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { submission, setSubmission, loading, error, reload };
}
