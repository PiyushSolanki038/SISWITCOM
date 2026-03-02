const dotenv = require('dotenv');
dotenv.config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
  console.log('Testing Email Configuration...');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  console.log('SMTP Email:', process.env.SMTP_EMAIL);
  // Mask password for security in logs
  console.log('SMTP Password:', process.env.SMTP_PASSWORD ? '********' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET');

  try {
    await sendEmail({
      email: process.env.SMTP_EMAIL, // Send to self
      subject: 'SISWIT Email Test',
      message: 'This is a test email from your SISWIT backend.',
      html: '<h3>SISWIT Email Test</h3><p>This is a test email from your SISWIT backend. If you see this, your email configuration is working!</p>'
    });
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed to send:', error);
  }
};

testEmail();
