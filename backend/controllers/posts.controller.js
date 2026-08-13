import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import Comment from "../models/comments.model.js"
import Profile from "../models/profile.model.js"
import bcrypt from "bcrypt"

export const activeCheck = async(req, res) =>{
    return res.status(200).json({message : "Server is active and running "})
}


export const createPost = async (req, res) =>{
    const {token} = req.body;

    try{
        const user = await User.findOne({token : token});

        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        const fileType = req.file?.mimetype
            ? req.file.mimetype.split("/")[1] || req.file.mimetype
            : "";

        const post = new Post({
            userId : user._id,
            body : req.body.body,
            media : req.file ? req.file.filename : "",
            fileType,
        })

        await post.save();

        return res.status(200).json({message : "Post Created"})

    }
    catch(err){
        return res.status(500).json({message : err.message});
    }
}

export const getAllPosts = async (req, res) =>{
    try{
        const posts = await Post.find()
            .populate('userId', 'name username email profilePicture');

        if (!posts || posts.length === 0) {
            return res.status(200).json({ message: "No posts found", posts: [] });
        }

        return res.status(200).json(posts);

    }
    catch(err){
        return res.status(500).json({message : "bad request for post", err : err.message});
    }

}

export const deletePost = async (req, res) => {
    const {token, post_id} = req.body;

    try{
        const user = await User.findOne({token : token}).select("_id");

        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        const post = await Post.findOne({_id : post_id});

        if(!post){
            return res.status(404).json({message : "post not found"}); 
        }

        if(post.userId.toString() !== user._id.toString()){
            return res.status(401).json({message : "Unauthorized"}); 
        }

        await Post.deleteOne({_id : post_id});

        return res.json({message : "Post Deleted"});

    }
    catch(err){
        return res.status(400).json({message : err.message});
    }
}

export const commentPost = async (req, res)=>{
    const {token, post_id, comment} = req.body;

    try{

        const user = await User.findOne({token : token}).select("_id");
        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        const post = await Post.findOne({
            _id : post_id
        });
         if(!post){
            return res.status(404).json({message : "post not found"});
        }

        const newComment = new Comment({
            userId : user._id,
            postId : post_id,
            body : comment
        });

        await newComment.save();

        return res.status(200).json({message : "Comment Added Successfully"});

    }
    catch(err){
        return res.status(500).json({message : "bad request", err : err.message});
    }
}

export const getCommentByPost = async (req, res) =>{
    const {post_id} = req.query;

    try{
        const post = await Post.findOne({_id : post_id});
        
        if(!post){
            return res.status(404).json({message : "Post not found"});
        }

        const comments = await Comment.find({postId : post_id}).populate("userId", "name username profilePicture");

        return res.json({comments});
    }
    catch(err){
        return res.status(500).json({message : "bad request", err : err.message});
    }
}

export const deleteCommentOfUser = async (req, res) =>{
    const {token, post_id, comment_id} = req.body;

    try{

        const user = await User.findOne({token : token}).select("_id");

        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        const comment = await Comment.findOne({'_id' : comment_id});
         if(!comment){
            return res.status(404).json({message : "comment not found"});
        }
        
        if(comment.userId.toString() !== user._id.toString()){
            return res.status(401).json({message : "Unauthorized"}); 
        }

        await Comment.deleteOne({'_id' : comment_id});


    }
    catch(err){
        return res.status(500).json({message : "bad request", err : err.message});
    }
}

// export const incrementLikes = async (req, res) =>{
//     const {post_id} = req.body;

//     try{
//         const post = await Post.findOne({_id : post_id});

//         if(!post){
//             return res.status(404).json({message : "post not found"}); 
//         }

//         post.likes = post.likes + 1 ;

//         await post.save();

//         return res.json({message : "likes incremented"});

//     }
//     catch(err){
//         return res.status(500).json({message : "Likes not incremented", err : err.message});
//     }
// }

export const incrementLikes = async (req, res) =>{
    const {post_id, token} = req.body;

    try{
        const user = await User.findOne({token : token}).select("_id");

        if(!user){
            return res.status(404).json({message : "user not found"});
        }

        const post = await Post.findOne({_id : post_id});

        if(!post){
            return res.status(404).json({message : "post not found"}); 
        }

        const userIdStr = user._id.toString();

        const alreadyLiked = post.likedBy.some(
            (id) => id.toString() === userIdStr
        );

        if (alreadyLiked) {
            post.likedBy = post.likedBy.filter(
                (id) => id.toString() !== userIdStr
            );
            post.likes = Math.max(0, post.likes - 1);

            await post.save();
            return res.json({
                message : "like removed",
                liked : false,
                likes : post.likes
            });
        }

        post.likedBy.push(user._id);
        post.likes = post.likes + 1;

        await post.save();
        return res.json({
            message : "likes incremented",
            liked : true,
            likes : post.likes
        });
    }
    catch(err){
        return res.status(500).json({message : "Likes not incremented", err : err.message});
    }
}