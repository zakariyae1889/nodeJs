import express from "express";
import {
    create,
    update,
    deleteUsers,
    getAllUsers,
    getUser,
    deleteProfile, 

} from "../controllers/profile.controllers.js";

const router=express.Router();
/* Profiles */
router.post("/create-profile", authMiddleware(["Admins","Users","SubAdmins","Editor"]), create);
router.patch("/update-profile/:username", authMiddleware(["Admins","Users","SubAdmins","Editor"]), update);
router.delete("/delete-profile/:username", authMiddleware(["Admins","Users","SubAdmins","Editor"]), deleteProfile);
/* Users */
router.get("/users", authMiddleware(["Admins"]), getAllUsers);
router.get("/users/me", authMiddleware(["Admins","Users","SubAdmins","Editor"]), getUser);
router.delete("/users/:username", authMiddleware(["Admins"]), deleteUsers);

export default router;