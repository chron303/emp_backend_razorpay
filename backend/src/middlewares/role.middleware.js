import { ROLES }     from "../enums/roles.enum.js";
import { sendError } from "../utils/response.js";

/**
 * authorise(...allowedRoles)
 * --------------------------
 * Factory that returns a middleware allowing only the specified roles.
 * Must be used AFTER authenticate (requires req.user to be set).
 *
 * Usage:
 *   router.get("/admin", authenticate, authorise(ROLES.CFO), handler);
 *   router.get("/report", authenticate, authorise(ROLES.RM, ROLES.CFO), handler);
 *
 * On failure → 403 Forbidden
 */
export function authorise(...allowedRoles) {
    // Validate at startup — catch typos in role names early
    const validRoles  = new Set(Object.values(ROLES));
    const invalidArgs = allowedRoles.filter((r) => !validRoles.has(r));

    if (invalidArgs.length > 0) {
        throw new Error(
            `[authorise] Invalid roles passed: ${invalidArgs.join(", ")}. ` +
            `Allowed values: ${[...validRoles].join(", ")}`
        );
    }

    const allowed = new Set(allowedRoles);

    return function (req, res, next) {
        const role = req.user?.role;

        if (!role) {
            // authenticate was not called before this middleware
            return sendError(res, 401, "Unauthorized: user not authenticated.");
        }

        if (!allowed.has(role)) {
            return sendError(
                res,
                403,
                `Forbidden: role '${role}' is not permitted to access this resource.`
            );
        }

        next();
    };
}
