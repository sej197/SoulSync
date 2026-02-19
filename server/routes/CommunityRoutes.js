import express from "express"
import {createCommunity} from "../controllers/CommunityController.js"
import authenticateToken from "../middleware/authmiddleware.js"
import { joinCommunity } from "../controllers/CommunityController.js"
import { leaveCommunity } from "../controllers/CommunityController.js"
import { apporveRequest } from "../controllers/CommunityController.js"
import { rejectRequest } from "../controllers/CommunityController.js"
import { getCommunities } from "../controllers/CommunityController.js"
import { getMyCreatedCommunities } from "../controllers/CommunityController.js"
const router = express.Router()

router.post("/create-community", authenticateToken, createCommunity)
router.post("/:communityId/join", authenticateToken, joinCommunity)
router.post("/:communityId/leave", authenticateToken, leaveCommunity)
router.post("/:communityId/approve/:userId", authenticateToken, apporveRequest)
router.post("/:communityId/reject/:userId", authenticateToken, rejectRequest)
router.post("/get-communities", authenticateToken, getCommunities)
router.post("/get-my-communities", authenticateToken, getMyCreatedCommunities)
export default router