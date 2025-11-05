import prisma from "../prisma/client.js"
import { generateHybridSlug } from "../utils/helpers.js"
/*---------------create-category-----------------*/
export const create = async (req,res)=>{
  try
  {
    const {name, description}=req.body;

    const userId=req.user.id;

    const slug = generateHybridSlug(name);

    const user=await prisma.user.findUnique({
      where:{id:userId},
      include:{categoryes  :true}
    });
    if(!user){
      return res.status(404).json({error:"user not found"});
    }

    if(!name   || name.trim() === ""){
      return res.status(400).json({error:"Missing fields"});
    }
    const categoriesExisting=await prisma.category.findUnique({
      where:{slug:slug}
    });

    if(categoriesExisting){
      return res.status(400).json({error:"This category alredy exists"});
    }
    const createdCategory =await prisma.category.create({
      data:{
        name:name,
        description:description,
        slug:slug,
        createdByUser:{
          connect:{id:userId}
        }
      },
      include:{
        createdByUser:{
          select:{username:true}
        }

      }

    });
    return res.status(201).json({ message: "Category created successfully"},createdCategory);
  }catch(error){
    console.log(error);
    return res.status(500).json({error:"error server"});
  }
};
/*--------------update-category-----------------*/
export const update = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { slug } = req.params;
    const userId=req.user.id;

    const user=await prisma.user.findUnique({
      where:{id:userId},
      include:{categoryes  :true}
    });

    if(!user){
      return res.status(404).json({error:"user not found"});
    }

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    if (category.createdById !== userId) {
      return res.status(403).json({ error: "You are not allowed to update this category" });
    }

    const newSlug = name ? generateHybridSlug(name) : category.slug;

    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: {
        name: name ?? category.name,
        description: description ?? category.description,
        slug: newSlug,
      },
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } 
  catch (error) 
  {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
/*-------------delete-category------------------*/
export const deleted=async(req,res)=>{
 
  try
  {
    const userId=req.user.id;
    const { slug } = req.params;

    const user=await prisma.user.findUnique({
      where:{id:userId},
     include:{categoryes  :true}
    });

    if(!user){
      return res.status(404).json({ error: "User not found" });
    }

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if(!category){

      res.status(404).json({error:"category not found"});
    }

    if (category.createdById !== userId) {
      return res.status(403).json({ error: "You are not allowed to delete this category" });
    }


    await prisma.category.delete({
      
      where:{slug}
    
    
    });

     return res.status(200).json({ message: "category delete sucessfully" });


  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({error:"Server error"});

  }

};
/*------------get-all-categories----------------*/
export const getAllcategories = async (req,res) =>{
  try
  {
    const categories = await prisma.category.findMany({
      include: { createdByUser: true }
    });

    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: "No categories found" });
    }

    return res.status(200).json({
      message: "Categories fetched successfully",
      count: categories.length,
      categories
    });



  }catch(error)
  {

    console.error(error);
    return res.status(500).json({error:"server error"});
  }
};
/*--------------get-category-------------------*/
export const getcategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: { createdByUser: true }
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json({
      message: "Category fetched successfully",
      category
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};