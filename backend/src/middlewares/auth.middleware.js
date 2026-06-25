import { verifyToken } from "../utils/jwt.js";
import { sendError }   from "../utils/response.js";

/**
 * authenticate
 * -----------
 * Reads the JWT from the `auth` cookie, verifies it,
 * and attaches { userId, role } to req.user.
 *
 * On failure → 401 Unauthorized
 */
export function authenticate(req, res, next) {
    const token = req.cookies?.auth;

    if (!token) {
        return sendError(res, 401, "Unauthorized: no auth cookie found.");
    }

    try {
        const decoded = verifyToken(token); // { userId, role, iat, exp }

        req.user = {
            userId: decoded.userId,
            role:   decoded.role,
        };

        next();
    } catch (err) {
        // jwt.verify throws JsonWebTokenError, TokenExpiredError, etc.
        if (err.name === "TokenExpiredError") {
            return sendError(res, 401, "Unauthorized: session expired. Please log in again.");
        }
        return sendError(res, 401, "Unauthorized: invalid token.");
    }
}
