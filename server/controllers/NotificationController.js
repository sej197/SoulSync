import twilio from 'twilio';
import User from '../models/User.js';

// Helper function to format phone numbers to E.164 format
const formatPhoneNumber = (phone) => {

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  

  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }
  
  if (cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  return null; 
};

export const notifyContacts = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const contacts = user.emergency_contacts || [];
    if (!contacts.length) return res.status(400).json({ message: 'No emergency contacts set' });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Missing Twilio credentials:', { accountSid: !!accountSid, authToken: !!authToken, fromNumber: !!fromNumber });
      return res.status(500).json({
        message: 'Twilio configuration missing on server'
      });
    }

    const client = twilio(accountSid, authToken);

    const name = user.username || 'Someone';
    const messageBody = `${name} needs your support — please check in with them and let them know you care. If it's an emergency, contact local emergency services.`;

    const results = [];
    
    for (const contact of contacts) {
      try {
        const formattedPhone = formatPhoneNumber(contact);
        
        if (!formattedPhone) {
          console.error(`Invalid phone number format: ${contact}`);
          results.push({ 
            to: contact, 
            status: 'error', 
            error: 'Invalid phone number format. Use 10 or 12 digit format.' 
      });
          continue;
        }

        console.log(`Sending SMS to: ${formattedPhone} (original: ${contact})`);
        
        const msg = await client.messages.create({ 
          body: messageBody, 
          from: fromNumber, 
          to: formattedPhone 
        });
        
        console.log(`Message sent successfully to ${formattedPhone}, SID: ${msg.sid}`);
        results.push({ to: contact, formattedPhone, status: 'sent', sid: msg.sid });
      } catch (err) {
        console.error(`Failed to send SMS to ${contact}:`, err.message);
        results.push({
          to: contact, 
          status: 'error', 
          error: err.message 
        });
      }
    }

    return res.json({
      message: 'Notifications processed', results 
    });
  } catch (error) {
    console.error('NotifyContacts error:', error);
    return res.status(500).json({
      message: 'Failed to send notifications', 
      error: error.message 
    });
  }
};

export default { notifyContacts };
