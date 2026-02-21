import express from 'express';
import userAuth from '../middleware/authmiddleware.js';
import NotificationController from '../controllers/NotificationController.js';

const router = express.Router();

// POST /api/notify/notify-contacts
router.post('/notify-contacts', userAuth, NotificationController.notifyContacts);

export default router;
