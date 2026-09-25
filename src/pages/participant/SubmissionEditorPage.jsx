import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, X, Plus, Lock, FileText, Users } from 'lucide-react';
import { Alert, Button, Card, CardContent, CardHeader, EmptyState, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { NoRegisteredEvents } from '../../components/participant/ParticipantEventContext';
import { fieldLabel } from '../../components/participant/submissionFields';
import { MainLayout } from '../../layouts/MainLayout';
import { submissionsApi, uploadsApi } from '../../api/endpoints';
import { useParticipantEvents } from '../../hooks/useParticipantEvents';
import { useTeamSubmission } from '../../hooks/useTeamSubmission';
import { SUBMISSION_STATES, describeRemaining, formatDateTime, withEvent } from '../../utils/format';

const SUGGESTED_TECH = ['React', 'Node.js', 'Python', 'TypeScript', 'FastAPI', 'PostgreSQL', 'MySQL', 'Docker', 'TensorFlow', 'Solidity'];
const MAX_TAGS = 20;
const MAX_IMAGES = 10;

export const SubmissionEditorPage = () => (
  <ProtectedPage roles={['participant']}>
    <SubmissionEditorLoader />
  </ProtectedPage>
);

const SubmissionEditorLoader = () => {
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
        <ErrorState title="Couldn't load the editor" message={error.message} onRetry={reload} />
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
        <EmptyState
          icon={Users}
          title="Join a team first"
          description="Submissions belong to teams."
          action={
            <Link to={withEvent('/participant/team', current.event.id)}>
              <Button variant="primary">Go to Team</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }
  return <TeamSubmissionEditor key={current.team.id} event={current.event} team={current.team} />;
};

const toForm = submission => ({
  title: submission.title,
  tagline: submission.tagline,
  description: submission.description,
  thumbnail_url: submission.thumbnail_url || '',
  demo_video_url: submission.demo_video_url || '',
  repo_url: submission.repo_url || '',
  live_url: submission.live_url || '',
  track_id: submission.track_id ? String(submission.track_id) : '',
  tags: submission.tags,
  images: submission.images,
  answers: Object.fromEntries(submission.answers.map(item => [item.question_id, item.answer])),
});

const toPayload = (form, event) => ({
  title: form.title,
  tagline: form.tagline,
  description: form.description,
  thumbnail_url: form.thumbnail_url || null,
  demo_video_url: form.demo_video_url || null,
  repo_url: form.repo_url || null,
  live_url: form.live_url || null,
  track_id: form.track_id ? Number(form.track_id) : null,
  tags: form.tags,
  images: form.images,
  answers: event.questions.map(question => ({ question_id: question.id, answer: form.answers[question.id] || '' })),
});

// Maps API error keys onto editor fields: "answers.<index>.answer" (request validation) becomes
// "answers.<question id>", and list items such as "tags.3" collapse onto their list.
const normalizeErrors = (fields, event) => {
  const result = {};
  Object.entries(fields || {}).forEach(([key, message]) => {
    const indexedAnswer = key.match(/^answers\.(\d+)\.\w+$/);
    let target = key;
    if (indexedAnswer) target = `answers.${event.questions[Number(indexedAnswer[1])]?.id}`;
    else if (/^(tags|images)\.\d+$/.test(key)) target = key.split('.')[0];
    result[target] = result[target] || message;
  });
  return result;
};

const TeamSubmissionEditor = ({ event, team }) => {
  const navigate = useNavigate();
  const { submission, setSubmission, loading, error, reload } = useTeamSubmission(team.id);
  const [form, setForm] = useState(null);
  const [savedPayload, setSavedPayload] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (submission) {
      const next = toForm(submission);
      setForm(next);
      setSavedPayload(JSON.stringify(toPayload(next, event)));
    }
  }, [submission, event]);

  const payload = useMemo(() => (form ? toPayload(form, event) : null), [form, event]);
  const isDirty = payload !== null && JSON.stringify(payload) !== savedPayload;

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = e => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

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

  if (!submission) {
    const start = async () => {
      setStarting(true);
      try {
        setSubmission(await submissionsApi.create(team.id));
      } catch (err) {
        setNotice({ type: 'error', message: err.message });
      } finally {
        setStarting(false);
      }
    };
    return (
      <MainLayout>
        {notice && <Alert type={notice.type} message={notice.message} className="mb-6" />}
        <EmptyState
          icon={FileText}
          title="No submission yet"
          description={event.submissions_open ? 'Start a private draft for your team.' : 'The submission deadline has passed.'}
          action={
            event.submissions_open && (
              <Button variant="primary" onClick={start} isLoading={starting}>
                Start Submission
              </Button>
            )
          }
        />
      </MainLayout>
    );
  }
  if (!form) {
    return (
      <MainLayout>
        <PageSpinner />
      </MainLayout>
    );
  }

  const readOnly = !submission.is_editable;
  const state = SUBMISSION_STATES[submission.state];
  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const save = async () => {
    const updated = await submissionsApi.update(submission.id, payload);
    setSubmission(updated);
    return updated;
  };

  const handleError = err => {
    const fieldErrors = normalizeErrors(err.fields, event);
    setErrors(fieldErrors);
    const labels = Object.keys(fieldErrors).map(key => fieldLabel(key, event));
    setNotice({ type: 'error', message: labels.length ? `${err.message}: ${labels.join(', ')}` : err.message });
    if (err.code === 'deadline_passed') reload();
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setNotice(null);
    setErrors({});
    try {
      await save();
      setNotice({ type: 'success', message: 'Saved' });
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setNotice(null);
    setErrors({});
    try {
      await save();
      await submissionsApi.submit(submission.id);
      navigate(withEvent('/participant/submission', event.id));
    } catch (err) {
      handleError(err);
      setSubmitting(false);
    }
  };

  const isSubmitted = submission.status === 'submitted';

  return (
    <MainLayout>
      <Link
        to={withEvent('/participant/submission', event.id)}
        className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Submission
      </Link>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-4xl font-bold text-brand-900 mb-2">{readOnly ? 'Submission' : 'Edit Submission'}</h1>
          <p className="text-brand-600">
            {team.name} · {event.name} · <span className="font-medium">{state.label}</span>
          </p>
        </div>
        <div className="text-sm text-right">
          <p className="text-brand-600">Deadline {formatDateTime(submission.deadline)}</p>
          <p className="font-semibold text-accent-700">{describeRemaining(submission.deadline, submission.server_time)}</p>
          {isDirty && !readOnly && <p className="text-warning-600 font-medium">Unsaved changes</p>}
        </div>
      </div>

      {readOnly && (
        <Alert type="info" title="Editing is closed" message={state.description} className="mb-6" />
      )}
      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}

      <fieldset disabled={readOnly} className="max-w-4xl space-y-8">
        <Card>
          <CardHeader title="Project Information" />
          <CardContent className="space-y-6">
            <Field label="Project Name" required error={errors.title} hint={`${form.title.length}/150`}>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} maxLength={150} placeholder="e.g. MindFlow" />
            </Field>
            <Field label="Tagline" required error={errors.tagline} hint={`${form.tagline.length}/300`}>
              <input className="input" value={form.tagline} onChange={e => set('tagline', e.target.value)} maxLength={300} placeholder="One line that explains your project" />
            </Field>
            <Field label="Description" required error={errors.description}>
              <textarea className="input" rows={8} value={form.description} onChange={e => set('description', e.target.value)} maxLength={20000} placeholder="What does it do, how did you build it, and what's next?" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Media" subtitle="Images are stored on this DOGFOOD server" />
          <CardContent className="space-y-6">
            <Field label="Thumbnail" error={errors.thumbnail_url}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48 h-28 rounded-lg overflow-hidden bg-brand-100 flex items-center justify-center flex-shrink-0">
                  {form.thumbnail_url ? <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-brand-500">No thumbnail</span>}
                </div>
                <div className="flex-1 space-y-2">
                  <input className="input" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} placeholder="Upload an image or paste an https:// URL" />
                  <div className="flex gap-2">
                    <UploadButton onUploaded={url => set('thumbnail_url', url)} onError={message => setErrors(prev => ({ ...prev, thumbnail_url: message }))} />
                    {form.thumbnail_url && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => set('thumbnail_url', '')}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Field>

            <Field label={`Image Gallery (${form.images.length}/${MAX_IMAGES})`} error={errors.images}>
              <ImageGallery
                images={form.images}
                onChange={images => set('images', images)}
                onError={message => setErrors(prev => ({ ...prev, images: message }))}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Links" />
          <CardContent className="space-y-6">
            <Field label="Demo Video URL" error={errors.demo_video_url}>
              <input type="url" className="input" value={form.demo_video_url} onChange={e => set('demo_video_url', e.target.value)} placeholder="https://youtu.be/..." />
            </Field>
            <Field label="Repository URL" error={errors.repo_url}>
              <input type="url" className="input" value={form.repo_url} onChange={e => set('repo_url', e.target.value)} placeholder="https://github.com/..." />
            </Field>
            <Field label="Live Project URL" error={errors.live_url}>
              <input type="url" className="input" value={form.live_url} onChange={e => set('live_url', e.target.value)} placeholder="https://yourproject.com" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Track & Technologies" />
          <CardContent className="space-y-6">
            {event.tracks.length > 0 && (
              <Field label="Track" required error={errors.track_id}>
                <select className="input" value={form.track_id} onChange={e => set('track_id', e.target.value)}>
                  <option value="">Select a track</option>
                  {event.tracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label={`Technologies (${form.tags.length}/${MAX_TAGS})`} error={errors.tags}>
              <TagEditor tags={form.tags} onChange={tags => set('tags', tags)} disabled={readOnly} />
            </Field>
          </CardContent>
        </Card>

        {event.questions.length > 0 && (
          <Card>
            <CardHeader title="Project Questions" subtitle="Visible to organizers only" />
            <CardContent className="space-y-6">
              {event.questions.map(question => {
                const value = form.answers[question.id] || '';
                return (
                  <Field
                    key={question.id}
                    label={question.prompt}
                    required={question.is_required}
                    error={errors[`answers.${question.id}`]}
                    hint={`${value.length}/${question.max_length}`}
                    help={question.help_text}
                  >
                    <textarea
                      className="input"
                      rows={3}
                      value={value}
                      maxLength={question.max_length}
                      onChange={e => {
                        setForm(prev => ({ ...prev, answers: { ...prev.answers, [question.id]: e.target.value } }));
                        setErrors(prev => ({ ...prev, [`answers.${question.id}`]: undefined }));
                      }}
                      placeholder="Your answer..."
                    />
                  </Field>
                );
              })}
            </CardContent>
          </Card>
        )}
      </fieldset>

      <Card className="max-w-4xl mt-8">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-3">
          {readOnly ? (
            <div className="flex items-center gap-2 text-brand-600 flex-1">
              <Lock className="w-4 h-4" /> This submission can no longer be edited.
            </div>
          ) : (
            <Button variant="primary" onClick={handleSaveDraft} isLoading={saving} disabled={submitting} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitted ? 'Save Changes' : 'Save Draft'}
            </Button>
          )}
          <Link to={withEvent('/participant/submission/preview', event.id)} className="flex-1">
            <Button variant="secondary" className="w-full" disabled={isDirty && !readOnly} title={isDirty ? 'Save your changes to preview them' : undefined}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
          {!readOnly && !isSubmitted && (
            <Button variant="success" onClick={handleSubmit} isLoading={submitting} disabled={saving} className="flex-1">
              Submit Project
            </Button>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

const Field = ({ label, required, error, hint, help, children }) => (
  <div>
    <div className="flex items-baseline justify-between mb-2">
      <label className="block text-sm font-medium text-brand-700">
        {label}
        {required && <span className="text-danger-600"> *</span>}
      </label>
      {hint && <span className="text-xs text-brand-500">{hint}</span>}
    </div>
    {help && <p className="text-xs text-brand-500 mb-2">{help}</p>}
    {children}
    {error && <p className="text-sm text-danger-600 mt-1">{error}</p>}
  </div>
);

const UploadButton = ({ onUploaded, onError, label = 'Upload image' }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadsApi.image(file);
      onUploaded(url);
    } catch (err) {
      onError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={handleChange} />
      <Button type="button" variant="secondary" size="sm" isLoading={uploading} onClick={() => inputRef.current?.click()}>
        <Upload className="w-4 h-4 mr-1" />
        {label}
      </Button>
    </>
  );
};

const ImageGallery = ({ images, onChange, onError }) => {
  const [url, setUrl] = useState('');
  const full = images.length >= MAX_IMAGES;

  const addUrl = () => {
    if (!url.trim()) return;
    onChange([...images, url.trim()]);
    setUrl('');
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="relative group">
              <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-lg bg-brand-100" />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-brand-700 hover:text-danger-600"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {!full && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="input flex-1" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste an image URL" />
          <Button type="button" variant="secondary" size="sm" onClick={addUrl}>
            <Plus className="w-4 h-4 mr-1" /> Add URL
          </Button>
          <UploadButton label="Upload" onUploaded={uploaded => onChange([...images, uploaded])} onError={onError} />
        </div>
      )}
    </div>
  );
};

const TagEditor = ({ tags, onChange, disabled }) => {
  const [draft, setDraft] = useState('');
  const has = tag => tags.some(item => item.toLowerCase() === tag.toLowerCase());

  const add = value => {
    const tag = value.trim().replace(/\s+/g, ' ').slice(0, 50);
    if (tag && !has(tag) && tags.length < MAX_TAGS) onChange([...tags, tag]);
    setDraft('');
  };
  const remove = tag => onChange(tags.filter(item => item !== tag));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-accent-600 text-white">
            {tag}
            {!disabled && (
              <button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag}`}>
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {tags.length === 0 && <span className="text-sm text-brand-500">No technologies added yet</span>}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={draft}
          maxLength={50}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder="Type a technology and press Enter"
        />
        <Button type="button" variant="secondary" size="sm" onClick={() => add(draft)}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TECH.filter(tech => !has(tech)).map(tech => (
          <button
            key={tech}
            type="button"
            onClick={() => add(tech)}
            className="px-3 py-1 rounded-lg text-sm bg-brand-100 text-brand-700 hover:bg-brand-200 transition"
          >
            + {tech}
          </button>
        ))}
      </div>
    </div>
  );
};
