import { sendError } from "../utils/response.js";

/**
 * validate(schema)
 * ----------------
 * Factory that returns a middleware validating req.body against
 * a Zod schema.
 *
 * Usage:
 *   import { z } from "zod";
 *   const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
 *   router.post("/login", validate(loginSchema), loginController);
 *
 * On success  → calls next(), req.body is the parsed/coerced data
 * On failure  → 422 Unprocessable Entity with field-level errors
 */
export function validate(schema) {
    return function (req, res, next) {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            // Flatten Zod errors into { field: [messages] } shape
            const errors = result.error.flatten().fieldErrors;

            return sendError(
                res,
                422,
                "Validation failed. Please check your input.",
                errors
            );
        }

        // Replace req.body with the coerced/parsed data from Zod
        req.body = result.data;
        next();
    };
}
