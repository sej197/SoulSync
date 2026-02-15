import express from "express";
import  {getJournalEntries, getJournalEntryByDate, createJournalEntry, updateJournalEntry, deleteJournalEntry, getCalendarDates} from "../controllers/journalController.js";
import userAuth from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", userAuth, getJournalEntries);
router.get("/by-date", userAuth, getJournalEntryByDate);
router.get("/calendar-dates", userAuth, getCalendarDates);
router.post("/", userAuth,createJournalEntry);
router.put("/:entryId", userAuth, updateJournalEntry);
router.delete("/:entryId", userAuth, deleteJournalEntry);

export default router;