import { render, screen } from '@testing-library/react';
import App from './App';
import { ApiError, request } from './api/client';
import { safeNext } from './utils/format';

const jsonResponse = (status, body) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

const NOT_SIGNED_IN = { error: { code: 'not_authenticated', message: 'Please sign in to continue' } };

beforeEach(() => {
  global.fetch = jest.fn(url =>
    String(url).includes('/auth/me') ? jsonResponse(401, NOT_SIGNED_IN) : jsonResponse(200, [])
  );
});

afterEach(() => {
  window.history.pushState({}, '', '/');
});

test('renders the landing page for visitors', async () => {
  render(<App />);
  expect(await screen.findByText(/Self-Hosted Hackathon Platform/i)).toBeInTheDocument();
});

test('protected participant pages ask visitors to sign in instead of loading data', async () => {
  window.history.pushState({}, '', '/participant/dashboard');
  render(<App />);
  expect(await screen.findByText(/Sign in to continue/i)).toBeInTheDocument();
  expect(global.fetch.mock.calls.every(([url]) => String(url).includes('/auth/me'))).toBe(true);
});

test('API errors are surfaced with status, code and field messages', async () => {
  global.fetch = jest.fn(() =>
    jsonResponse(422, { error: { code: 'validation_error', message: 'Some fields are invalid', fields: { title: 'Required' } } })
  );
  const error = await request('/submissions/1', { method: 'PATCH', body: {} }).catch(err => err);
  expect(error).toBeInstanceOf(ApiError);
  expect(error.status).toBe(422);
  expect(error.code).toBe('validation_error');
  expect(error.fields).toEqual({ title: 'Required' });
  expect(global.fetch.mock.calls[0][1].credentials).toBe('include');
});

test('post-login redirects only allow same-site paths', () => {
  expect(safeNext('/invite/abc')).toBe('/invite/abc');
  expect(safeNext('https://evil.example')).toBeNull();
  expect(safeNext('//evil.example')).toBeNull();
  expect(safeNext(null)).toBeNull();
});
