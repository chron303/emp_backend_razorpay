import { eq, and } from "drizzle-orm";

import { db }                            from "../config/db.js";
import { users, employeeManager }        from "../../drizzle/schema.js";
import { ROLES }                         from "../enums/roles.enum.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function notFound(message) {
    const err = new Error(message);
    err.statusCode = 404;
    return err;
}

function badRequest(message) {
    const err = new Error(message);
    err.statusCode = 400;
    return err;
}

function conflict(message) {
    const err = new Error(message);
    err.statusCode = 409;
    return err;
}

// ─── List All Employees ───────────────────────────────────────────────────────

/**
 * Return all users visible to the caller based on their role.
 *
 *  CFO  → all users
 *  RM   → only EMPs reporting to them
 *  APE  → all EMPs and RMs
 *
 * @param {{ userId: number, role: string }} caller
 * @returns {Promise<object[]>}
 */
export async function listEmployees(caller) {
    const safeColumns = {
        id:    users.id,
        name:  users.name,
        email: users.email,
        role:  users.role,
    };

    if (caller.role === ROLES.CFO) {
        return db.select(safeColumns).from(users);
    }

    if (caller.role === ROLES.APE) {
        // APE sees all EMPs and RMs — fetch both role groups and merge
        const emps = await db.select(safeColumns).from(users).where(eq(users.role, ROLES.EMP));
        const rms  = await db.select(safeColumns).from(users).where(eq(users.role, ROLES.RM));
        return [...emps, ...rms];
    }

    if (caller.role === ROLES.RM) {
        // RM sees only their direct subordinates
        const mappings = await db
            .select({ employeeId: employeeManager.employeeId })
            .from(employeeManager)
            .where(eq(employeeManager.managerId, caller.userId));

        if (mappings.length === 0) return [];

        const subordinateIds = mappings.map((m) => m.employeeId);

        // Fetch each subordinate — safe for small teams
        const results = await Promise.all(
            subordinateIds.map((id) =>
                db.select(safeColumns).from(users).where(eq(users.id, id)).limit(1)
            )
        );
        return results.flat();
    }

    // EMP has no access — this should be blocked at route level, but guard here too
    const err = new Error("Forbidden: insufficient permissions.");
    err.statusCode = 403;
    throw err;
}

// ─── Assign Manager (CFO only) ────────────────────────────────────────────────

/**
 * Assign an EMP to a manager (RM).
 * CFO-only operation — enforced at route level.
 *
 * Rules:
 *  - employeeId must refer to an EMP.
 *  - managerId must refer to an RM.
 *  - One EMP can report to at most one RM (upsert the existing mapping).
 *
 * @param {{ employeeId: number, managerId: number }} dto
 * @returns {Promise<object>}
 */
export async function assignManager({ employeeId, managerId }) {
    // 1. Validate employee
    const [employee] = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, employeeId))
        .limit(1);

    if (!employee) throw notFound(`User with id ${employeeId} not found.`);
    if (employee.role !== ROLES.EMP)
        throw badRequest(`User ${employeeId} is not an EMP (actual role: ${employee.role}).`);

    // 2. Validate manager
    const [manager] = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, managerId))
        .limit(1);

    if (!manager) throw notFound(`User with id ${managerId} not found.`);
    if (manager.role !== ROLES.RM)
        throw badRequest(`User ${managerId} is not an RM (actual role: ${manager.role}).`);

    // 3. Cannot assign to yourself
    if (employeeId === managerId)
        throw badRequest("An employee cannot be their own manager.");

    // 4. Check existing mapping
    const [existing] = await db
        .select()
        .from(employeeManager)
        .where(eq(employeeManager.employeeId, employeeId))
        .limit(1);

    if (existing) {
        if (existing.managerId === managerId)
            throw conflict(`Employee ${employeeId} is already assigned to manager ${managerId}.`);

        // Update the existing mapping (employee moves to new manager)
        const [updated] = await db
            .update(employeeManager)
            .set({ managerId, updatedAt: new Date() })
            .where(eq(employeeManager.employeeId, employeeId))
            .returning();
        return updated;
    }

    // 5. Insert new mapping
    const [created] = await db
        .insert(employeeManager)
        .values({ employeeId, managerId })
        .returning();

    return created;
}

// ─── Remove Manager (CFO only) ────────────────────────────────────────────────

/**
 * Remove the manager assignment for an EMP.
 * CFO-only operation — enforced at route level.
 *
 * @param {{ employeeId: number }} dto
 * @returns {Promise<object>} the deleted mapping record
 */
export async function removeManager({ employeeId }) {
    // 1. Confirm mapping exists
    const [existing] = await db
        .select()
        .from(employeeManager)
        .where(eq(employeeManager.employeeId, employeeId))
        .limit(1);

    if (!existing) {
        throw notFound(`No manager assignment found for employee ${employeeId}.`);
    }

    // 2. Delete the mapping
    const [deleted] = await db
        .delete(employeeManager)
        .where(eq(employeeManager.employeeId, employeeId))
        .returning();

    return deleted;
}
