import express from "express";
import { register,login,logout,refreshToken ,passwordChange} from "../controllers/auth.controllers.js";
import { authMiddleware  } from "../middleware/auth.middleware.js";

const router=express.Router();

router.post("/register",register);

router.post("/login",login);

router.post("/logout",authMiddleware(["Users","SubAdmins","Admins","Editor"]),logout);

router.patch("/change-password",authMiddleware(["Users","SubAdmins","Admins","Editor"]),passwordChange);

router.get('/refresh',refreshToken);


export default router;