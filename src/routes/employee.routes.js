import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorise }   from "../middlewares/role.middleware.js";
import { ROLES }       from "../enums/roles.enum.js";
import {
    getEmployees,
    assignManagerHandler,
    removeManagerHandler,
} from "../controllers/employee.controller.js";

const router = Router();

// GET /rest/employees  — RM, APE, CFO
router.get(
    "/",
    authenticate,
    authorise(ROLES.RM, ROLES.APE, ROLES.CFO),
    getEmployees
);

// POST /rest/employees/assign  — CFO only
router.post(
    "/assign",
    authenticate,
    authorise(ROLES.CFO),
    assignManagerHandler
);

// DELETE /rest/employees/assign  — CFO only
router.delete(
    "/assign",
    authenticate,
    authorise(ROLES.CFO),
    removeManagerHandler
);

export default router;
