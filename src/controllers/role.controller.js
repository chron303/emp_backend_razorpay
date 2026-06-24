import { validateAssignRole } from "../validators/role.validator.js";
import { assignRole }         from "../services/role.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * PATCH /rest/roles/assign
 * CFO only — assign a role to any user.
 */
export async function assignRoleHandler(req, res, next) {
    try {
        const result = validateAssignRole(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed.", result.error.flatten().fieldErrors);
        }

        const updated = await assignRole(result.data);

        return sendSuccess(res, 200, `Role '${updated.role}' assigned successfully.`, updated);
    } catch (err) {
        next(err);
    }
}
