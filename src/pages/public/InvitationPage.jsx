import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, Users, XCircle } from 'lucide-react';
import { Alert, Button, Card, CardContent, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner } from '../../components/common/ProtectedPage';
import { MainLayout } from '../../layouts/MainLayout';
import { invitationsApi } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { formatDateTime, withEvent } from '../../utils/format';

const UNAVAILABLE = {
  expired: { icon: Clock, title: 'Invitation Expired', message: 'Ask the team captain for a new invitation link.' },
  accepted: { icon: CheckCircle, title: 'Invitation Already Used', message: 'Each invitation link can only be used once.' },
  revoked: { icon: XCircle, title: 'Invitation Revoked', message: 'The team captain has revoked this invitation.' },
};

export const InvitationPage = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(null);
  const [joinedTeam, setJoinedTeam] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setInvitation(await invitationsApi.preview(token));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async () => {
    setAccepting(true);
    setAcceptError(null);
    try {
      setJoinedTeam(await invitationsApi.accept(token));
    } catch (err) {
      setAcceptError(err.message);
      if (err.status === 410) load();
    } finally {
      setAccepting(false);
    }
  };

  const next = encodeURIComponent(`/invite/${token}`);

  let content;
  if (loading) {
    content = <PageSpinner />;
  } else if (error) {
    content =
      error.status === 404 || error.status === 422 ? (
        <EmptyState
          icon={AlertCircle}
          title="Invitation Not Found"
          description="This invitation link is invalid. Check that you copied the whole link."
          action={
            <Link to="/events">
              <Button variant="primary">Browse Events</Button>
            </Link>
          }
        />
      ) : (
        <ErrorState title="Couldn't load this invitation" message={error.message} onRetry={load} />
      );
  } else if (joinedTeam) {
    content = (
      <Card>
        <CardContent className="pt-8 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-900">Welcome to {joinedTeam.name}!</h2>
          <p className="text-brand-600">You're now on the team for {joinedTeam.event_name}.</p>
          <Link to={withEvent('/participant/team', joinedTeam.event_id)} className="block">
            <Button variant="primary" className="w-full">
              Go to My Team
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  } else {
    const unavailable = UNAVAILABLE[invitation.status];
    const StatusIcon = unavailable?.icon || Users;
    content = (
      <Card>
        <CardContent className="pt-8 space-y-6">
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                unavailable ? 'bg-warning-100' : 'bg-accent-100'
              }`}
            >
              <StatusIcon className={`w-8 h-8 ${unavailable ? 'text-warning-600' : 'text-accent-600'}`} />
            </div>
            <h2 className="text-2xl font-bold text-brand-900">{unavailable ? unavailable.title : 'Team Invitation'}</h2>
            <p className="text-brand-600 mt-2">
              {unavailable ? unavailable.message : `You're invited to join ${invitation.team_name}`}
            </p>
          </div>

          <div className="bg-brand-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs text-brand-600 font-medium">TEAM</p>
              <p className="text-lg font-semibold text-brand-900">{invitation.team_name}</p>
              <p className="text-sm text-brand-600">
                {invitation.member_count} of {invitation.max_team_size} members
              </p>
            </div>
            <div className="pt-3 border-t border-brand-200">
              <p className="text-xs text-brand-600 font-medium">EVENT</p>
              <Link to={`/events/${invitation.event_id}`} className="text-lg font-semibold text-accent-600">
                {invitation.event_name}
              </Link>
            </div>
            {invitation.invited_by_name && (
              <div className="pt-3 border-t border-brand-200">
                <p className="text-xs text-brand-600 font-medium">INVITED BY</p>
                <p className="text-sm font-semibold text-brand-900">{invitation.invited_by_name}</p>
              </div>
            )}
            {!unavailable && (
              <p className="pt-3 border-t border-brand-200 text-xs text-brand-600">
                Expires {formatDateTime(invitation.expires_at)}
              </p>
            )}
          </div>

          {acceptError && <Alert type="error" title="Couldn't join the team" message={acceptError} />}

          {!unavailable &&
            (!user ? (
              <div className="space-y-3">
                <p className="text-center text-brand-600">Sign in or create an account to accept.</p>
                <Link to={`/login?next=${next}`} className="block">
                  <Button variant="primary" className="w-full">
                    Login to Accept
                  </Button>
                </Link>
                <Link to={`/register?next=${next}`} className="block">
                  <Button variant="secondary" className="w-full">
                    Create Account
                  </Button>
                </Link>
              </div>
            ) : user.role !== 'participant' ? (
              <p className="text-center text-sm text-brand-600">
                Only participant accounts can join teams. You're signed in as {user.role}.
              </p>
            ) : (
              <Button variant="primary" onClick={handleAccept} isLoading={accepting} className="w-full">
                Accept Invitation
              </Button>
            ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto mt-6">{content}</div>
    </MainLayout>
  );
};
