export const formatDate = iso =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export const formatDateTime = iso =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// Remaining time is measured against the server's clock reading, not the browser's.
export function describeRemaining(deadlineIso, serverTimeIso) {
  const remaining = new Date(deadlineIso) - new Date(serverTimeIso || Date.now());
  if (remaining <= 0) return 'Deadline passed';
  const minutes = Math.floor(remaining / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days} day${days === 1 ? '' : 's'} left`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? '' : 's'} left`;
  return `${Math.max(minutes, 1)} minute${minutes === 1 ? '' : 's'} left`;
}

export const initials = name =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

export const ROLE_HOME = {
  participant: '/participant/dashboard',
  organizer: '/organizer/events',
  admin: '/admin/dashboard',
  judge: '/judge/dashboard',
};

export const roleHome = role => ROLE_HOME[role] || '/events';

export const PHASES = {
  upcoming: { label: 'Upcoming', variant: 'primary' },
  active: { label: 'Open for submissions', variant: 'success' },
  closed: { label: 'Submissions closed', variant: 'neutral' },
};

export const SUBMISSION_STATES = {
  draft: { label: 'Draft', variant: 'warning', description: 'Editable until the deadline. Not visible to the public yet.' },
  submitted: { label: 'Submitted', variant: 'success', description: 'Live in the gallery. You can keep editing until the deadline.' },
  locked: { label: 'Locked', variant: 'primary', description: 'The deadline has passed. Your submitted project is final.' },
  closed: { label: 'Not submitted', variant: 'danger', description: 'The deadline passed before this draft was submitted.' },
};

export const INVITATION_STATUSES = {
  active: { label: 'Active', variant: 'success' },
  accepted: { label: 'Accepted', variant: 'primary' },
  expired: { label: 'Expired', variant: 'neutral' },
  revoked: { label: 'Revoked', variant: 'danger' },
};

export const withEvent = (path, eventId) => (eventId ? `${path}?event=${eventId}` : path);

// Only same-site paths are accepted so ?next= cannot redirect users off DOGFOOD.
export const safeNext = value => (value && value.startsWith('/') && !value.startsWith('//') ? value : null);
