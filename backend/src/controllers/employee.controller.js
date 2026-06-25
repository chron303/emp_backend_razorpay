import { validateAssignManager, validateRemoveManager } from "../validators/employee.validator.js";
import { listEmployees, assignManager, removeManager } from "../services/employee.service.js";
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

// ─── POST /rest/employees/assign ─────────────────────────────────────────────

/**
 * POST /rest/employees/assign
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

// ─── DELETE /rest/employees/assign ───────────────────────────────────────────

/**
 * DELETE /rest/employees/assign
 * CFO only — remove an EMP's manager assignment.
 */
export async function removeManagerHandler(req, res, next) {
    try {
        const result = validateRemoveManager(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed.", result.error.flatten().fieldErrors);
        }

        const deleted = await removeManager(result.data);

        return sendSuccess(res, 200, "Manager assignment removed successfully.", deleted);
    } catch (err) {
        next(err);
    }
}
