import jwt from "jsonwebtoken";
import { access_token_secret } from "../utils/helpers.js";
import prisma from "../prisma/client.js";

export const authMiddleware = (roles = []) => {
  return async(req, res, next) => {
    try {

      const authHeader = req.headers["authorization"];

      if (!authHeader) {return res.status(401).json({ error: "No token Provided" });}

      const token = authHeader.split(" ")[1]; 

      if(!token){return res.status(401).json({ error: "Invalid Token" });}

      const blacklist= await prisma.tokenBlacklist.findFirst({
        where:{token:token}
      
      
      });

      if(blacklist){
        return res.status(401).json({error:"Token has  been revoked"});
      }

      const decoded=jwt.verify(token,access_token_secret);
      req.user=decoded;

      if(roles.length && !roles.includes(req.user.role)){
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
};
