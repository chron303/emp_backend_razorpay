import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import onboardingRoutes from "./routes/onboarding.routes.js";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({
    origin:      process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,   // required for cookies
}));

app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/rest/onboardings", onboardingRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message    = err.message    || "Internal Server Error";

    console.error(`[ERROR] ${req.method} ${req.url} →`, err);

    return res.status(statusCode).json({
        success: false,
        message,
    });
});

export default app;
