import Journal from "../models/Journal.js";
import RiskScore from "../models/RiskScore.js";
import axios from "axios";

const getJournalEntries = async(req, res) =>{
    try{
        const userId = req.userId;
        const entries = await Journal.find({
            user: userId
        })
        .sort({
            entryTime: 1
        })
        res.json({entries});
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

        if(text) entry.text = text;
        if(subject) entry.subject = subject;
        try {
            const response = await axios.post(
                `${process.env.PYTHON_SERVER}/sentiment/analyze`,
                { text, subject }
            );
        entry.sentimentScore = response.data.paragraphScore ?? 0;
        } catch (err) {
            console.error("Sentiment API error:", err.message);
        }

        await entry.save();
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

export {getJournalEntries, createJournalEntry, deleteJournalEntry, updateJournalEntry, getJournalEntryByDate};