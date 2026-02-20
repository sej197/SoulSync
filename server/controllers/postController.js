import Post from "../models/Post.js";
import Community from "../models/Community.js";
import User from "../models/User.js";
import axios from "axios";
import transporter from "../config/nodemailer.js";
import hateSpeechWarningEmail from "../emails/hateSpeechWarningEmail.js";

const HATE_SPEECH_THRESHOLD = 0.6;
const MAX_WARNINGS = 3;


const checkHateSpeech = async (text) => {
    try {
        const response = await axios.post(
            `${process.env.PYTHON_SERVER}/hatespeech/analyze`,
            { text }
        );
        return response.data.paragraphScore ?? 0;
    } catch (error) {
        console.error("Hate speech API error:", error.message);
        return 0; // fail open — don't block on API errors
    }
};


const flagUser = async (userId, postId, score, text) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const snippet = text.length > 100 ? text.substring(0, 100) + "..." : text;

        user.hate_speech_warnings += 1;
        user.hate_speech_logs.push({
            postId,
            score,
            text_snippet: snippet,
            date: new Date()
        });

        if (user.hate_speech_warnings >= MAX_WARNINGS) {
            user.is_banned = true;
        }

        await user.save();

        // Send warning email
        const { subject, text: emailBody } = hateSpeechWarningEmail(
            user.username, 
            user.hate_speech_warnings, 
            snippet
        );
        transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject,
            text: emailBody
        }).catch(err => console.error("Warning email error:", err.message));

        return user;
    } catch (error) {
        console.error("Error flagging user:", error.message);
    }
};

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

        // Check if user is banned
        const author = await User.findById(userId);
        if(author?.is_banned){
            return res.status(403).json({
                message: "Your account has been suspended due to community guidelines violations. You cannot create posts."
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

        // Check for hate speech
        const fullText = title ? `${title} ${text}` : text;
        const hateSpeechScore = await checkHateSpeech(fullText);
        const isFlagged = hateSpeechScore >= HATE_SPEECH_THRESHOLD;

        const newPost = await Post.create({
            author: userId,
            text,
            community:communityId,
            title,
            hate_speech_flag: isFlagged
        });

        // If flagged, warn the user
        if(isFlagged){
            const updatedUser = await flagUser(userId, newPost._id, hateSpeechScore, fullText);
            return res.status(201).json({
                message: "Your post has been flagged for violating community guidelines. A warning has been issued to your account.",
                post: newPost,
                hate_speech_warning: true,
                user: updatedUser
            });
        }

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
            isDownvoted: post.downvotes.includes(req.userId),
            hateSpeechFlag: post.hate_speech_flag
        }));

        // Get current user's warning status
        const currentUser = await User.findById(req.userId).select('hate_speech_warnings is_banned');

        return res.json({
            formattedPosts,
            name: community.name,
            description : community.description,
            userWarnings: currentUser?.hate_speech_warnings || 0,
            userBanned: currentUser?.is_banned || false
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

        // Re-check for hate speech on update
        const fullText = (post.title || '') + ' ' + post.text;
        const hateSpeechScore = await checkHateSpeech(fullText.trim());
        const isFlagged = hateSpeechScore >= HATE_SPEECH_THRESHOLD;
        post.hate_speech_flag = isFlagged;

        const updatedPost = await post.save();

        if(isFlagged){
            const updatedUser = await flagUser(req.userId, post._id, hateSpeechScore, fullText.trim());
            return res.status(200).json({
                message: "Post updated but flagged for violating community guidelines. A warning has been issued.",
                post: updatedPost,
                user: updatedUser,
                hate_speech_warning: true
            });
        }

        return res.status(200).json({
            message: "Updated successfully",
            post: updatedPost
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

        // If the post was flagged, decrement warnings and remove the log entry
        if(post.hate_speech_flag){
            await User.findByIdAndUpdate(req.userId, {
                $inc: { hate_speech_warnings: -1 },
                $pull: { hate_speech_logs: { postId: post._id } }
            });
        }

        await post.deleteOne();

        // Return updated warning info
        const updatedUser = await User.findById(req.userId).select('hate_speech_warnings is_banned');
        res.json({
            message: "Post deleted successfully",
            userWarnings: updatedUser?.hate_speech_warnings || 0,
            userBanned: updatedUser?.is_banned || false
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

        // Check if user is banned
        const author = await User.findById(userId);
        if(author?.is_banned){
            return res.status(403).json({
                message: "Your account has been suspended due to community guidelines violations. You cannot post comments."
            });
        }

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Check comment for hate speech
        const hateSpeechScore = await checkHateSpeech(text);
        const isFlagged = hateSpeechScore >= HATE_SPEECH_THRESHOLD;

        const newComment = {
            author: userId,
            text,
            hate_speech_flag: isFlagged
        };

        post.comments.push(newComment);
        post.commentCount += 1;

        await post.save();

        if(isFlagged){
            await flagUser(userId, post._id, hateSpeechScore, text);
            return res.status(201).json({
                message: "Comment added but flagged for violating community guidelines. A warning has been issued.",
                comments: post.comments,
                hate_speech_warning: true
            });
        }

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

        // Re-check for hate speech on comment update
        const hateSpeechScore = await checkHateSpeech(text);
        const isFlagged = hateSpeechScore >= HATE_SPEECH_THRESHOLD;
        const wasFlagged = comment.hate_speech_flag || false;
        comment.hate_speech_flag = isFlagged;

        await post.save();

        // If previously flagged and now clean, decrement warnings
        if(wasFlagged && !isFlagged){
            await User.findByIdAndUpdate(userId, {
                $inc: { hate_speech_warnings: -1 },
                $pull: { hate_speech_logs: { postId: post._id } }
            });
            const updatedUser = await User.findById(userId).select('hate_speech_warnings is_banned');
            return res.status(200).json({
                message: "Comment updated and flag removed!",
                comment,
                flag_removed: true,
                userWarnings: updatedUser?.hate_speech_warnings || 0,
                userBanned: updatedUser?.is_banned || false
            });
        }

        // If newly flagged on update
        if(!wasFlagged && isFlagged){
            await flagUser(userId, post._id, hateSpeechScore, text);
            return res.status(200).json({
                message: "Comment updated but flagged for violating community guidelines.",
                comment,
                hate_speech_warning: true
            });
        }

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
