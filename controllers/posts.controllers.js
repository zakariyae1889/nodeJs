import prisma from "../prisma/client.js";
import { generateHybridSlug } from "../utils/helpers.js";
/*--------------------create---------------------------*/



export const create = async (req,res)=>{
    try
    {
        //const role=req.user.role;
        const userId=req.user.id;
        const {title, description,categoryName,data}=req.body;

        const slug=generateHybridSlug(title);


        const user=await prisma.user.findUnique({
            where:{id:userId},
            include:{articles:true}

        });

        if(!user){
            return res.status(404).json({error:"user not found"});
        }
        if(!title || !categoryName){
            return res.status(400).json({error:"title and category are required"});
        }

        const ArticlesExisting=await prisma.article.findUnique({
            where:{slug:slug}
        });

        if(ArticlesExisting){
            return res.status(400).json({error:"This article  alredy exists"});
        }

        const category=await prisma.category.findUnique({
            where:{name:categoryName}
        });


        if(!category){
            return res.status(400).json({error:"Category not found"});
        }

        const newArticle=await prisma.article.create({
            data:{
                title:title,
                description:description,
                slug:slug,
                status:req.user.role === "Users" ? "PENDING":"PUBLISHED",
                data:data || {},
                category:{
                    connect:{id:category.id}
                },
                author:{
                    connect:{id:userId}
                },
            },
            include:{
                author:{
                    select:{username:true}
                },
                category:{
                    select:{name:true}
                },
            },
        });
        res.status(201).json({
            message: "Article created successfully",
            article: newArticle,
        });


    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({error:"server error"});
    }
};
/*--------------------update---------------------------*/
async function canEditArticle (user,article){
    const {userId,role}=req.user.id;


    if(role === "Users"){return false};

    if(role === "Editor"){return article.authorId === userId };


}
export const  update=async (req,res) =>{
    try{

        const {slug}=req.params;
        const {title, description,categoryName,data}=req.body;
        const {userId ,role}=req.user.id;


        const article=await prisma.article.findUnique({
            where:{slug},
            include:{category:true,author:true}
        });

        if(!article){
            return res.status(400).json({error:"article not found"});
        }

        const user=await prisma.user.findUnique({
            where:{id:userId},
           
        });

        if(!user){
            return res.status(400).json({error:"user not found"});
        }

       
        if(role === "Users"){
            return res.status(403).json({
                error:"you cannot edit articles"
            });
        }
        if(role === "Editor" && article.authorId !== userId){
            return res.status(403).json({
                error:"Editors can only edit their own articles"
            });
        }
        if(role === "SubAdmins"){
            const articleCategory=await prisma.category.findUnique({
                where:{id:article.categoryId}
                 
            });
            if(articleCategory.createdById!==userId){
                return res.status(403).json({
                    error: "You cannot edit articles outside your categories",
                });
            }
        }
        const updatedSlug=title ? generateHybridSlug(title):article.slug;

        let  categoryConnect=undefined;

        if (categoryName) {
            const category = await prisma.category.findUnique({
                where: { name: categoryName },
            });
            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }
            categoryConnect = { connect: { id: category.id } };
        }

        const updatedArticle=await prisma.article.update({
            where:{slug},
            data:{
                title: title ?? article.title,
                description:description ?? article.description,
                slug:updatedSlug,
                data: data ?? article.data,
                ...(categoryConnect && { category: categoryConnect })
            },
            include:{
                author: { select: { username: true,role:true } },
                category: { select: { name: true } },
            }
        });
        return res.status(200).json({ message: "Article updated successfully", article: updatedArticle });


    }catch(error){
        console.log(error);
        res.status(500).json({error:"server error"});
    }
}
