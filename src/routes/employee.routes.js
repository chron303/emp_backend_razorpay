import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorise }   from "../middlewares/role.middleware.js";
import { ROLES }       from "../enums/roles.enum.js";
import { getEmployees, assignManagerHandler } from "../controllers/employee.controller.js";

const router = Router();

// GET /rest/employees  — RM, APE, CFO
router.get(
    "/",
    authenticate,
    authorise(ROLES.RM, ROLES.APE, ROLES.CFO),
    getEmployees
);

// POST /rest/employees/assign-manager  — CFO only
router.post(
    "/assign-manager",
    authenticate,
    authorise(ROLES.CFO),
    assignManagerHandler
);

export default router;
