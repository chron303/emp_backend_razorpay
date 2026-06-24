import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorise }   from "../middlewares/role.middleware.js";
import { ROLES }       from "../enums/roles.enum.js";
import {
    createReimbursementHandler,
    getReimbursementsHandler,
    getReimbursementsByUserHandler,
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

// PATCH /rest/reimbursements  — RM, APE, CFO (reimbursementId in body)
router.patch(
    "/",
    authenticate,
    authorise(ROLES.RM, ROLES.APE, ROLES.CFO),
    decisionHandler
);

// GET /rest/reimbursements  — all authenticated roles
router.get(
    "/",
    authenticate,
    authorise(ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO),
    getReimbursementsHandler
);

// GET /rest/reimbursements/:userId  — all authenticated roles
router.get(
    "/:userId",
    authenticate,
    authorise(ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO),
    getReimbursementsByUserHandler
);

export default router;
