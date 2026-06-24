import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorise }   from "../middlewares/role.middleware.js";
import { ROLES }       from "../enums/roles.enum.js";
import {
    createReimbursementHandler,
    getReimbursementsHandler,
    getReimbursementHandler,
    decisionHandler,
} from "../controllers/reimbursement.controller.js";

const router = Router();

// POST /rest/reimbursements  — EMP only
router.post(
    "/",
    authenticate,
    authorise(ROLES.EMP),
    createReimbursementHandler
);

// GET /rest/reimbursements  — all authenticated roles
router.get(
    "/",
    authenticate,
    authorise(ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO),
    getReimbursementsHandler
);

// GET /rest/reimbursements/:id  — all authenticated roles
router.get(
    "/:id",
    authenticate,
    authorise(ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO),
    getReimbursementHandler
);

// PATCH /rest/reimbursements/:id/decision  — RM, APE, CFO
router.patch(
    "/:id/decision",
    authenticate,
    authorise(ROLES.RM, ROLES.APE, ROLES.CFO),
    decisionHandler
);

export default router;
