import { validateCreateReimbursement, validateDecision } from "../validators/reimbursement.validator.js";
import {
    createReimbursement,
    listReimbursements,
    getReimbursementsByUser,
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

// ─── GET /rest/reimbursements/:userId ────────────────────────────────────────

/**
 * GET /rest/reimbursements/:userId
 * All roles — returns all reimbursements for the target user with role-based access control.
 */
export async function getReimbursementsByUserHandler(req, res, next) {
    try {
        const targetUserId = parseInt(req.params.userId, 10);

        if (isNaN(targetUserId) || targetUserId <= 0) {
            return sendError(res, 400, "Invalid userId param — must be a positive integer.");
        }

        const records = await getReimbursementsByUser(targetUserId, req.user);

        return sendSuccess(res, 200, "Reimbursements fetched successfully.", records);
    } catch (err) {
        next(err);
    }
}

// ─── PATCH /rest/reimbursements ───────────────────────────────────────────────

/**
 * PATCH /rest/reimbursements
 * RM, APE, CFO — approve or reject a reimbursement.
 * reimbursementId is passed in the request body.
 */
export async function decisionHandler(req, res, next) {
    try {
        const result = validateDecision(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed.", result.error.flatten().fieldErrors);
        }

        const { reimbursementId, decision } = result.data;
        const caller = req.user;
        let updated;

        if (caller.role === ROLES.RM) {
            updated = await rmDecision(reimbursementId, decision, caller);
        } else if (caller.role === ROLES.APE) {
            updated = await apeDecision(reimbursementId, decision);
        } else if (caller.role === ROLES.CFO) {
            updated = await cfoDecision(reimbursementId, decision);
        } else {
            return sendError(res, 403, "Forbidden: your role cannot make decisions on reimbursements.");
        }

        return sendSuccess(res, 200, `Reimbursement ${decision.toLowerCase()} successfully.`, updated);
    } catch (err) {
        next(err);
    }
}
