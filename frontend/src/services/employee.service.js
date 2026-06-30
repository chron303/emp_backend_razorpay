import api from '../api/axios.js';

/**
 * GET /rest/employees
 * Accessible by RM, APE, CFO. Returns role-scoped list of employees.
 */
export async function getEmployees() {
  const { data } = await api.get('/rest/employees');
  return data; // { success, message, data: Employee[] }
}

/**
 * POST /rest/employees/assign
 * CFO only — assign an EMP to an RM.
 * @param {{ employeeId: number, managerId: number }} payload
 */
export async function assignManager({ employeeId, managerId }) {
  const { data } = await api.post('/rest/employees/assign', { employeeId, managerId });
  return data;
}

/**
 * DELETE /rest/employees/assign
 * CFO only — remove an EMP's manager assignment.
 * @param {{ employeeId: number }} payload
 */
export async function removeManager({ employeeId }) {
  const { data } = await api.delete('/rest/employees/assign', { data: { employeeId } });
  return data;
}
