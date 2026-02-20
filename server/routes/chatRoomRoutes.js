import express from "express";
import { getMessages, deleteMessage } from "../controllers/chatRoomController.js";
import userAuth from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/:communityId/messages", userAuth, getMessages);
router.delete("/:communityId/messages/:messageId", userAuth, deleteMessage);

export default router;
