import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const assignManagerSchema = z.object({
    employeeId: z
        .number({ required_error: "employeeId is required", invalid_type_error: "employeeId must be a number" })
        .int("employeeId must be an integer")
        .positive("employeeId must be a positive integer"),

    managerId: z
        .number({ required_error: "managerId is required", invalid_type_error: "managerId must be a number" })
        .int("managerId must be an integer")
        .positive("managerId must be a positive integer"),
});

export const removeManagerSchema = z.object({
    employeeId: z
        .number({ required_error: "employeeId is required", invalid_type_error: "employeeId must be a number" })
        .int("employeeId must be an integer")
        .positive("employeeId must be a positive integer"),
});

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validate assign-manager request body.
 * @param {unknown} body
 */
export function validateAssignManager(body) {
    return assignManagerSchema.safeParse(body);
}

/**
 * Validate remove-manager request body.
 * @param {unknown} body
 */
export function validateRemoveManager(body) {
    return removeManagerSchema.safeParse(body);
}
