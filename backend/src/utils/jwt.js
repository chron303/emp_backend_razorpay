import jwt from "jsonwebtoken";

const SECRET  = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Sign a JWT with userId and role.
 * @param {{ userId: string, role: string }} payload
 * @returns {string} signed token
 */
export function signToken(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ userId: string, role: string }} decoded payload
 */
export function verifyToken(token) {
    return jwt.verify(token, SECRET);
}
