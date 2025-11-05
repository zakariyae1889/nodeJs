import express from "express";
import { updateRole } from "../controllers/role.controllers.js";
const router = express.Router();
router.patch("/roles",authMiddleware(["Admins"]),updateRole);
export default router;