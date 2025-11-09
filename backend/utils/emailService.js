const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter;

// Initialize email transporter
const initializeEmailService = () => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email service not configured - emails will be logged only');
      return null;
    }

    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('✅ Email service initialized');
    return transporter;
  } catch (error) {
    console.error('❌ Email service initialization failed:', error.message);
    return null;
  }
};

// Send email function
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      transporter = initializeEmailService();
    }

    // If no transporter (email not configured), just log
    if (!transporter) {
      console.log('📧 Email would be sent (not configured):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Content: ${text || html?.substring(0, 100)}...`);
      return { success: true, message: 'Email logged (service not configured)' };
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Arroh Water Filters'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Log the email that failed to send
    console.log('📧 Failed email details:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to send email'
    };
  }
};

// Send bulk emails
const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    const result = await sendEmail(email);
    results.push({ ...email, ...result });
  }
  
  return results;
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendBulkEmails
};
