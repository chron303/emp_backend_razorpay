import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import onboardingRoutes    from "./routes/onboarding.routes.js";
import roleRoutes          from "./routes/role.routes.js";
import employeeRoutes      from "./routes/employee.routes.js";
import reimbursementRoutes from "./routes/reimbursement.routes.js";
import { errorHandler }    from "./middlewares/error.middleware.js";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,   // required for cookies
}));

app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/rest/onboardings",    onboardingRoutes);
app.use("/rest/roles",          roleRoutes);
app.use("/rest/employees",      employeeRoutes);
app.use("/rest/reimbursements", reimbursementRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

export default app;
