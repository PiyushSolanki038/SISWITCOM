const sendEmail = require('./utils/sendEmail');
const { getWelcomeEmail, getLoginNotificationEmail, getPasswordResetEmail } = require('./utils/emailTemplates');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const testEmailTemplates = async () => {
  try {
    const email = process.env.SMTP_EMAIL; // Send to self
    console.log(`Sending test emails to ${email}...`);

    // 1. Test Customer Welcome Email
    console.log('1. Sending Customer Welcome Email...');
    const customerHtml = getWelcomeEmail('John Doe', 'customer');
    await sendEmail({
      email,
      subject: 'Test: Customer Welcome',
      message: 'This is a test message',
      html: customerHtml
    });
    console.log('✅ Customer Welcome Email Sent!');

    // 2. Test Employee Welcome Email
    console.log('2. Sending Employee Welcome Email...');
    const employeeHtml = getWelcomeEmail('Jane Smith', 'employee');
    await sendEmail({
      email,
      subject: 'Test: Employee Welcome',
      message: 'This is a test message',
      html: employeeHtml
    });
    console.log('✅ Employee Welcome Email Sent!');

    // 3. Test Admin Welcome Email
    console.log('3. Sending Admin Welcome Email...');
    const adminHtml = getWelcomeEmail('Admin User', 'admin');
    await sendEmail({
      email,
      subject: 'Test: Admin Welcome',
      message: 'This is a test message',
      html: adminHtml
    });
    console.log('✅ Admin Welcome Email Sent!');

    // 4. Test Owner Welcome Email
    console.log('4. Sending Owner Welcome Email...');
    const ownerHtml = getWelcomeEmail('Business Owner', 'owner');
    await sendEmail({
      email,
      subject: 'Test: Owner Welcome',
      message: 'This is a test message',
      html: ownerHtml
    });
    console.log('✅ Owner Welcome Email Sent!');

    console.log('🎉 All role-based test emails sent successfully! Please check your inbox.');
  } catch (error) {
    console.error('❌ Error sending emails:', error);
  }
};

testEmailTemplates();
