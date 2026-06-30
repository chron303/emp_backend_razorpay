import api from '../api/axios.js';

/**
 * POST /rest/onboardings/register
 * Creates a new EMP account. Does NOT log the user in.
 */
export async function register({ name, email, password }) {
  const { data } = await api.post('/rest/onboardings/register', { name, email, password });
  return data; // { success, message, data: { id, name, email, role } }
}

/**
 * POST /rest/onboardings/login
 * Validates credentials and sets the httpOnly auth cookie.
 */
export async function login({ email, password }) {
  const { data } = await api.post('/rest/onboardings/login', { email, password });
  return data; // { success, message }
}

/**
 * POST /rest/onboardings/logout
 * Clears the auth cookie on the server.
 */
export async function logout() {
  const { data } = await api.post('/rest/onboardings/logout');
  return data;
}
