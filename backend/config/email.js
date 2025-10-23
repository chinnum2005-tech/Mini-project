const nodemailer = require('nodemailer');

// Build transporter from env. Supports either well-known service or custom host/port.
const createTransporter = () => {
  const {
    EMAIL_SERVICE,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS
  } = process.env;

  // Use Gmail service by default if user has Gmail account
  const useGmailService = EMAIL_SERVICE === 'gmail' || (!EMAIL_SERVICE && EMAIL_USER && EMAIL_USER.includes('@gmail.com'));

  if (useGmailService) {
    console.log('Using Gmail service for email transport');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
  }

  if (EMAIL_SERVICE) {
    console.log(`Using ${EMAIL_SERVICE} service for email transport`);
    return nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
  }

  console.log(`Using custom SMTP configuration: ${EMAIL_HOST || 'smtp.gmail.com'}:${EMAIL_PORT || 587}`);
  return nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
    secure: EMAIL_SECURE ? EMAIL_SECURE === 'true' : false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
};

const transporter = createTransporter();

// Test the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter configuration error:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

// Function to send OTP
const sendOTP = async (to, otp) => {
  try {
    console.log(`Attempting to send OTP to ${to}`);
    const info = await transporter.sendMail({
      from: `"BlockLearn Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your OTP Code - BlockLearn',
      text: `Welcome to BlockLearn!
      
Your One-Time Password (OTP) is: ${otp}

This code will expire in 10 minutes. Please use this code to complete your login or registration process.

If you didn't request this code, you can safely ignore this email.

Thank you for choosing BlockLearn. We're excited to help you on your learning journey!

Best regards,
The BlockLearn Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BlockLearn</h1>
          </div>
          
          <div style="padding: 30px; background: white; border-left: 1px solid #eee; border-right: 1px solid #eee;">
            <h2 style="color: #333; margin-top: 0;">Your One-Time Password</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; color: #667eea; font-weight: bold;">Your OTP Code:</p>
              <p style="margin: 10px 0 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</p>
            </div>
            
            <p>This code will expire in <strong>10 minutes</strong>. Please use this code to complete your login or registration process.</p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;"><strong>Didn't request this code?</strong></p>
              <p style="margin: 5px 0 0; color: #666;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
            
            <p>Thank you for choosing BlockLearn. We're excited to help you on your learning journey!</p>
            
            <div style="margin-top: 30px;">
              <p>Best regards,<br/>
              <strong>The BlockLearn Team</strong></p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              &copy; ${new Date().getFullYear()} BlockLearn. All rights reserved.
            </p>
          </div>
        </div>
      `
    });

    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

// Function to send account deletion confirmation email
const sendAccountDeletionEmail = async (to, firstName) => {
  try {
    console.log(`Attempting to send account deletion email to ${to}`);
    
    // Personalize the message with the user's first name if available
    const userName = firstName || 'there';
    
    const info = await transporter.sendMail({
      from: `"BlockLearn Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Account Deletion Confirmation - BlockLearn',
      text: `Dear ${userName},
      
We're sorry to see you go, but we want to confirm that your BlockLearn account has been successfully deleted as requested. All your personal data and associated information have been permanently removed from our systems.

We truly appreciate the time you've spent with us and the contributions you've made to our learning community. Your participation has helped create a valuable platform for skill sharing and knowledge exchange.

We hope that your experience with BlockLearn has been beneficial, and we'd love to welcome you back in the future. Our platform is continuously evolving with new features and learning opportunities, and we believe you'd find value in what we're building.

Should you decide to return, you'll always be welcome to create a new account and join our community again. We'll be here, ready to support your learning journey whenever you're ready.

Thank you once again for being part of the BlockLearn family. We wish you all the best in your future endeavors.

Warm regards,
The BlockLearn Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Account Deletion Confirmed</h1>
          </div>
          
          <div style="padding: 30px; background: white; border-left: 1px solid #eee; border-right: 1px solid #eee;">
            <p>Dear ${userName},</p>
            
            <p>We're sorry to see you go, but we want to confirm that your BlockLearn account has been successfully deleted as requested. All your personal data and associated information have been permanently removed from our systems.</p>
            
            <p>We truly appreciate the time you've spent with us and the contributions you've made to our learning community. Your participation has helped create a valuable platform for skill sharing and knowledge exchange.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">We'd Love to Welcome You Back!</h3>
              <p>We hope that your experience with BlockLearn has been beneficial, and we'd love to welcome you back in the future. Our platform is continuously evolving with new features and learning opportunities, and we believe you'd find value in what we're building.</p>
            </div>
            
            <p>Should you decide to return, you'll always be welcome to create a new account and join our community again. We'll be here, ready to support your learning journey whenever you're ready.</p>
            
            <p>Thank you once again for being part of the BlockLearn family. We wish you all the best in your future endeavors.</p>
            
            <div style="margin-top: 30px;">
              <p>Warm regards,<br/>
              <strong>The BlockLearn Team</strong></p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              &copy; ${new Date().getFullYear()} BlockLearn. All rights reserved.
            </p>
          </div>
        </div>
      `
    });

    console.log('Account deletion email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending account deletion email:', error);
    return false;
  }
};

module.exports = { sendOTP, sendAccountDeletionEmail };