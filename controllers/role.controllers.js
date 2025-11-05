import prisma from "../prisma/client.js";

export const updateRole= async(req,res)=>{
    try{
        const {role,username,email}=req.body;
        let isStaff = false;
        let isSuperuser = false;

        const existingUser=await prisma.user.findFirst({

            where:{
                OR:[
                    {username:username},
                    {email:email}
                ]
            }

        });
        if(!existingUser){
            return res.status(400).json({error:"user not found"});
        }

        if (role === "SubAdmins" || role==="Editor") {
            isStaff = true;
            
        }
       
        else if (role === "Admins") {
            
            isSuperuser=true;
            isStaff=true;

        }
        else{
            
            isSuperuser=false;
            isStaff=false;

        }
       
        const user =await prisma.user.update({
            where:{username:existingUser.username},
            data:{
                role,
                isStaff,
                isSuperuser,
                isActive:true,
            }
        });
        return res.json({ message: "User role updated", user });

    }catch(error){
        console.error(error);
        res.status(500).json({error:"server Error"});
    }
    
}