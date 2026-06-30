import api from '../api/axios.js';

/**
 * POST /rest/roles/assign
 * CFO only — assign a role to a user.
 * @param {{ userId: number, role: 'EMP' | 'RM' | 'APE' | 'CFO' }} payload
 */
export async function assignRole({ userId, role }) {
  const { data } = await api.post('/rest/roles/assign', { userId, role });
  return data;
}
