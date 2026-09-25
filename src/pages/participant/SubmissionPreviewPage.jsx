import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit2, FileText } from 'lucide-react';
import { Alert, Button, Card, CardContent, CardHeader, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoRegisteredEvents } from '../../components/participant/ParticipantEventContext';
import { describeMissing } from '../../components/participant/submissionFields';
import { ProjectShowcase } from '../../components/projects/ProjectShowcase';
import { MainLayout } from '../../layouts/MainLayout';
import { submissionsApi } from '../../api/endpoints';
import { useParticipantEvents } from '../../hooks/useParticipantEvents';
import { useTeamSubmission } from '../../hooks/useTeamSubmission';
import { SUBMISSION_STATES, withEvent } from '../../utils/format';

export const SubmissionPreviewPage = () => (
  <ProtectedPage roles={['participant']}>
    <PreviewLoader />
  </ProtectedPage>
);

const PreviewLoader = () => {
  const { current, loading, error, reload } = useParticipantEvents();
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
        <ErrorState title="Couldn't load the preview" message={error.message} onRetry={reload} />
      </MainLayout>
    );
  }
  if (!current) {
    return (
      <MainLayout>
        <NoRegisteredEvents />
      </MainLayout>
    );
  }
  if (!current.team) {
    return (
      <MainLayout>
        <EmptyState title="No team yet" description="Join a team to create a submission." />
      </MainLayout>
    );
  }
  return <Preview key={current.team.id} event={current.event} team={current.team} />;
};

const Preview = ({ event, team }) => {
  const { submission, setSubmission, loading, error, reload } = useTeamSubmission(team.id);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

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
        <ErrorState title="Couldn't load the preview" message={error.message} onRetry={reload} />
      </MainLayout>
    );
  }
  if (!submission) {
    return (
      <MainLayout>
        <EmptyState
          icon={FileText}
          title="No submission to preview"
          action={
            <Link to={withEvent('/participant/submission', event.id)}>
              <Button variant="primary">Go to Submission</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }

  const missing = describeMissing(submission.missing_fields, event);
  const optionalGaps = [
    !submission.thumbnail_url && 'thumbnail',
    !submission.demo_video_url && 'demo video',
    !submission.repo_url && 'repository',
    !submission.live_url && 'live link',
    submission.images.length === 0 && 'image gallery',
  ].filter(Boolean);
  const state = SUBMISSION_STATES[submission.state];

  const handleSubmit = async () => {
    setSubmitting(true);
    setNotice(null);
    try {
      setSubmission(await submissionsApi.submit(submission.id));
      setNotice({ type: 'success', message: 'Submitted! Your project is now live in the gallery.' });
    } catch (err) {
      setNotice({ type: 'error', message: err.message });
      reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Link
        to={withEvent(submission.is_editable ? '/participant/submission/edit' : '/participant/submission', event.id)}
        className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {submission.is_editable ? 'Back to Edit' : 'Back to Submission'}
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-900 mb-2">Preview</h1>
        <p className="text-lg text-brand-600">
          This is how your project appears in the public gallery{submission.status === 'submitted' ? '' : ' once submitted'}.
        </p>
      </div>

      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}
      {missing.length > 0 && (
        <Alert type="error" title="Required before submitting" message={missing.join(', ')} className="mb-6" />
      )}
      {optionalGaps.length > 0 && (
        <Alert type="warning" title="Optional details missing" message={`Consider adding a ${optionalGaps.join(', ')}.`} className="mb-6" />
      )}

      <ProjectShowcase
        project={{
          title: submission.title,
          tagline: submission.tagline,
          description: submission.description,
          thumbnailUrl: submission.thumbnail_url,
          images: submission.images,
          liveUrl: submission.live_url,
          repoUrl: submission.repo_url,
          videoUrl: submission.demo_video_url,
          tags: submission.tags,
          trackName: submission.track_name,
          teamName: team.name,
          members: team.members.map(member => member.display_name),
          event: { id: event.id, name: event.name },
          submittedAt: submission.submitted_at,
        }}
        actions={
          <Card>
            <CardHeader title="Status" subtitle={state.label} />
            <CardContent className="space-y-2">
              <p className="text-sm text-brand-600 mb-2">{state.description}</p>
              {submission.is_editable && (
                <Link to={withEvent('/participant/submission/edit', event.id)} className="block">
                  <Button variant="secondary" className="w-full">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}
              {submission.state === 'draft' && (
                <Button variant="success" onClick={handleSubmit} isLoading={submitting} disabled={missing.length > 0} className="w-full">
                  Submit Project
                </Button>
              )}
            </CardContent>
          </Card>
        }
      />
    </MainLayout>
  );
};
