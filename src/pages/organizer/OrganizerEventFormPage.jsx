import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Alert, Badge, Button, Card, CardContent, CardHeader, ErrorState } from '../../components/common';
import { PageSpinner, ProtectedPage } from '../../components/common/ProtectedPage';
import { MainLayout } from '../../layouts/MainLayout';
import { eventsApi } from '../../api/endpoints';

export const OrganizerEventFormPage = () => (
  <ProtectedPage roles={['organizer', 'admin']}>
    <EventFormLoader />
  </ProtectedPage>
);

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const pad = n => String(n).padStart(2, '0');

const toLocalInput = iso => {
  if (!iso) return '';
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const fromLocalInput = value => (value ? new Date(value).toISOString() : null);

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  rules: '',
  location: '',
  website_url: '',
  starts_at: '',
  ends_at: '',
  submission_deadline: '',
  registration_opens_at: '',
  registration_closes_at: '',
  max_team_size: 4,
  is_published: false,
  tracks: [],
  prizes: [],
  questions: [],
};

const toForm = event => ({
  name: event.name,
  slug: event.slug,
  description: event.description,
  rules: event.rules || '',
  location: event.location || '',
  website_url: event.website_url || '',
  starts_at: toLocalInput(event.starts_at),
  ends_at: toLocalInput(event.ends_at),
  submission_deadline: toLocalInput(event.submission_deadline),
  registration_opens_at: toLocalInput(event.registration_opens_at),
  registration_closes_at: toLocalInput(event.registration_closes_at),
  max_team_size: event.max_team_size,
  is_published: event.is_published,
  tracks: event.tracks.map(({ id, name, description }) => ({ id, name, description: description || '' })),
  prizes: event.prizes.map(({ id, name, description, amount }) => ({ id, name, description: description || '', amount: amount ?? '' })),
  questions: event.questions.map(({ id, prompt, help_text, is_required, max_length }) => ({
    id,
    prompt,
    help_text: help_text || '',
    is_required,
    max_length,
  })),
});

const toPayload = form => ({
  name: form.name,
  ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
  description: form.description,
  rules: form.rules || null,
  location: form.location || null,
  website_url: form.website_url || null,
  starts_at: fromLocalInput(form.starts_at),
  ends_at: fromLocalInput(form.ends_at),
  submission_deadline: fromLocalInput(form.submission_deadline),
  registration_opens_at: fromLocalInput(form.registration_opens_at),
  registration_closes_at: fromLocalInput(form.registration_closes_at),
  max_team_size: Number(form.max_team_size),
  is_published: form.is_published,
  tracks: form.tracks.map(({ id, name, description }) => ({ id, name, description: description || null })),
  prizes: form.prizes.map(({ id, name, description, amount }) => ({
    id,
    name,
    description: description || null,
    amount: amount === '' ? null : Number(amount),
  })),
  questions: form.questions.map(({ id, prompt, help_text, is_required, max_length }) => ({
    id,
    prompt,
    help_text: help_text || null,
    is_required,
    max_length: Number(max_length),
  })),
});

const EventFormLoader = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    eventsApi
      .get(id)
      .then(data => {
        if (!data.viewer.can_manage) throw new Error('You do not manage this event.');
        setEvent(data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

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
        <ErrorState title="Couldn't open this event" message={error.message} />
      </MainLayout>
    );
  }
  return <EventForm key={event?.id || 'new'} event={event} />;
};

