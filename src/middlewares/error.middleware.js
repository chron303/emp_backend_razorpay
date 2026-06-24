import { sendError } from "../utils/response.js";

/**
 * errorHandler
 * ------------
 * Global Express error-handling middleware.
 * Must be registered LAST in app.js (after all routes).
 *
 * Handles:
 *  - Authentication errors  (401)
 *  - Authorization errors   (403)
 *  - Validation errors      (422)
 *  - Not-found errors       (404)
 *  - Unexpected errors      (500)
 *
 * Expects errors to carry:
 *   err.statusCode  – HTTP status (falls back to 500)
 *   err.message     – human-readable message
 *   err.errors      – optional field-level errors (e.g. from Zod)
 *
 * Usage in app.js:
 *   import { errorHandler } from "./middlewares/error.middleware.js";
 *   app.use(errorHandler);   // must be the last app.use()
 *
 * @param {Error} err
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${req.method} ${req.url} →`, err);

    // ── Known HTTP errors (thrown intentionally in controllers/services) ──────
    if (err.statusCode) {
        return sendError(res, err.statusCode, err.message, err.errors ?? null);
    }

    // ── JWT errors (should normally be caught in auth.middleware,
    //    but guard here too as a safety net) ───────────────────────────────────
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return sendError(res, 401, "Unauthorized: invalid or expired token.");
    }

    // ── Unexpected / unhandled errors ─────────────────────────────────────────
    return sendError(res, 500, "Internal Server Error. Please try again later.");
}
