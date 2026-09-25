import { request } from './client';

const post = (path, body) => request(path, { method: 'POST', body });
const patch = (path, body) => request(path, { method: 'PATCH', body });

export const authApi = {
  me: () => request('/auth/me'),
  login: (email, password) => post('/auth/login', { email, password }),
  register: data => post('/auth/register', data),
  logout: () => post('/auth/logout'),
  updateProfile: data => patch('/auth/me', data),
};

export const eventsApi = {
  list: () => request('/events'),
  listManaged: () => request('/events/manage'),
  get: id => request(`/events/${id}`),
  create: data => post('/events', data),
  update: (id, data) => patch(`/events/${id}`, data),
  register: id => post(`/events/${id}/registration`),
  registrations: id => request(`/events/${id}/registrations`),
  teams: id => request(`/events/${id}/teams`),
  submissions: id => request(`/events/${id}/submissions`),
};

export const teamsApi = {
  create: (eventId, name) => post(`/events/${eventId}/teams`, { name }),
  mine: eventId => request(`/events/${eventId}/my-team`),
  get: teamId => request(`/teams/${teamId}`),
  rename: (teamId, name) => patch(`/teams/${teamId}`, { name }),
  leave: teamId => post(`/teams/${teamId}/leave`),
  createInvitation: (teamId, expiresInHours = 72) =>
    post(`/teams/${teamId}/invitations`, { expires_in_hours: expiresInHours }),
  invitations: teamId => request(`/teams/${teamId}/invitations`),
  revokeInvitation: (teamId, invitationId) =>
    request(`/teams/${teamId}/invitations/${invitationId}`, { method: 'DELETE' }),
};

export const invitationsApi = {
  preview: token => request(`/invitations/${encodeURIComponent(token)}`),
  accept: token => post(`/invitations/${encodeURIComponent(token)}/accept`),
};

export const submissionsApi = {
  forTeam: teamId => request(`/teams/${teamId}/submission`),
  create: teamId => post(`/teams/${teamId}/submission`),
  get: id => request(`/submissions/${id}`),
  update: (id, data) => patch(`/submissions/${id}`, data),
  submit: id => post(`/submissions/${id}/submit`),
};

export const galleryApi = {
  projects: params => request('/gallery/projects', { query: params }),
  project: id => request(`/gallery/projects/${id}`),
  filters: eventId => request('/gallery/filters', { query: { event_id: eventId } }),
};

export const meApi = {
  events: () => request('/me/events'),
};

export const uploadsApi = {
  image: file => {
    const form = new FormData();
    form.append('file', file);
    return request('/uploads/images', { method: 'POST', body: form });
  },
};

export const adminApi = {
  overview: () => request('/admin/overview'),
  users: params => request('/admin/users', { query: params }),
  updateUser: (id, data) => patch(`/admin/users/${id}`, data),
};
