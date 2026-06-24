import { Router } from "express";
import { register, login, logout } from "../controllers/onboarding.controller.js";

const router = Router();

// POST /rest/onboardings/register
router.post("/register", register);

// POST /rest/onboardings/login
router.post("/login", login);

// POST /rest/onboardings/logout
router.post("/logout", logout);

export default router;
