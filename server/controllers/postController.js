import Post from "../models/Post.js";
import Community from "../models/Community.js";

const createPost = async(req, res) => {
    try{
        const userId = req.userId;
        let {text, title} = req.body;
        text = text?.trim();
        title = title?.trim();
        const {communityId} = req.params;
        if(!communityId){
            return res.status(400).json({
                message:"Community id required"
            });
        }
        const existingCommunity = await Community.findById(communityId);
        if(!existingCommunity){
            return res.status(400).json({
                message: "No such community exists"
            });
        }
        if(!text){
            return res.status(400).json({
                message: "Please write something"
            });
        }
        const newPost = await Post.create({
            author: userId,
            text,
            community:communityId,
            title
        });
        res.status(201).json({
            message:"Post created successfully",
            post: newPost
        });

    }catch(err){
        console.log("Error in creating post", err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

const getPosts = async(req,res) => {
    try{
        const {communityId} = req.params;
        if(!communityId){
            return res.status(400).json({
                message:"No communityId found"
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const community = await Community.findById(communityId);
        if(!community){
            return res.status(404).json({
                message: "Community not found!"
            });
        }

        const posts = await Post.find({community: communityId})
            .populate("author", "username")
            .sort({createdAt : -1})
            .skip(skip)
            .limit(limit);

        const formattedPosts = posts.map(post => ({
            ...post.toObject(),
            upvotesCount: post.upvotes.length,
            downvotesCount: post.downvotes.length,
            commentsCount: post.comments.length,
            isUpvoted: post.upvotes.includes(req.userId),
            isDownvoted: post.downvotes.includes(req.userId)
        }));
        return res.json({
            formattedPosts,
            name: community.name,
            description : community.description
        })
    }catch(err){
        console.log("Error in getting posts", err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

const updatePost = async(req,res) => {
    try{ 
        const {communityId, postId} = req.params
        const {title, text} = req.body;
        if(!communityId || !postId){
            return res.status(400).json({
                message:"Missing IDs"
            });
        }
        if(!title && !text){
            return res.status(400).json({
                message:"Provide some updates"
            });
        }
        const community = await Community.findById(communityId);
        if(!community){
            return res.status(404).json({
                message: "Community not found!"
            });
        }

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }
        if(post.community.toString() !== communityId){
            return res.status(400).json({
                message: "Post does not belong to this community"
            });
        }
        if(post.author.toString() !== req.userId){
            return res.status(403).json({
                message: "Not authorized to update this post"
            });
        }
        if(title)
            post.title = title;
        if(text)
            post.text = text;

        const updatedPost = await post.save();
        return res.status(200).json({
            message: "Updated successfully",
            post
        });
    }catch(err){
        console.log("Error in updating post", err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

const deletePost = async(req,res) => {
    try{
        const {communityId, postId} = req.params;
        if(!communityId || !postId){
            return res.status(400).json({
                message:"No ids provided"
            });
        }

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }
        if(post.community.toString() !== communityId){
            return res.status(400).json({
                message: "Post does not belong to this community"
            });
        }
        if(post.author.toString() !== req.userId){
            return res.status(403).json({
                message: "Not authorized to delete this post"
            });
        }
        await post.deleteOne();
        res.json({
            message: "Post deleted successfully"
        });
    }catch(err){
        console.log("Error in deleting post", err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

const reactToPost = async(req, res) => {
    try{
        const userId = req.userId;
        const {communityId, postId} = req.params;
        const {type} = req.body; //whether its a upvote or downvote
        if(!communityId || !postId){
            return res.status(400).json({
                message: "Missing IDs"
            });
        }
        if(!["upvote", "downvote"].includes(type)){
            return res.status(400).json({
                message: "Invalid reaction type"
            });
        }
        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if(post.community.toString() !== communityId){
            return res.status(400).json({
                message: "Post does not belong to this community"
            });
        }
        const alreadyUpvoted = post.upvotes.includes(userId);
        const alreadyDownvoted = post.downvotes.includes(userId);

        if(type === "upvote"){
            if(alreadyUpvoted){
                post.upvotes.pull(userId); //pressing one more time removes the upvote
            }else{
                post.upvotes.push(userId); //else want to change the reaction to downvote
                post.downvotes.pull(userId); 
            }
        }

        if(type === "downvote"){
            if (alreadyDownvoted){
                post.downvotes.pull(userId);
            }else{
                post.downvotes.push(userId);
                post.upvotes.pull(userId); // remove upvote if exists
            }
        }
        await post.save();
        return res.json({
            message: "Reaction updated",
            upvotesCount: post.upvotes.length,
            downvotesCount: post.downvotes.length,
            isUpvoted: post.upvotes.includes(userId),
            isDownvoted: post.downvotes.includes(userId)
        });
    }catch(err){
        console.log("Error in updating reaction", err);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
}

const addComment = async(req, res) => {
    try{
        const userId = req.userId;
        const {postId} = req.params;
        let {text} = req.body;

        if(!text || !text.trim()){
            return res.status(400).json({
                message: "Comment cant be empty"
            });
        }

        text = text.trim();

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const newComment = {
            author: userId,
            text
        };

        post.comments.push(newComment);
        post.commentCount += 1;

        await post.save();

        res.status(201).json({
            message: "Comment added successfully",
            comments: post.comments
        });

    }
    catch(error){
        console.log("Error in adding comment", error);
        res.status(500).json({
            message: error.message
        });
    }
};


const getComment = async(req, res) => {
    try{
        const {postId} = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const post = await Post.findById(postId)
            .populate("comments.author", "username");

        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const comments = post.comments.slice(startIndex, endIndex);

        res.status(200).json({
            comments,
            totalComments: post.commentCount,
            currentPage: page,
            totalPages: Math.ceil(post.commentCount / limit)
        });

    }
    catch(error){
        console.log("Error in getting comments", error);
        res.status(500).json({
            message: error.message
        });
    }
};

const updateComment = async(req, res) => {
    try{
        const userId = req.userId;
        const {postId, commentId} = req.params;
        let {text} = req.body;

        if(!text || !text.trim()){
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        text = text.trim();

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = post.comments.id(commentId);

        if(!comment){
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if(comment.author.toString() !== userId){
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        comment.text = text;

        await post.save();

        res.status(200).json({
            message: "Comment updated successfully",
            comment,
        });

    }
    catch(error){
        console.log("Error in updating comment", error);
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteComment = async(req, res) => {
    try{
        const userId = req.userId;
        const {postId, commentId} = req.params;

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = post.comments.id(commentId);

        if(!comment){
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if(comment.author.toString() !== userId){
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        comment.deleteOne();
        post.commentCount -= 1;

        await post.save();

        res.status(200).json({
            message: "Comment deleted successfully"
        });

    }
    catch(error){
        console.log("Error in deleting comment", error);
        res.status(500).json({
            message: error.message
        });
    }
};


export {createPost, getPosts, updatePost, deletePost, reactToPost, addComment, deleteComment, updateComment, getComment};
