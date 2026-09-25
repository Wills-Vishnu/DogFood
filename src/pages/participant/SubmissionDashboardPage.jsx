import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, AlertCircle, CheckCircle, Lock, Users } from 'lucide-react';
import { Alert, Badge, Button, Card, CardContent, CardHeader, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoRegisteredEvents, PageHeader } from '../../components/participant/ParticipantEventContext';
import { describeMissing } from '../../components/participant/submissionFields';
import { MainLayout } from '../../layouts/MainLayout';
import { submissionsApi } from '../../api/endpoints';
import { useParticipantEvents } from '../../hooks/useParticipantEvents';
import { useTeamSubmission } from '../../hooks/useTeamSubmission';
import { SUBMISSION_STATES, describeRemaining, formatDateTime, withEvent } from '../../utils/format';

export const SubmissionDashboardPage = () => (
  <ProtectedPage roles={['participant']}>
    <SubmissionDashboard />
  </ProtectedPage>
);

const STATE_STYLES = {
  draft: { card: 'border-warning-200 bg-warning-50', icon: FileText, color: 'text-warning-600' },
  submitted: { card: 'border-success-200 bg-success-50', icon: CheckCircle, color: 'text-success-600' },
  locked: { card: 'border-accent-200 bg-accent-50', icon: Lock, color: 'text-accent-600' },
  closed: { card: 'border-danger-200 bg-danger-50', icon: Lock, color: 'text-danger-600' },
};

