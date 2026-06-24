import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

const orgEmail = z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .refine((val) => val.endsWith("@org.com"), {
        message: "Email must belong to the org.com domain",
    });

const password = z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters");

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .min(1, "Name cannot be empty")
        .trim(),
    email:    orgEmail,
    password: password,
});

export const loginSchema = z.object({
    email:    orgEmail,
    password: z.string({ required_error: "Password is required" }).min(1, "Password cannot be empty"),
});

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validate registration request body.
 * @param {unknown} body
 * @returns {{ data: object } | { errors: import("zod").ZodError }}
 */
export function validateRegister(body) {
    return registerSchema.safeParse(body);
}

/**
 * Validate login request body.
 * @param {unknown} body
 * @returns {{ data: object } | { errors: import("zod").ZodError }}
 */
export function validateLogin(body) {
    return loginSchema.safeParse(body);
}
