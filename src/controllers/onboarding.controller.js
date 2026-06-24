import { validateRegister, validateLogin } from "../validators/auth.validator.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ─── Cookie config ────────────────────────────────────────────────────────────

const COOKIE_NAME = "auth_token";

const cookieOptions = {
    httpOnly: true,                          // not accessible from JS
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,      // 7 days in ms
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /rest/onboardings/register
 * Does NOT log the user in — only creates the account.
 */
export async function register(req, res, next) {
    try {
        const result = validateRegister(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed", result.error.flatten().fieldErrors);
        }

        const user = await registerUser(result.data);

        return sendSuccess(res, 201, "Account created successfully", user);
    } catch (err) {
        next(err);
    }
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /rest/onboardings/login
 * Validates credentials, sets httpOnly auth cookie, returns success.
 */
export async function login(req, res, next) {
    try {
        const result = validateLogin(req.body);

        if (!result.success) {
            return sendError(res, 422, "Validation failed", result.error.flatten().fieldErrors);
        }

        const token = await loginUser(result.data);

        res.cookie(COOKIE_NAME, token, cookieOptions);

        return sendSuccess(res, 200, "Logged in successfully");
    } catch (err) {
        next(err);
    }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /rest/onboardings/logout
 * Clears the auth cookie.
 */
export async function logout(req, res, next) {
    try {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return sendSuccess(res, 200, "Logged out successfully");
    } catch (err) {
        next(err);
    }
}
