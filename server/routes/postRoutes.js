import express from "express";
import {getPosts, createPost, updatePost, reactToPost ,deletePost, getComment, updateComment, deleteComment, addComment} from "../controllers/postController.js";
import userAuth from "../middleware/authmiddleware.js";

const router = express();

router.get("/:communityId", userAuth, getPosts);
router.post("/:communityId", userAuth, createPost);
router.patch("/:communityId/:postId",userAuth, updatePost);
router.delete("/:communityId/:postId", userAuth, deletePost);
router.post("/:communityId/:postId/react", userAuth, reactToPost);

//comments routes
router.get("/:postId/comments/", userAuth, getComment);
router.post("/:postId/comments/", userAuth, addComment);
router.patch("/:postId/comments/:commentId", userAuth, updateComment);
router.delete("/:postId/comments/:commentId", userAuth, deleteComment);

export default router;