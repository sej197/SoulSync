import express from "express"
import {createCommunity} from "../controllers/CommunityController.js"
import authenticateToken from "../middleware/authmiddleware.js"
import { joinCommunity } from "../controllers/CommunityController.js"
const router = express.Router()

router.post("/create-community", authenticateToken, createCommunity)
router.post("/:communityId/join", authenticateToken, joinCommunity)
export default router