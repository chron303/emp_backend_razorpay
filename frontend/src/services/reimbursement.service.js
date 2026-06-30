import api from '../api/axios.js';

/**
 * POST /rest/reimbursements
 * EMP only — create a new reimbursement request.
 * @param {{ title: string, description: string, amount: number }} payload
 */
export async function createReimbursement({ title, description, amount }) {
  const { data } = await api.post('/rest/reimbursements', { title, description, amount });
  return data;
}

/**
 * GET /rest/reimbursements
 * All roles — returns reimbursements scoped to the caller's role.
 */
export async function getReimbursements() {
  const { data } = await api.get('/rest/reimbursements');
  return data;
}

/**
 * GET /rest/reimbursements/:userId
 * All roles — returns reimbursements for a specific user (role-scoped).
 * @param {number} userId
 */
export async function getReimbursementsByUser(userId) {
  const { data } = await api.get(`/rest/reimbursements/${userId}`);
  return data;
}

/**
 * PATCH /rest/reimbursements
 * RM, APE, CFO — approve or reject a reimbursement.
 * NOTE: reimbursementId is in the REQUEST BODY (not the URL).
 * @param {{ reimbursementId: number, decision: 'APPROVED' | 'REJECTED' }} payload
 */
export async function makeDecision({ reimbursementId, decision }) {
  const { data } = await api.patch('/rest/reimbursements', { reimbursementId, decision });
  return data;
}
