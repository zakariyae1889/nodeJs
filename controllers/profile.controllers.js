// CRUD Opertion
import prisma from "../prisma/client.js";
/*-------------createProfile--------*/
export const create =async (req,res)=>{
  try{
        const {firstName,lastName,bio,avatar}=req.body;
        const userId = req.user.id;
        const user=await prisma.user.findUnique({
          where:{id:userId},
          include:{profile:true}
        });

        if(!user){
            return res.status(404).json({error:"user not found"});
        }
        if(user.profile){
            return res.status(400).json({ error: "Profile already exists" });
            
        }
        const newProfile=await prisma.profile.create({
            data:{
              firstName:firstName || "",
              lastName:lastName || "" ,
              bio:bio || "",
              avatar:avatar || "",
              user:{connect:{id:user.id}}
            },
        });
        return res.status(201).json({  
            message: "Profile created successfully",
            profile: newProfile,
        });
  }catch(error){
      console.log(error);
      return res.status(500).json({error:"server error"});
    }
};
/*-------------updateProfile--------*/
export const update = async(req,res)=>{
    try{

      const {username}=req.params;  
      const { firstName, lastName, bio, avatar } = req.body;
        
        const user=await prisma.user.findUnique({
            where:{username:username},
            include:{profile:true}
        });

         if(!user){
            return res.status(404).json({error:"user not found"});
        }
        if(!user.profile){
            return res.status(400).json({ error: "Profile not found" });
            
        }
        if (req.user.id !== user.id) {
          return res.status(403).json({ error:  "You are not allowed to update this profile" });
        }

        
        //?? Nullish Coalescing Operator
        
        const updatedProfile=await prisma.profile.update({
          where: { userId: user.id },
          data:{
            firstName:firstName ?? user.profile.firstName,
            lastName:lastName ?? user.profile.lastName,
            bio:bio ?? user.profile.bio,
            avatar:avatar ?? user.profile.avatar, 
          }
        });

        return res.status(200).json({message:"Profile updated Successfully",profile:updatedProfile});


    }catch(error){
        console.log(error);
        return res.status(500).json({error:"server error"});
    }
};
/*--------------deleteUsers----------*/
export const deleteUsers = async (req, res) => {
  try {
    const { username } = req.params;


    const user = await prisma.user.findUnique({
      where: { username },
      include: { profile: true, articles: true, comments: true, favorite: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!req.user.isSuperuser) {
      return res.status(403).json({ error: "Forbidden: Not allowed" });
    }

   
    if (user.isSuperuser) {
      const adminCount = await prisma.user.count({
        where: { isSuperuser: true }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot delete the last Admin in the system" });
      }
    }

    
    await prisma.comments.deleteMany({ where: { userId: user.id } });
    await prisma.favorites.deleteMany({ where: { userId: user.id } });
    await prisma.article.deleteMany({ where: { authorId: user.id } });

    if (user.profile) {
      await prisma.profile.delete({ where: { userId: user.id } });
    }

    
    await prisma.user.delete({ where: { id: user.id } });

    return res.status(200).json({ message: "User and all related data permanently deleted" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};
/*------------deleteProfile----------*/
export const deleteProfile=async (req,res)=>{
  try{

    const { username } = req.params;


    const user=await prisma.user.findUnique({

      where:{username:username},
      include:{profile:true}
    });

    if(!user){
      res.status(404).json({message:"No user found"});
    }

    if (req.user.id !== user.id) {
      return res.status(403).json({ error:  "You are not allowed to update this profile" });
    }


   
    await prisma.profile.delete({ where: { userId: user.id } });

    return res.status(200).json({ message: "Profile deleted Successfully" });
    

  }
  catch(error){


    console.log(error);
    return res.status(500).json({error:"Server error"});


  }
};
/*-----------get-All-Users-----------*/
export const getAllUsers = async (req,res) =>{
 
  try{

    const users=await prisma.user.findMany({
      include:{profile:true},
    });

    if(!users || users.length===0){

      return res.status(400).json({message:"No users found"});
    }

    return res.status(200).json({message:"Users fetched successfully" , count:users.length, users:users});

  }catch(error){
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }

};
/*------------get-user--------------*/
export const getUser = async (req,res) =>{
 
  try{

    const userId = req.user.id;
    const user=await prisma.user.findUnique({
      where:{id:userId},
      include:{profile:true},
    });

    if(!user){

      return res.status(400).json({message:"No users found"});
    }

    return res.status(200).json({message:"User fetched successfully"  ,user:user});

  }catch(error){
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }

};