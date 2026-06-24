import { eq } from "drizzle-orm";

import { db } from "../config/db.js";
import { users } from "../../drizzle/schema.js";
import { ROLES } from "../enums/roles.enum.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user with EMP role.
 * Throws if email is already taken.
 *
 * @param {{ name: string, email: string, password: string }} dto
 * @returns {Promise<{ id: string, name: string, email: string, role: string }>}
 */
export async function registerUser({ name, email, password }) {
    // 1. Check email uniqueness
    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existing.length > 0) {
        const err = new Error("Email is already registered");
        err.statusCode = 409;
        throw err;
    }

    // 2. Hash password
    const hashed = await hashPassword(password);

    // 3. Insert with EMP role — role is NOT user-controlled
    const [created] = await db
        .insert(users)
        .values({
            name,
            email,
            password: hashed,
            role:     ROLES.EMP,
        })
        .returning({
            id:    users.id,
            name:  users.name,
            email: users.email,
            role:  users.role,
        });

    return created;
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Validate credentials and return a signed JWT.
 * Throws on invalid email or wrong password.
 *
 * @param {{ email: string, password: string }} dto
 * @returns {Promise<string>} signed JWT
 */
export async function loginUser({ email, password }) {
    // 1. Find user by email
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    // 2. Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    // 3. Sign token with userId and role
    const token = signToken({ userId: user.id, role: user.role });

    return token;
}
