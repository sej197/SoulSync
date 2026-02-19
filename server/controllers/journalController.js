import mongoose from "mongoose";
import Journal from "../models/Journal.js";
import RiskScore from "../models/RiskScore.js";
import axios from "axios";
import { encrypt, decrypt } from "../utils/encryption.js";
import { setCache, getCache, deleteCache, deleteCachePattern, invalidateJournalCache, cacheKeys } from "../utils/cacheUtils.js";

function decryptEntry(entry) {
    const obj = entry.toObject ? entry.toObject() : { ...entry };
    obj.text = decrypt(obj.text);
    if (obj.subject) obj.subject = decrypt(obj.subject);
    return obj;
}

const getJournalEntries = async(req, res) =>{
    try{
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check cache first
        const cacheKey = cacheKeys.journalEntries(userId, page);
        const cachedEntries = await getCache(cacheKey);
        if(cachedEntries) {
            return res.json(cachedEntries);
        }

        const total = await Journal.countDocuments({ user: userId });
        const entries = await Journal.find({
            user: userId
        })
        .sort({
            entryTime: -1
        })
        .skip(skip)
        .limit(limit);

        const decryptedEntries = entries.map(decryptEntry);

        const response = {
            entries: decryptedEntries,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalEntries: total
        };

        // Cache for 30 minutes
        await setCache(cacheKey, response, 1800);

        res.json(response);
    }catch(error){
        console.error("Error fetching journal entries", error);
        res.status(500).json({
            message: "Server error"
        });
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
        
        // Check cache first
        const cacheKey = cacheKeys.journalDate(userId, entryTime);
        const cachedEntry = await getCache(cacheKey);
        if(cachedEntry) {
            return res.json(cachedEntry);
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
        const decryptedEntries = entries.map(decryptEntry);
        
        const response = { entries: decryptedEntries };
        
        // Cache for 24 hours (daily data)
        await setCache(cacheKey, response, 86400);
        
        res.json(response); 
    }catch(error){
        console.error("Error fetching journal entry by date", error);
        res.status(500).json({message: "Server error"});
    }
}

const createJournalEntry = async(req, res) =>{
    try{
        const userId = req.userId;
        const {text, subject, entryTime} = req.body;
        if(!text){
            return res.status(400).json({
                message: "Text is required"
            });
        }
        const entry = await Journal.create({
            user: userId,
            text: encrypt(text),
            subject: subject ? encrypt(subject) : null,
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

        // Invalidate related caches
        await invalidateJournalCache(userId);

        res.status(201).json({
            message: "Journal entry created successfully", 
            entry: decryptEntry(entry)
        });

    }catch(error){
        console.error("Error creating journal entry", error);
        res.status(500).json({message: "Server error"});
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

        if(!deleted) {
            return res.status(404).json({
                message: "Journal entry not found"
            });
        }

        // Invalidate related caches
        await invalidateJournalCache(userId);

        res.json({
            message: "Journal entry deleted successfully"
        });
    }catch(error){
        console.error("Error deleting journal entry", error);
        res.status(500).json({message: "Server error"});
    }
}

const updateJournalEntry = async(req, res) =>{
    try{
        const userId = req.userId;
        const {entryId} = req.params;
        const {text, subject} = req.body;
        
        if(!text){
            return res.status(400).json({
                message: "Text is required"
            });
        }

        const entry = await Journal.findOne({
            _id: entryId,
            user: userId
        });

        if(!entry) {
            return res.status(404).json({
                message: "Journal entry not found"
            });
        }

        entry.text = encrypt(text);
        if(subject) entry.subject = encrypt(subject);
        
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

        // Invalidate related caches
        await invalidateJournalCache(userId);

        res.json({
            message: "Journal entry updated successfully", 
            entry: decryptEntry(entry)
        });
    }catch(error){
        console.error("Error updating journal entry", error);
        res.status(500).json({message: "Server error"});
    }
}

const getCalendarDates = async(req, res) => {
    try{
        const userId = req.userId;
        const { month, year } = req.query;

        // Check cache first
        const cacheKey = cacheKeys.calendarDates(userId, month, year);
        const cachedDates = await getCache(cacheKey);
        if(cachedDates) {
            return res.json(cachedDates);
        }

        let matchQuery = { user: new mongoose.Types.ObjectId(userId) };

        if(month && year){
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            matchQuery.entryTime = { $gte: startDate, $lte: endDate };
        }

        const entries = await Journal.find(matchQuery).select('entryTime').lean();

        const dateMap = {};
        entries.forEach(e => {
            const d = new Date(e.entryTime);
            const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            dateMap[localDate] = (dateMap[localDate] || 0) + 1;
        });

        const calendarDates = Object.entries(dateMap) 
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => ({ date, entryCount: count }));

        const response = { calendarDates };

        // Cache for 24 hours
        await setCache(cacheKey, response, 86400);

        res.json(response);
    }catch(error){
        console.error("Error fetching calendar dates", error);
        res.status(500).json({message: "Server error"});
    }
}

export {getJournalEntries, createJournalEntry, deleteJournalEntry, updateJournalEntry, getJournalEntryByDate, getCalendarDates};