const SubmissionDashboard = () => {
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
        <ErrorState title="Couldn't load your submission" message={error.message} onRetry={reload} />
      </MainLayout>
    );
  }
  if (!current) {
    return (
      <MainLayout>
        <PageHeader title="Submission" />
        <NoRegisteredEvents />
      </MainLayout>
    );
  }
  if (!current.team) {
    return (
      <MainLayout>
        <PageHeader title="Submission" subtitle={current.event.name} items={items} current={current} onSelect={selectEvent} />
        <EmptyState
          icon={Users}
          title="Join a team first"
          description="Submissions belong to teams. Create a team (even a team of one) or accept an invitation."
          action={
            <Link to={withEvent('/participant/team', current.event.id)}>
              <Button variant="primary">Go to Team</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }
  return <SubmissionOverview key={current.team.id} context={current} items={items} selectEvent={selectEvent} />;
};

const SubmissionOverview = ({ context, items, selectEvent }) => {
  const { event, team } = context;
  const navigate = useNavigate();
  const { submission, setSubmission, loading, error, reload } = useTeamSubmission(team.id);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const header = <PageHeader title="Submission" subtitle={event.name} items={items} current={context} onSelect={selectEvent} />;

  if (loading) {
    return (
      <MainLayout>
        {header}
        <PageSpinner />
      </MainLayout>
    );
  }
  if (error) {
    return (
      <MainLayout>
        {header}
        <ErrorState title="Couldn't load your submission" message={error.message} onRetry={reload} />
      </MainLayout>
    );
  }

  const startSubmission = async () => {
    setBusy(true);
    try {
      await submissionsApi.create(team.id);
      navigate(withEvent('/participant/submission/edit', event.id));
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
      setBusy(false);
    }
  };

  const submitNow = async () => {
    setBusy(true);
    setNotice(null);
    try {
      setSubmission(await submissionsApi.submit(submission.id));
      setNotice({ type: 'success', message: 'Your project is submitted and now visible in the gallery.' });
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
      reload();
    } finally {
      setBusy(false);
    }
  };

  if (!submission) {
    return (
      <MainLayout>
        {header}
        {notice && <Alert type={notice.type} message={notice.message} className="mb-6" />}
        <EmptyState
          icon={FileText}
          title="No submission yet"
          description={
            event.submissions_open
              ? `Start a draft for ${team.name}. Drafts stay private until you submit.`
              : 'The submission deadline for this event has passed.'
          }
          action={
            event.submissions_open && (
              <Button variant="primary" onClick={startSubmission} isLoading={busy}>
                Start Submission
              </Button>
            )
          }
        />
      </MainLayout>
    );
  }

  const state = SUBMISSION_STATES[submission.state];
  const style = STATE_STYLES[submission.state];
  const StateIcon = style.icon;
  const missing = describeMissing(submission.missing_fields, event);
  const checklist = [
    { label: 'Project name', done: !submission.missing_fields.title },
    { label: 'Tagline', done: !submission.missing_fields.tagline },
    { label: 'Description', done: !submission.missing_fields.description },
    ...(event.tracks.length ? [{ label: 'Track', done: !submission.missing_fields.track_id }] : []),
    ...event.questions
      .filter(question => question.is_required)
      .map(question => ({ label: question.prompt, done: !submission.missing_fields[`answers.${question.id}`] })),
    { label: 'Thumbnail (optional)', done: Boolean(submission.thumbnail_url), optional: true },
    { label: 'Repository or live link (optional)', done: Boolean(submission.repo_url || submission.live_url), optional: true },
  ];
  const required = checklist.filter(item => !item.optional);
  const completion = Math.round((required.filter(item => item.done).length / required.length) * 100);

  return (
    <MainLayout>
      <Link
        to={withEvent('/participant/dashboard', event.id)}
        className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
      {header}
      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className={`border-2 ${style.card}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <StateIcon className={`w-8 h-8 ${style.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-brand-600 font-medium mb-1">Status</p>
                  <h2 className="text-2xl font-bold text-brand-900 mb-2">{state.label}</h2>
                  <p className="text-sm text-brand-600">{state.description}</p>
                  {submission.submitted_at && (
                    <p className="text-sm text-brand-600 mt-1">Submitted {formatDateTime(submission.submitted_at)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Project Information" />
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-brand-600 font-medium mb-1">Project Name</p>
                <p className="text-xl font-bold text-brand-900">{submission.title || 'Untitled Project'}</p>
                {submission.tagline && <p className="text-sm text-brand-600 mt-1">{submission.tagline}</p>}
              </div>
              <div className="pt-4 border-t border-brand-200">
                <p className="text-sm text-brand-600 font-medium mb-2">Track</p>
                <Badge variant={submission.track_name ? 'primary' : 'neutral'}>{submission.track_name || 'Not selected'}</Badge>
              </div>
              <div className="pt-4 border-t border-brand-200">
                <p className="text-sm text-brand-600 font-medium mb-2">Technologies</p>
                {submission.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {submission.tags.map(tech => (
                      <Badge key={tech} variant="neutral">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-brand-600">None added</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Completion" />
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-brand-900">Required fields</span>
                  <span className="text-sm font-bold text-accent-600">{completion}%</span>
                </div>
                <div className="w-full bg-brand-200 rounded-full h-2">
                  <div className="bg-accent-600 h-2 rounded-full transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
              <ul className="text-sm space-y-1">
                {checklist.map(item => (
                  <li key={item.label} className={item.done ? 'text-success-600' : 'text-brand-600'}>
                    {item.done ? '✓' : '○'} {item.label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Deadline" />
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-brand-600 font-medium mb-1">Submissions close</p>
                <p className="text-lg font-bold text-brand-900">{formatDateTime(submission.deadline)}</p>
              </div>
              <div className={`p-3 rounded-lg ${submission.is_editable ? 'bg-accent-100' : 'bg-danger-100'}`}>
                <p className={`text-sm font-semibold flex items-center gap-2 ${submission.is_editable ? 'text-accent-700' : 'text-danger-600'}`}>
                  <Clock className="w-4 h-4" />
                  {describeRemaining(submission.deadline, submission.server_time)}
                </p>
              </div>
              <p className="text-xs text-brand-500">The deadline is enforced by the server clock.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Submission Info" />
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-brand-600">Last saved</p>
                <p className="text-brand-900 font-medium">{formatDateTime(submission.updated_at)}</p>
              </div>
              <div>
                <p className="text-brand-600">Team</p>
                <p className="text-brand-900 font-medium">{submission.team_name}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Actions" />
            <CardContent className="space-y-2">
              {submission.is_editable && (
                <Link to={withEvent('/participant/submission/edit', event.id)} className="block">
                  <Button variant="primary" className="w-full">
                    Edit Submission
                  </Button>
                </Link>
              )}
              <Link to={withEvent('/participant/submission/preview', event.id)} className="block">
                <Button variant="secondary" className="w-full">
                  Preview
                </Button>
              </Link>
              {submission.state === 'draft' && (
                <>
                  <Button variant="success" className="w-full" onClick={submitNow} isLoading={busy} disabled={missing.length > 0}>
                    Submit Now
                  </Button>
                  {missing.length > 0 && (
                    <p className="text-xs text-brand-600 flex gap-1">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Still needed: {missing.join(', ')}
                    </p>
                  )}
                </>
              )}
              {submission.status === 'submitted' && (
                <Link to={`/gallery/${submission.id}`} className="block">
                  <Button variant="ghost" className="w-full">
                    View in Gallery
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};
