import prisma from "../prisma/client.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {generateAccessToken,generateRefreshToken,refresh_token_secret} from "../utils/helpers.js";
/*-----------------------Register-----------------------------------------*/
export const register = async(req,res)=>{
    try{
        const {username,email,password,passwordConfirm}=req.body;

        if(!username || !email || !password || !passwordConfirm ){
            return res.status(400).json({error:"Missing fields"});
        }
        if (password !== passwordConfirm) {
            return res.status(400).json({ error: "Passwords do not match" });
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: "Wrong Username or email or password" });
        }
        const hashed=await bcrypt.hash(password,10);

        const userCount=await prisma.user.count();
        
        let roleName;
        let isSuperuser;
        let isStaff;
        
        if(userCount===0){
            roleName="Admins";
            isSuperuser=true;
            isStaff=true;

        }else{
            roleName="Users";
            isSuperuser=false;
            isStaff =false;
        }
        const user= await prisma.user.create({
            data:
            {
                username,
                email,
                password:hashed,
                role:roleName,
                isActive:true,
                isSuperuser:isSuperuser,
                isStaff:isStaff,
                
                
            },
           
            
        });
        res.status(201).json({ message: "User created",user});
    }catch(error){
        console.error(error)
        res.status(500).json({error:"server error"});
    }
};
/*-----------------------Login-----------------------------------------*/
export const login = async(req,res)=>{
    try{
          
        const {username,password}=req.body;
        
        const user= await prisma.user.findUnique({where:{username}});

        const accessToken=generateAccessToken(user);
        const refreshToken=generateRefreshToken(user);

        const validPassword=await bcrypt.compare(password,user.password);


        //user.isActive=true;
        if(!user ) {
            return res.status(400).json({error:"Invalid credentials"});
        }
        if(!validPassword)
        {
            
            return res.status(400).json({error:"Invalid credentials"});

        }
        
       
        let isSuperuser;
        let isStaff;
        let role;
        if (role === "SubAdmins" || role==="Editor") {
            isStaff = true;
            
        }
       
        else if (role === "Admins") {
            
            isSuperuser=true;
            isStaff=true;

        }

        await prisma.user.update({
            where:{username:user.username},
            data:{
               
                refreshToken,
                role:role,
                isActive:true,
                isStaff:isStaff,
                isSuperuser:isSuperuser,

                

            }
        });


        res.cookie("refreshToken",refreshToken,{
    
            httpOnly:true,
            secure:true,
            sameStie:"strict",
            maxAage:7 * 24 * 60 * 60 * 1000,

            
        });

        return res.status(201).json({
            accessToken,
            refreshToken,
            
            
        
        });

    }catch(error){
        console.error(error);
        res.status(500).json({error:"server Error"});
    }
    
};
/*-----------------------refresh_token-----------------------------------------*/
export const refreshToken = async(req,res)=>{
    try{
        
        const oldRefreshToken=req.cookies.refreshToken;

        if(!oldRefreshToken){

            return res.status(401).json({error:"No refresh Token Provider"});
        }

        const user = await prisma.user.findFirst({where:{refreshToken:oldRefreshToken}});

        if (!user){
            return req.status(401).json({error:"Invalid Refresh Token"});
        }


        jwt.verify(oldRefreshToken,refresh_token_secret,async (err) =>{

            if(err){
                return res.status(403).json({error:"Invalid Token"});
            }
            const NewAccessToken=generateAccessToken(user);
            const NewRefreshToken=generateRefreshToken(user);
            await prisma.user.updateMany({where:{username:user.username},data:{refreshToken:NewRefreshToken}});

            res.cookie("refreshToken",NewRefreshToken,{
                httpOnly:true,
                secure:true,
                sameStie:"strict",
                maxAage: 7 * 24 * 60 * 60  * 1000

            });
            res.status(200).json({
                accessToken:NewAccessToken,
                refreshToken:NewRefreshToken
            });
        });

    }catch(error){
        console.error(error);
        res.status(500).json({error:"server Error"});
    }
};
/*-----------------------Logout-----------------------------------------*/
export const logout = async(req,res)=>{
    try{
       const refreshToken = req.cookies.refreshToken;
       
       const accessToken = req.headers.authorization?.split(" ")[1];
          

        if(!refreshToken && !accessToken){
            return res.status(204).json({"message":"No token to delete"});
        }
        
        
        const user = await prisma.user.findFirst({
        
            where: { refreshToken },
        });
        

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await prisma.user.updateMany({
            where: { id: user.id },
            data: {
                refreshToken: null,
                isActive: false,
            },
        });


        if(accessToken){
            await prisma.tokenBlacklist.create({
                data:{token:accessToken}
            });
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });
        
        
        res.status(200).json({message:"Logged out Successfully"});

    }catch(error){
        console.error(error);
        res.status(500).json({error:"server Error"});
    }
};
/*-----------------------PasswordChange--------------------------*/
export const passwordChange = async(req,res)=>{
    try{

        const {oldPassword,newPassword,confirmPassword}=req.body;
        const userId = req.user.id;

        const user=await prisma.user.findUnique({where:{id:userId}});


        if(!user){return res.status(400).json({error:" Invalid credentials"});}

        const validPassword=await bcrypt.compare(oldPassword,user.password);

        if(!validPassword){return res.status(400).json({error:"Invalid credentials"});}

        if(newPassword!==confirmPassword){res.status(400).json({error:"Password do not match"});}

        const hashed=await bcrypt.hash(newPassword,10);

        await prisma.user.update({
            where:{id:userId},
            data:{
                password:hashed,
                
            }

        });


        const accessToken=generateAccessToken(user);
        const refreshToken=generateRefreshToken(user);


        res.cookie("refreshToken",refreshToken,{

            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAage:7 * 24 * 60 * 60 * 1000
        });


        return res.status(200).json({
            message:"password change Successfully",
            accessToken,
            refreshToken,
        });

    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"server error"});
    }
};
