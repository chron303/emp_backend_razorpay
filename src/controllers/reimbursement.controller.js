import { validateCreateReimbursement, validateDecision } from "../validators/reimbursement.validator.js";
import {
    createReimbursement,
    listReimbursements,
    getReimbursement,
    rmDecision,
    apeDecision,
    cfoDecision,
} from "../services/reimbursement.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { ROLES } from "../enums/roles.enum.js";

// ─── POST /rest/reimbursements ────────────────────────────────────────────────

/**
 * POST /rest/reimbursements
 * EMP only — create a new reimbursement request.
 */
export async function createReimbursementHandler(req, res, next) {
    try {
        const result = validateCreateReimbursement(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed.", result.error.flatten().fieldErrors);
        }

        const record = await createReimbursement(result.data, req.user.userId);

        return sendSuccess(res, 201, "Reimbursement created successfully.", record);
    } catch (err) {
        next(err);
    }
}

// ─── GET /rest/reimbursements ─────────────────────────────────────────────────

/**
 * GET /rest/reimbursements
 * All authenticated roles — returns list scoped to caller's role.
 */
export async function getReimbursementsHandler(req, res, next) {
    try {
        const records = await listReimbursements(req.user);
        return sendSuccess(res, 200, "Reimbursements fetched successfully.", records);
    } catch (err) {
        next(err);
    }
}

// ─── GET /rest/reimbursements/:id ────────────────────────────────────────────

/**
 * GET /rest/reimbursements/:id
 * All roles — returns single record with role-based access control.
 */
export async function getReimbursementHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id) || id <= 0) {
            return sendError(res, 400, "Invalid reimbursement id.");
        }

        const record = await getReimbursement(id, req.user);

        return sendSuccess(res, 200, "Reimbursement fetched successfully.", record);
    } catch (err) {
        next(err);
    }
}

// ─── PATCH /rest/reimbursements/:id/decision ─────────────────────────────────

/**
 * PATCH /rest/reimbursements/:id/decision
 * RM, APE, CFO — role determines which decision function is called.
 */
export async function decisionHandler(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id) || id <= 0) {
            return sendError(res, 400, "Invalid reimbursement id.");
        }

        const result = validateDecision(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed.", result.error.flatten().fieldErrors);
        }

        const { decision } = result.data;
        const caller       = req.user;
        let updated;

        if (caller.role === ROLES.RM) {
            updated = await rmDecision(id, decision, caller);
        } else if (caller.role === ROLES.APE) {
            updated = await apeDecision(id, decision);
        } else if (caller.role === ROLES.CFO) {
            updated = await cfoDecision(id, decision);
        } else {
            return sendError(res, 403, "Forbidden: your role cannot make decisions on reimbursements.");
        }

        return sendSuccess(res, 200, `Reimbursement ${decision.toLowerCase()} successfully.`, updated);
    } catch (err) {
        next(err);
    }
}