const EventForm = ({ event }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(event ? toForm(event) : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const isNew = !event;

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async e => {
    e.preventDefault();
    const missing = {};
    ['name', 'starts_at', 'ends_at', 'submission_deadline'].forEach(field => {
      if (!String(form[field]).trim()) missing[field] = 'This field is required';
    });
    if (Object.keys(missing).length) {
      setErrors(missing);
      setNotice({ type: 'error', message: 'Fill in the required fields.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    setErrors({});
    try {
      const saved = isNew ? await eventsApi.create(toPayload(form)) : await eventsApi.update(event.id, toPayload(form));
      if (isNew) {
        navigate(`/organizer/events/${saved.id}/settings`, { replace: true });
        return;
      }
      setForm(toForm(saved));
      setNotice({ type: 'success', message: 'Event saved' });
    } catch (err) {
      const fieldErrors = {};
      Object.entries(err.fields || {}).forEach(([key, message]) => {
        fieldErrors[key.split('.')[0]] = fieldErrors[key.split('.')[0]] || message;
      });
      setErrors(fieldErrors);
      setNotice({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <Link to="/organizer/events" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-brand-900 mb-2">{isNew ? 'Create Event' : 'Event Settings'}</h1>
          {!isNew && (
            <div className="flex items-center gap-2">
              <span className="text-brand-600">{event.name}</span>
              <Badge variant={event.is_published ? 'success' : 'warning'}>{event.is_published ? 'Published' : 'Draft'}</Badge>
            </div>
          )}
        </div>
        {!isNew && (
          <Link to={`/events/${event.id}`}>
            <Button variant="secondary">View Event Page</Button>
          </Link>
        )}
      </div>

      {notice && <Alert type={notice.type} message={notice.message} onClose={() => setNotice(null)} className="mb-6" />}

      <form onSubmit={handleSave} className="max-w-4xl space-y-8" noValidate>
        <Card>
          <CardHeader title="Basics" />
          <CardContent className="space-y-5">
            <FormField label="Event name" required error={errors.name}>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} maxLength={200} />
            </FormField>
            <FormField label="URL slug" error={errors.slug} hint="Lowercase letters, numbers and dashes. Leave blank to generate one.">
              <input className="input" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase())} maxLength={120} placeholder="my-hackathon-2026" />
            </FormField>
            <FormField label="Description" error={errors.description}>
              <textarea className="input" rows={5} value={form.description} onChange={e => set('description', e.target.value)} />
            </FormField>
            <FormField label="Rules" error={errors.rules}>
              <textarea className="input" rows={4} value={form.rules} onChange={e => set('rules', e.target.value)} />
            </FormField>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField label="Location" error={errors.location}>
                <input className="input" value={form.location} onChange={e => set('location', e.target.value)} maxLength={200} placeholder="City or Online" />
              </FormField>
              <FormField label="Website" error={errors.website_url}>
                <input className="input" type="url" value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Schedule" subtitle={`Times are in your timezone (${TIMEZONE}). The server enforces the submission deadline.`} />
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-5">
              <FormField label="Hackathon starts" required error={errors.starts_at}>
                <input type="datetime-local" className="input" value={form.starts_at} onChange={e => set('starts_at', e.target.value)} />
              </FormField>
              <FormField label="Submission deadline" required error={errors.submission_deadline}>
                <input type="datetime-local" className="input" value={form.submission_deadline} onChange={e => set('submission_deadline', e.target.value)} />
              </FormField>
              <FormField label="Hackathon ends" required error={errors.ends_at}>
                <input type="datetime-local" className="input" value={form.ends_at} onChange={e => set('ends_at', e.target.value)} />
              </FormField>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <FormField label="Registration opens" error={errors.registration_opens_at} hint="Optional">
                <input type="datetime-local" className="input" value={form.registration_opens_at} onChange={e => set('registration_opens_at', e.target.value)} />
              </FormField>
              <FormField label="Registration closes" error={errors.registration_closes_at} hint="Defaults to the deadline">
                <input type="datetime-local" className="input" value={form.registration_closes_at} onChange={e => set('registration_closes_at', e.target.value)} />
              </FormField>
              <FormField label="Max team size" error={errors.max_team_size}>
                <input type="number" min={1} max={20} className="input" value={form.max_team_size} onChange={e => set('max_team_size', e.target.value)} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <ListEditor
          title="Tracks"
          subtitle="Participants choose one track for their project"
          items={form.tracks}
          error={errors.tracks}
          onChange={items => set('tracks', items)}
          createItem={() => ({ name: '', description: '' })}
          renderItem={(item, update) => (
            <div className="grid sm:grid-cols-2 gap-3 flex-1">
              <input className="input" value={item.name} onChange={e => update({ name: e.target.value })} placeholder="Track name" maxLength={100} aria-label="Track name" />
              <input className="input" value={item.description} onChange={e => update({ description: e.target.value })} placeholder="Short description (optional)" maxLength={500} aria-label="Track description" />
            </div>
          )}
        />

        <ListEditor
          title="Prizes"
          items={form.prizes}
          error={errors.prizes}
          onChange={items => set('prizes', items)}
          createItem={() => ({ name: '', description: '', amount: '' })}
          renderItem={(item, update) => (
            <div className="grid sm:grid-cols-3 gap-3 flex-1">
              <input className="input" value={item.name} onChange={e => update({ name: e.target.value })} placeholder="Prize name" maxLength={150} aria-label="Prize name" />
              <input className="input" value={item.description} onChange={e => update({ description: e.target.value })} placeholder="Description (optional)" maxLength={500} aria-label="Prize description" />
              <input className="input" type="number" min={0} value={item.amount} onChange={e => update({ amount: e.target.value })} placeholder="Amount in $ (optional)" aria-label="Prize amount" />
            </div>
          )}
        />

        <ListEditor
          title="Submission Questions"
          subtitle="Custom questions every team answers; answers are visible to organizers only"
          items={form.questions}
          error={errors.questions}
          onChange={items => set('questions', items)}
          createItem={() => ({ prompt: '', help_text: '', is_required: false, max_length: 2000 })}
          renderItem={(item, update) => (
            <div className="flex-1 space-y-3">
              <input className="input" value={item.prompt} onChange={e => update({ prompt: e.target.value })} placeholder="Question" maxLength={500} aria-label="Question" />
              <div className="grid sm:grid-cols-3 gap-3 items-center">
                <input className="input sm:col-span-2" value={item.help_text} onChange={e => update({ help_text: e.target.value })} placeholder="Help text (optional)" maxLength={500} aria-label="Help text" />
                <input className="input" type="number" min={1} max={10000} value={item.max_length} onChange={e => update({ max_length: e.target.value })} aria-label="Maximum answer length" title="Maximum answer length" />
              </div>
              <label className="flex items-center gap-2 text-sm text-brand-700">
                <input type="checkbox" checked={item.is_required} onChange={e => update({ is_required: e.target.checked })} />
                Required to submit
              </label>
            </div>
          )}
        />

        <Card>
          <CardHeader title="Visibility" />
          <CardContent>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
              <span>
                <span className="font-medium text-brand-900">Published</span>
                <span className="block text-sm text-brand-600">
                  Published events are listed publicly and accept registrations. Unpublishing hides the event and its projects from the public.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="primary" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            {isNew ? 'Create Event' : 'Save Changes'}
          </Button>
          <Link to="/organizer/events">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </MainLayout>
  );
};

const FormField = ({ label, required, error, hint, children }) => (
  <div>
    <label className="label">
      {label}
      {required && <span className="text-danger-600"> *</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-brand-500 mt-1">{hint}</p>}
    {error && <p className="text-sm text-danger-600 mt-1">{error}</p>}
  </div>
);

const ListEditor = ({ title, subtitle, items, error, onChange, createItem, renderItem }) => {
  const update = (index, changes) => onChange(items.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  const move = (index, delta) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  };

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-danger-600">{error}</p>}
        {items.length === 0 && <p className="text-sm text-brand-500">None yet.</p>}
        {items.map((item, index) => (
          <div key={item.id ?? `new-${index}`} className="flex gap-3 items-start p-3 border border-brand-200 rounded-lg">
            {renderItem(item, changes => update(index, changes))}
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="p-1 text-brand-500 hover:text-accent-600 disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="p-1 text-brand-500 hover:text-accent-600 disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="p-1 text-brand-500 hover:text-danger-600" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length < 25 && (
          <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, createItem()])}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
