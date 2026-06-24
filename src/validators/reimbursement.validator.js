import { z } from "zod";
import { REIMBURSEMENT_STATUS } from "../enums/reimbursementStatus.enum.js";

// ─── Create Reimbursement ─────────────────────────────────────────────────────

export const createReimbursementSchema = z.object({
    title: z
        .string({ required_error: "title is required" })
        .min(1, "title cannot be empty")
        .max(255, "title must be at most 255 characters")
        .trim(),

    description: z
        .string({ required_error: "description is required" })
        .min(1, "description cannot be empty")
        .trim(),

    amount: z
        .number({ required_error: "amount is required", invalid_type_error: "amount must be a number" })
        .positive("amount must be greater than 0")
        .multipleOf(0.01, "amount must have at most 2 decimal places"),
});

// ─── Decision (approve / reject) ──────────────────────────────────────────────

export const decisionSchema = z.object({
    decision: z.enum(
        [REIMBURSEMENT_STATUS.APPROVED, REIMBURSEMENT_STATUS.REJECTED],
        {
            required_error: "decision is required",
            message: `decision must be '${REIMBURSEMENT_STATUS.APPROVED}' or '${REIMBURSEMENT_STATUS.REJECTED}'`,
        }
    ),
});

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validate create-reimbursement request body.
 * @param {unknown} body
 */
export function validateCreateReimbursement(body) {
    return createReimbursementSchema.safeParse(body);
}

/**
 * Validate approve/reject decision request body.
 * @param {unknown} body
 */
export function validateDecision(body) {
    return decisionSchema.safeParse(body);
}
