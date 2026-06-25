import { eq, and } from "drizzle-orm";

import { db }                            from "../config/db.js";
import { reimbursements, employeeManager } from "../../drizzle/schema.js";
import { ROLES }                          from "../enums/roles.enum.js";
import { REIMBURSEMENT_STATUS }           from "../enums/reimbursementStatus.enum.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function notFound(message) {
    const err = new Error(message);
    err.statusCode = 404;
    return err;
}

function forbidden(message) {
    const err = new Error(message);
    err.statusCode = 403;
    return err;
}

function badRequest(message) {
    const err = new Error(message);
    err.statusCode = 400;
    return err;
}

// ─── Create Reimbursement ─────────────────────────────────────────────────────

/**
 * Create a new reimbursement for the authenticated EMP.
 * All decision fields default to PENDING (enforced by DB schema default).
 *
 * @param {{ title: string, description: string, amount: number }} dto
 * @param {number} employeeId  - from req.user.userId
 * @returns {Promise<object>}
 */
export async function createReimbursement({ title, description, amount }, employeeId) {
    const [created] = await db
        .insert(reimbursements)
        .values({
            employeeId,
            title,
            description,
            amount: String(amount), // numeric column — pass as string to avoid float drift
            status:      REIMBURSEMENT_STATUS.PENDING,
            rmDecision:  REIMBURSEMENT_STATUS.PENDING,
            apeDecision: REIMBURSEMENT_STATUS.PENDING,
        })
        .returning();

    return created;
}

// ─── List Reimbursements ──────────────────────────────────────────────────────

/**
 * Return reimbursements visible to the caller.
 *
 *  EMP  → own reimbursements only
 *  RM   → reimbursements of their direct subordinates
 *  APE  → all reimbursements where rmDecision = APPROVED
 *  CFO  → all reimbursements
 *
 * @param {{ userId: number, role: string }} caller
 * @returns {Promise<object[]>}
 */
export async function listReimbursements(caller) {
    if (caller.role === ROLES.EMP) {
        return db
            .select()
            .from(reimbursements)
            .where(eq(reimbursements.employeeId, caller.userId));
    }

    if (caller.role === ROLES.RM) {
        // Get subordinate IDs
        const mappings = await db
            .select({ employeeId: employeeManager.employeeId })
            .from(employeeManager)
            .where(eq(employeeManager.managerId, caller.userId));

        if (mappings.length === 0) return [];

        const subordinateIds = mappings.map((m) => m.employeeId);

        const results = await Promise.all(
            subordinateIds.map((id) =>
                db.select().from(reimbursements).where(eq(reimbursements.employeeId, id))
            )
        );
        return results.flat();
    }

    if (caller.role === ROLES.APE) {
        // APE only sees requests already approved by RM
        return db
            .select()
            .from(reimbursements)
            .where(eq(reimbursements.rmDecision, REIMBURSEMENT_STATUS.APPROVED));
    }

    // CFO → all
    return db.select().from(reimbursements);
}

// ─── Get Reimbursements by User ───────────────────────────────────────────────

/**
 * Fetch all reimbursements belonging to a specific user (targetUserId),
 * with caller-based access control.
 *
 *  EMP   → can only view their own (targetUserId must equal caller.userId)
 *  RM    → can only view reimbursements of their direct subordinates
 *  APE   → can view any user's RM-approved reimbursements
 *  CFO   → can view any user's reimbursements
 *
 * @param {number} targetUserId
 * @param {{ userId: number, role: string }} caller
 * @returns {Promise<object[]>}
 */
export async function getReimbursementsByUser(targetUserId, caller) {
    // EMP: can only view their own
    if (caller.role === ROLES.EMP) {
        if (targetUserId !== caller.userId) {
            throw forbidden("You can only view your own reimbursements.");
        }
        return db
            .select()
            .from(reimbursements)
            .where(eq(reimbursements.employeeId, targetUserId));
    }

    // RM: can only view subordinates
    if (caller.role === ROLES.RM) {
        const [mapping] = await db
            .select()
            .from(employeeManager)
            .where(
                and(
                    eq(employeeManager.employeeId, targetUserId),
                    eq(employeeManager.managerId, caller.userId)
                )
            )
            .limit(1);

        if (!mapping) throw forbidden("You do not manage this employee.");

        return db
            .select()
            .from(reimbursements)
            .where(eq(reimbursements.employeeId, targetUserId));
    }

    // APE: only RM-approved reimbursements for that user
    if (caller.role === ROLES.APE) {
        return db
            .select()
            .from(reimbursements)
            .where(
                and(
                    eq(reimbursements.employeeId, targetUserId),
                    eq(reimbursements.rmDecision, REIMBURSEMENT_STATUS.APPROVED)
                )
            );
    }

    // CFO: all reimbursements for that user
    return db
        .select()
        .from(reimbursements)
        .where(eq(reimbursements.employeeId, targetUserId));
}

