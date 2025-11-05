import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

import dotenv from "dotenv";

dotenv.config()

export const access_token_secret=process.env.ACCESS_TOKEN_SECRET;
export const refresh_token_secret=process.env.REFRESH_TOKEN_SECRET;
//token
export const generateAccessToken = (user)=>{
    return jwt.sign({

        id:user.id,
        username:user.username,
        firstname:user.firstName,
        lastname:user.LastName,
        email:user.email,
        role:user.role,
        isSuperuser:user.isSuperuser,
        isStaff:user.isStaff,
        isActive:user.isActive,
       
    },
        access_token_secret,
        {expiresIn:"15m"}
    )
};
export const generateRefreshToken =(user)=>{

    return jwt.sign(
        {
            id:user.id,
            username:user.username,
            firstname:user.firstName,
            lastname:user.LastName,
            email:user.email,
            role:user.role,
            isSuperuser:user.isSuperuser,
            isStaff:user.isStaff,
            isActive:user.isActive,
           

        },
        refresh_token_secret,
        {expiresIn:"7d"}

    );
}
//slug develper-abbcd123dddf

export const generateHybridSlug=(text)=>{
    const uuidShort=uuidv4().split("-")[0];
    return `${slugify(text)}-${uuidShort}`;
}
