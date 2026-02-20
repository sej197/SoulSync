import Community from "../models/Community.js";
import User from "../models/User.js";
import { invalidateUserCache } from "../utils/cacheUtils.js";

const checkIsCreator = (creator, userId) => {
    if (!creator) return false;
    if (Array.isArray(creator)) {
        return creator.some(id => id.toString() === userId);
    }
    return creator.toString() === userId;
};

const createCommunity = async (req, res) => {
    try {
        const {name, description, is_private} = req.body;
        const userId = req.userId;
        if(!name){
            return res.status(400).json({message:"community name is required"});
        }
        const existingCommunity = await Community.findOne({name});
        if(existingCommunity){
            return res.status(400).json({
                message:"community name already exists"
            })
        }
        const community = await Community.create({
            name, 
            description,
            creator: userId,
            members:[userId],
            member_count : 1,
            is_private: is_private || false
        })
        await User.findByIdAndUpdate(userId, {
          $addToSet : {communities: community._id}
        })
        await invalidateUserCache(userId);
        res.status(201).json({
            message :"community created successfully",
            community
        })
    } catch (error) {
        console.error("Create community error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const joinCommunity = async (req, res) => {
    try {
        const userId = req.userId;
        const {communityId} = req.params;
        const community = await Community.findById(communityId);
        if(!community){
            return res.status(404).json({
                message:"community not found"
            })
         }
         if(community.members.includes(userId)){
            return res.status(400).json({
                message:"already a member"
            })
        }
        if(community.is_private){
            if(community.pending_requests.includes(userId)){
                return res.status(400).json({
                    message:"join request already sent"
                })
            }
            community.pending_requests.push(userId);
            await community.save();
            return res.status(200).json({
                message:"join request sent. wait for approval"
            })
        }else{
            community.members.push(userId);
            community.member_count = community.members.length;
            await community.save();
        }
        await User.findByIdAndUpdate(userId, {
            $addToSet:{
                communities:community._id
            }
        })
        await invalidateUserCache(userId);
        return res.status(200).json({
            message:"joined community successfully"
        })
    } catch (error) {
        console.error("Join community error:", error);
        res.status(500).json({ message: "Server error" });   
    }
}

const leaveCommunity = async (req, res) => {
    try{
        const userId = req.userId;
        const {communityId} = req.params;
        const community = await Community.findById(communityId);
        if(!community){
            return res.status(400).json({
                message:"community not found"
            })
        }
        if(!community.members.includes(userId)){
            return res.status(400).json({
                message:"you are not a member of this community"
            })
        }
        community.members = community.members.filter(id => id.toString() !== userId);
        community.member_count = community.members.length;
        await community.save();

        await User.findByIdAndUpdate(userId, {
            $pull:{communities :community._id}
        })
        await invalidateUserCache(userId);
        return res.status(200).json({message:"left community successfully"})
    }catch(error){
        console.error("Leave community error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const apporveRequest = async(req, res) =>{
    try {
        const {communityId, userId} = req.params;
        const adminId = req.userId;
        const community = await Community.findById(communityId);
        if(!community){
            return res.status(404).json({
                message:"community not found"
            })
        }
        if (!checkIsCreator(community.creator, adminId)) {
            return res.status(403).json({ message: "not authorized" });
        }
        if(!community.pending_requests.includes(userId)){
            return res.status(400).json({message:"user has not requested to join"})
        }
        community.pending_requests = community.pending_requests.filter(
            id => id.toString() !== userId
        );
        community.members.push(userId);
        community.member_count = community.members.length;
        await community.save();
        await User.findByIdAndUpdate(userId, {
            $addToSet: { communities: community._id }
        });
        await invalidateUserCache(userId);
        return res.status(200).json({
            message:"user approved successfully"
        })
    } catch (error) {
        console.error("approve request error", error);
        res.status(500).json({
            message:"server error"
        })
    }
}

const rejectRequest = async(req, res) =>{
    try {
        const {communityId, userId} = req.params;
        const adminId = req.userId;
        const community = await Community.findById(communityId);
        if(!community){
            return res.status(404).json({
                message:"community not found"
            })
        }
        if(!checkIsCreator(community.creator, adminId)){
            return res.status(403).json({
                message:"not authorized"
            })
        }
        if(!community.pending_requests.includes(userId)){
            return res.status(400).json({
                message:"user has not requested to join"
            })
        }
        community.pending_requests = community.pending_requests.filter(
            id => id.toString() !== userId
        );
        await community.save();
        return res.status(200).json({
            message:"user rejected successfully"
        })
    } catch (error) {
        console.error("Reject request error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const getCommunities = async(req, res) => {
    try{
        const {search} = req.query;
        const userId = req.userId;
        let filter = {}
        if(search){
            filter.name = { $regex: search, $options: "i" };
        }
        const communities = await Community.find(filter)
               .select("name description member_count is_private members pending_requests creator")
               .sort({createdAt: -1});

        const communitiesWithStatus = communities.map(comm => {
            const commObj = comm.toObject();
            commObj.isMember = comm.members.some(
                id => id.toString() === userId
            );
            commObj.pendingRequest = comm.pending_requests
                ? comm.pending_requests.some(id => id.toString() === userId)
                : false;
            commObj.isCreator = checkIsCreator(comm.creator, userId);
            delete commObj.members;
            delete commObj.pending_requests;
            delete commObj.creator;
            return commObj;
        });

        res.status(200).json({
            communities: communitiesWithStatus
        })
    }catch(error){
        console.error("Get communities error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

const getMyCreatedCommunities = async(req, res) =>{
    try {
        const userId = req.userId;
        const communities = await Community.find({
            creator: userId
        })
        .select("name description member_count is_private createdAt pending_requests")
        .populate("pending_requests", "username name email")
        .sort({createdAt: -1});
        res.status(200).json({
            communities
        })
    } catch (error) {
        console.error("Get my created communities error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export {createCommunity, joinCommunity, leaveCommunity, apporveRequest, rejectRequest, getCommunities, getMyCreatedCommunities}