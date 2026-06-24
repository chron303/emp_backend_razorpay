import { validateAssignManager }   from "../validators/employee.validator.js";
import { listEmployees, assignManager } from "../services/employee.service.js";
import { sendSuccess, sendError }   from "../utils/response.js";

// ─── GET /rest/employees ──────────────────────────────────────────────────────

/**
 * GET /rest/employees
 * Accessible by RM, APE, CFO.
 * Returns users visible to the caller based on their role.
 */
export async function getEmployees(req, res, next) {
    try {
        const employees = await listEmployees(req.user);
        return sendSuccess(res, 200, "Employees fetched successfully.", employees);
    } catch (err) {
        next(err);
    }
}

// ─── POST /rest/employees/assign-manager ─────────────────────────────────────

/**
 * POST /rest/employees/assign-manager
 * CFO only — assign an EMP to an RM.
 */
export async function assignManagerHandler(req, res, next) {
    try {
        const result = validateAssignManager(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed.", result.error.flatten().fieldErrors);
        }

        const mapping = await assignManager(result.data);

        return sendSuccess(res, 200, "Manager assigned successfully.", mapping);
    } catch (err) {
        next(err);
    }
}
