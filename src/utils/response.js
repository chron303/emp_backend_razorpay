/**
 * Send a standardised success response.
 *
 * @param {import("express").Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} [data]
 */
export function sendSuccess(res, statusCode, message, data = null) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    return res.status(statusCode).json(body);
}

/**
 * Send a standardised error response.
 *
 * @param {import("express").Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} [errors]
 */
export function sendError(res, statusCode, message, errors = null) {
    const body = { success: false, message };
    if (errors !== null) body.errors = errors;
    return res.status(statusCode).json(body);
}
