import { z } from "zod";
import { ROLES } from "../enums/roles.enum.js";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const assignRoleSchema = z.object({
    userId: z
        .number({ required_error: "userId is required", invalid_type_error: "userId must be a number" })
        .int("userId must be an integer")
        .positive("userId must be a positive integer"),

    role: z.enum([ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO], {
        required_error: "role is required",
        message: `role must be one of: ${Object.values(ROLES).join(", ")}`,
    }),
});

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validate assign-role request body.
 * @param {unknown} body
 */
export function validateAssignRole(body) {
    return assignRoleSchema.safeParse(body);
}
