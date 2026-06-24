import { eq } from "drizzle-orm";

import { db }    from "../config/db.js";
import { users } from "../../drizzle/schema.js";
import { ROLES } from "../enums/roles.enum.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function notFound(message) {
    const err = new Error(message);
    err.statusCode = 404;
    return err;
}

function conflict(message) {
    const err = new Error(message);
    err.statusCode = 409;
    return err;
}

function badRequest(message) {
    const err = new Error(message);
    err.statusCode = 400;
    return err;
}

// ─── Assign Role ──────────────────────────────────────────────────────────────

/**
 * Assign a new role to any user.
 * Only CFO is allowed to call this — enforced at the route level.
 *
 * Rules:
 *  - Target user must exist.
 *  - Cannot demote / change the CFO's own role.
 *
 * @param {{ userId: number, role: string }} dto
 * @returns {Promise<{ id: number, name: string, email: string, role: string }>}
 */
export async function assignRole({ userId, role }) {
    // 1. Fetch target user
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) throw notFound(`User with id ${userId} not found.`);

    // 2. Guard: cannot reassign the CFO account
    if (user.role === ROLES.CFO && role !== ROLES.CFO) {
        throw badRequest("The CFO role cannot be reassigned.");
    }

    // 3. Guard: role is already what is requested
    if (user.role === role) {
        throw conflict(`User already has role '${role}'.`);
    }

    // 4. Update role
    const [updated] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({
            id:    users.id,
            name:  users.name,
            email: users.email,
            role:  users.role,
        });

    return updated;
}