// ─── RM Decision ──────────────────────────────────────────────────────────────

/**
 * RM approves or rejects a reimbursement raised by one of their subordinates.
 *
 * Rules:
 *  - Reimbursement must exist.
 *  - Overall status must still be PENDING.
 *  - Caller (RM) must manage the EMP who raised it.
 *
 * @param {number} id          - reimbursement id
 * @param {string} decision    - APPROVED | REJECTED
 * @param {{ userId: number }} caller
 * @returns {Promise<object>}
 */
export async function rmDecision(id, decision, caller) {
    const [record] = await db
        .select()
        .from(reimbursements)
        .where(eq(reimbursements.id, id))
        .limit(1);

    if (!record) throw notFound(`Reimbursement ${id} not found.`);

    if (record.status !== REIMBURSEMENT_STATUS.PENDING) {
        throw badRequest(`Reimbursement is already ${record.status}. No further decisions can be made.`);
    }

    // Confirm the RM manages this EMP
    const [mapping] = await db
        .select()
        .from(employeeManager)
        .where(
            and(
                eq(employeeManager.employeeId, record.employeeId),
                eq(employeeManager.managerId, caller.userId)
            )
        )
        .limit(1);

    if (!mapping) throw forbidden("You do not manage the employee who raised this reimbursement.");

    // Determine new overall status
    const newStatus =
        decision === REIMBURSEMENT_STATUS.REJECTED
            ? REIMBURSEMENT_STATUS.REJECTED   // RM rejection is final
            : REIMBURSEMENT_STATUS.PENDING;   // stays PENDING until APE acts

    const [updated] = await db
        .update(reimbursements)
        .set({ rmDecision: decision, status: newStatus, updatedAt: new Date() })
        .where(eq(reimbursements.id, id))
        .returning();

    return updated;
}

// ─── APE Decision ─────────────────────────────────────────────────────────────

/**
 * APE approves or rejects a reimbursement that the RM has already approved.
 *
 * Rules:
 *  - Reimbursement must exist.
 *  - rmDecision must be APPROVED.
 *  - Overall status must be PENDING.
 *
 * @param {number} id
 * @param {string} decision - APPROVED | REJECTED
 * @returns {Promise<object>}
 */
export async function apeDecision(id, decision) {
    const [record] = await db
        .select()
        .from(reimbursements)
        .where(eq(reimbursements.id, id))
        .limit(1);

    if (!record) throw notFound(`Reimbursement ${id} not found.`);

    if (record.rmDecision !== REIMBURSEMENT_STATUS.APPROVED) {
        throw badRequest("APE can only act on reimbursements approved by the RM.");
    }

    if (record.status !== REIMBURSEMENT_STATUS.PENDING) {
        throw badRequest(`Reimbursement is already ${record.status}. No further decisions can be made.`);
    }

    const newStatus = decision; // APE decision is the final status

    const [updated] = await db
        .update(reimbursements)
        .set({ apeDecision: decision, status: newStatus, updatedAt: new Date() })
        .where(eq(reimbursements.id, id))
        .returning();

    return updated;
}

// ─── CFO Decision ─────────────────────────────────────────────────────────────

/**
 * CFO can approve or reject any reimbursement regardless of its current state.
 *
 * @param {number} id
 * @param {string} decision - APPROVED | REJECTED
 * @returns {Promise<object>}
 */
export async function cfoDecision(id, decision) {
    const [record] = await db
        .select()
        .from(reimbursements)
        .where(eq(reimbursements.id, id))
        .limit(1);

    if (!record) throw notFound(`Reimbursement ${id} not found.`);

    const [updated] = await db
        .update(reimbursements)
        .set({ status: decision, updatedAt: new Date() })
        .where(eq(reimbursements.id, id))
        .returning();

    return updated;
}
