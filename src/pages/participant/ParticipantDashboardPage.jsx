import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, ChevronRight, Lock } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoRegisteredEvents, PageHeader } from '../../components/participant/ParticipantEventContext';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../auth/AuthContext';
import { useParticipantEvents } from '../../hooks/useParticipantEvents';
import {
  PHASES,
  SUBMISSION_STATES,
  describeRemaining,
  formatDate,
  formatDateTime,
  initials,
  withEvent,
} from '../../utils/format';

export const ParticipantDashboardPage = () => (
  <ProtectedPage roles={['participant']}>
    <Dashboard />
  </ProtectedPage>
);

const nextAction = ({ event, team, submission }) => {
  if (!team) {
    return event.submissions_open
      ? { text: 'Create or join a team', link: withEvent('/participant/team', event.id), icon: Users }
      : { text: 'Submissions are closed', link: `/events/${event.id}`, icon: Lock };
  }
  if (!submission) {
    return event.submissions_open
      ? { text: 'Start your submission', link: withEvent('/participant/submission', event.id), icon: FileText }
      : { text: 'Submissions are closed', link: `/events/${event.id}`, icon: Lock };
  }
  if (submission.state === 'draft') {
    return { text: 'Finish and submit your project', link: withEvent('/participant/submission/edit', event.id), icon: FileText };
  }
  return { text: 'View your submission', link: withEvent('/participant/submission', event.id), icon: FileText };
};

const Dashboard = () => {
  const { user } = useAuth();
  const { items, current, loading, error, reload, selectEvent } = useParticipantEvents();

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
        <ErrorState title="Couldn't load your dashboard" message={error.message} onRetry={reload} />
      </MainLayout>
    );
  }
  if (!current) {
    return (
      <MainLayout>
        <PageHeader title="Dashboard" subtitle={`Welcome, ${user.display_name}`} />
        <NoRegisteredEvents />
      </MainLayout>
    );
  }

  const { event, team, submission } = current;
  const action = nextAction(current);
  const ActionIcon = action.icon;
  const submissionState = submission ? SUBMISSION_STATES[submission.state] : null;

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user.display_name}`}
        items={items}
        current={current}
        onSelect={selectEvent}
      />

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={Calendar} label="Current Event" value={event.name} detail={`${formatDate(event.starts_at)} – ${formatDate(event.ends_at)}`} />
        <StatCard
          icon={Users}
          label="Team"
          value={team?.name || 'No Team'}
          detail={team ? `${team.members.length} of ${team.max_team_size} members` : 'Create one or accept an invite'}
        />
        <StatCard
          icon={FileText}
          label="Submission"
          value={submission ? submission.title || 'Untitled project' : 'No Submission'}
          detail={submissionState && <Badge variant={submissionState.variant}>{submissionState.label}</Badge>}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-2 border-accent-200 bg-accent-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-brand-600 font-medium mb-1">NEXT STEP</p>
                  <p className="text-2xl font-bold text-brand-900">{action.text}</p>
                </div>
                <Link to={action.link}>
                  <Button variant="primary">
                    <ActionIcon className="w-4 h-4 mr-2" />
                    Go
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Event Details" />
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                <Detail label="Starts" value={formatDateTime(event.starts_at)} />
                <Detail label="Ends" value={formatDateTime(event.ends_at)} />
                <Detail
                  label="Submission Deadline"
                  value={formatDateTime(event.submission_deadline)}
                  note={describeRemaining(event.submission_deadline, event.server_time)}
                />
                <Detail label="Location" value={event.location || 'Not specified'} />
              </div>
              <Link to={`/events/${event.id}`} className="inline-block mt-6 text-accent-600 hover:text-accent-700 font-medium">
                View event page →
              </Link>
            </CardContent>
          </Card>

          {team ? (
            <Card>
              <CardHeader title="Your Team" subtitle={team.name} />
              <CardContent>
                <div className="space-y-2">
                  {team.members.map(member => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 bg-brand-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 text-xs font-semibold flex items-center justify-center">
                          {initials(member.display_name)}
                        </span>
                        <div>
                          <p className="font-semibold text-brand-900">{member.display_name}</p>
                          <p className="text-xs text-brand-600">{member.email}</p>
                        </div>
                      </div>
                      {member.is_captain && <Badge variant="primary">Captain</Badge>}
                    </div>
                  ))}
                </div>
                <Link to={withEvent('/participant/team', event.id)} className="block mt-4">
                  <Button variant="secondary" className="w-full">
                    Manage Team
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-8 text-center">
                <Users className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-brand-900 mb-2">No Team Yet</h3>
                <p className="text-brand-600 mb-6">Create a team, or open an invite link from a teammate to join theirs.</p>
                <Link to={withEvent('/participant/team', event.id)}>
                  <Button variant="primary">Create Team</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="My Events" />
            <CardContent>
              <div className="space-y-2">
                {items.map(item => {
                  const phase = PHASES[item.event.phase] || PHASES.upcoming;
                  const selected = item.event.id === event.id;
                  return (
                    <Link
                      key={item.event.id}
                      to={withEvent('/participant/dashboard', item.event.id)}
                      aria-current={selected ? 'true' : undefined}
                      className={`block p-3 rounded-lg border transition ${
                        selected ? 'border-accent-300 bg-accent-50' : 'border-brand-200 hover:bg-brand-50'
                      }`}
                    >
                      <span className="block font-medium text-brand-900">{item.event.name}</span>
                      <Badge variant={phase.variant} className="mt-1">
                        {phase.label}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
              <Link to="/events" className="block mt-4 text-sm text-accent-600 hover:text-accent-700 font-medium">
                Find more events →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quick Links" />
            <CardContent>
              <div className="space-y-2">
                <QuickLink to="/participant/profile" label="Profile" />
                <QuickLink to={withEvent('/participant/team', event.id)} label="Team" />
                <QuickLink to={withEvent('/participant/submission', event.id)} label="Submission" />
                <QuickLink to="/gallery" label="Project Gallery" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon: Icon, label, value, detail }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-brand-600 font-medium uppercase">{label}</p>
          <p className="text-lg font-bold text-brand-900 truncate">{value}</p>
          <div className="text-sm text-brand-600 mt-1">{detail}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Detail = ({ label, value, note }) => (
  <div>
    <p className="text-sm text-brand-600 font-medium">{label}</p>
    <p className="text-brand-900 font-semibold">{value}</p>
    {note && <p className="text-sm text-accent-700">{note}</p>}
  </div>
);

const QuickLink = ({ to, label }) => (
  <Link to={to} className="flex items-center justify-between p-3 hover:bg-brand-50 rounded-lg transition">
    <span className="text-brand-900 font-medium">{label}</span>
    <ChevronRight className="w-4 h-4 text-brand-400" />
  </Link>
);
