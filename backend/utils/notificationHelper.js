const Notification = require('../models/Notification');

// Mock function to send SMS
const sendSMS = (mobile, message) => {
  console.log(`\n--- [MOCK SMS SENT] ---`);
  console.log(`To: +91 ${mobile}`);
  console.log(`Message: ${message}`);
  console.log(`-------------------------\n`);
  return true;
};

// Mock function to send Email
const sendEmail = (email, subject, body) => {
  console.log(`\n--- [MOCK EMAIL SENT] ---`);
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  console.log(`---------------------------\n`);
  return true;
};

// Main function to trigger notification
const sendNotification = async (userId, title, message, userEmail = null, userMobile = null) => {
  try {
    // 1. Save in DB
    await Notification.create({
      user: userId,
      title,
      message,
    });

    // 2. Trigger SMS if mobile exists
    if (userMobile) {
      sendSMS(userMobile, `${title}: ${message}`);
    }

    // 3. Trigger Email if email exists
    if (userEmail) {
      sendEmail(
        userEmail,
        `Khodal Saree - ${title}`,
        `Dear Customer,\n\n${message}\n\nWarm regards,\nTeam Khodal Saree`
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
};

module.exports = {
  sendSMS,
  sendEmail,
  sendNotification,
};
