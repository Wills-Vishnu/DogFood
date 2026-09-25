const API_ROOT = `${process.env.REACT_APP_API_BASE_URL || ''}/api/v1`;

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields || {};
  }
}

export async function request(path, { method = 'GET', body, query, signal } = {}) {
  const url = new URL(`${API_ROOT}${path}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  const init = { method, credentials: 'include', headers: {}, signal };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'network_error', 'Unable to reach the DOGFOOD server. Check your connection and try again.');
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data?.error || {};
    throw new ApiError(response.status, error.code || 'error', error.message || `Request failed (${response.status})`, error.fields);
  }
  return data;
}
