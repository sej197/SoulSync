import mongoose from "mongoose";
import Journal from "../models/Journal.js";
import RiskScore from "../models/RiskScore.js";
import axios from "axios";

const getJournalEntries = async(req, res) =>{
    try{
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Journal.countDocuments({ user: userId });
        const entries = await Journal.find({
            user: userId
        })
        .sort({
            entryTime: -1
        })
        .skip(skip)
        .limit(limit);

        res.json({
            entries,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalEntries: total
        });
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error fetching journal entries", error);
    }
}

const getJournalEntryByDate = async(req, res) => {
    try{
        const userId = req.userId;
        const {entryTime} = req.query;
        if(!entryTime){
            return res.status(400).json({
                message: "entryTime query parameter is required"
            });
        }
        
        const date = new Date(entryTime);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const entries = await Journal.find({
            user: userId,
            entryTime: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).sort({
            entryTime: -1
        })

        if(entries.length === 0){
            return res.status(404).json({   
                message: "Journal entry not found for the specified date"
            });
        }
        res.json({entries}); 
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error fetching journal entry by date", error);
    }
}

const createJournalEntry = async(req, res) =>{
    try{
        const userId = req.userId;
        const {text, entryTime} = req.body;
        if(!text){
            return res.status(400).json({
                message: "Text is required"
            });
        }
        const entry = await Journal.create({
            user: userId,
            text,
            entryTime: entryTime ? new Date(entryTime) : Date.now()
        });

            let sentimentScore = 0;

        try {
            const response = await axios.post(
                `${process.env.PYTHON_SERVER}/sentiment/analyze`,
                { text }
            );
        sentimentScore = response.data.paragraphScore ?? 0;
        }catch(error){
            console.error("Sentiment API error:", error.message);
        }

    entry.sentimentScore = sentimentScore;
    await entry.save();

    const today = entry.entryTime.toISOString().split("T")[0];

    await RiskScore.findOneAndUpdate(
      { user: userId, date: today },
      {
        $set: {
          journal_score: sentimentScore,
          journal_date: today,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
        message: "Journal entry created successfully", 
        entry
    });


        
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error creating journal entry", error);
    }
}

const deleteJournalEntry = async(req, res) =>{
    try{
        const userId = req.userId;  
        const {entryId} = req.params;
        
        const deleted = await Journal.findOneAndDelete({
            _id: entryId,
            user: userId
        });

        if(!deleted){
            return res.status(404).json({
                message: "Journal entry not found"
            });
        }
        res.json({
            message: "Journal entry deleted successfully"
        });
    }catch(error){
        res.status(500).json({
            message: "Server error"
        });
        console.error("Error deleting journal entry", error);
    }
}

const updateJournalEntry = async(req, res) =>{
    try{
        const userId = req.userId;  
        const {entryId} = req.params;
        const {text, subject} = req.body;

        const entry = await Journal.findOne({
            _id: entryId, user: userId
        });
    
        if(!entry){
            return res.status(404).json({
                message: "Journal entry not found"
            });
        }

        if(subject) entry.subject = subject;
        if(text){
            entry.text = text;
            try {
                const response = await axios.post(
                    `${process.env.PYTHON_SERVER}/sentiment/analyze`,
                    { text: entry.text }
                );
                entry.sentimentScore = response.data.paragraphScore ?? 0;
            }catch (err) {
                console.error("Sentiment API error:", err.message);
            }
        }
        await entry.save();
        const journalDate = entry.entryTime.toISOString().split("T")[0];

        await RiskScore.findOneAndUpdate({ 
            user: userId, 
            date: journalDate 
        },
        {
        $set: {
            journal_score: entry.sentimentScore,
            journal_date: journalDate,
        },
        },
        { upsert: true, new: true }
        ); 
        res.json({
            message: "Journal entry updated successfully", entry
        });
    }catch(error){
        res.status(500).json({
            message: "Server error"
        });
        console.error("Error updating journal entry", error);
    }
}

const getCalendarDates = async(req, res) => {
    try{
        const userId = req.userId;
        const { month, year } = req.query;

        let matchQuery = { user: new mongoose.Types.ObjectId(userId) };

        if(month && year){
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            matchQuery.entryTime = { $gte: startDate, $lte: endDate };
        }

        const dates = await Journal.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$entryTime" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const calendarDates = dates.map(d => ({
            date: d._id,
            entryCount: d.count
        }));

        res.json({ calendarDates });
    }catch(error){
        res.status(500).json({message: "Server error"});
        console.error("Error fetching calendar dates", error);
    }
}

export {getJournalEntries, createJournalEntry, deleteJournalEntry, updateJournalEntry, getJournalEntryByDate, getCalendarDates};