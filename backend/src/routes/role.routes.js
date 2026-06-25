import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorise }   from "../middlewares/role.middleware.js";
import { ROLES }       from "../enums/roles.enum.js";
import { assignRoleHandler } from "../controllers/role.controller.js";

const router = Router();

// POST /rest/roles/assign  — CFO only
router.post(
    "/assign",
    authenticate,
    authorise(ROLES.CFO),
    assignRoleHandler
);

export default router;
