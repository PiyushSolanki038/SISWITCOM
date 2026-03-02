const sendEmail = require('./utils/sendEmail');
const { getWelcomeEmail, getLoginNotificationEmail, getPasswordResetEmail } = require('./utils/emailTemplates');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const testEmailTemplates = async () => {
  try {
    const email = process.env.SMTP_EMAIL; // Send to self
    console.log(`Sending test emails to ${email}...`);

    // 1. Test Welcome Email
    console.log('1. Sending Welcome Email...');
    const welcomeHtml = getWelcomeEmail('Test User', 'customer');
    await sendEmail({
      email,
      subject: 'Test: Welcome to SISWIT',
      message: 'This is a test message',
      html: welcomeHtml
    });
    console.log('✅ Welcome Email Sent!');

    // 2. Test Login Notification
    console.log('2. Sending Login Notification...');
    const loginHtml = getLoginNotificationEmail('Test User', new Date().toLocaleString());
    await sendEmail({
      email,
      subject: 'Test: New Login Detected',
      message: 'This is a test message',
      html: loginHtml
    });
    console.log('✅ Login Notification Sent!');

    // 3. Test Password Reset
    console.log('3. Sending Password Reset...');
    const resetHtml = getPasswordResetEmail('Test User', 'http://localhost:5173/reset-password/test-token');
    await sendEmail({
      email,
      subject: 'Test: Password Reset',
      message: 'This is a test message',
      html: resetHtml
    });
    console.log('✅ Password Reset Email Sent!');

    console.log('🎉 All test emails sent successfully! Please check your inbox.');
  } catch (error) {
    console.error('❌ Error sending emails:', error);
  }
};

testEmailTemplates();
