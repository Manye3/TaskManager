const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Something went wrong' }));
    throw new Error(err.error || err.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Auth
export const login = (email, password) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (name, email, password) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = () => apiFetch('/auth/me');

// Tasks
export const getTasks = (stage) => {
  const query = stage ? `?stage=${encodeURIComponent(stage)}` : '';
  return apiFetch(`/tasks${query}`);
};

export const createTask = (data) =>
  apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateTask = (id, data) =>
  apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteTask = (id) =>
  apiFetch(`/tasks/${id}`, { method: 'DELETE' });
