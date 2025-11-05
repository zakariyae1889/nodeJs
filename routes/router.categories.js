import express from "express";
import { create,update,deleted,getAllcategories,getcategory } from "../controllers/category.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router=express.Router();
/* Categorites */
router.post("/create-category",authMiddleware(["SubAdmins","Admins"]),create);
router.patch("/update-category/:slug",authMiddleware(["SubAdmins","Admins"]),update);
router.delete("/delete-category/:slug",authMiddleware(["Admins"]),deleted);
router.get("/category",authMiddleware(["SubAdmins","Admins"]),getcategory);
router.get("/categories",getAllcategories);

export default router;