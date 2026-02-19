import Community from "../models/Community.js";
import User from "../models/User.js";

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
            creator:[userId],
            members:[userId],
            member_count : 1,
            is_private: is_private || false
        })
        await User.findByIdAndUpdate(userId, {
          $addToSet : {communities: community._id}
        })
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
        return res.status(200).json({
            message:"joined community successfully"
        })

    } catch (error) {
        console.error("Join community error:", error);
        res.status(500).json({ message: "Server error" });   
    }
}
export  {createCommunity, joinCommunity}