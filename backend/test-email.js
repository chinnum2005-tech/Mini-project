const { sendOTP } = require('./config/email');

// Test sending an OTP
const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    
    // Try to send a test OTP
    const result = await sendOTP('shashankm.23cs@saividya.ac.in', '123456');
    
    if (result) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Failed to send email');
    }
  } catch (error) {
    console.error('Error testing email:', error);
  }
};

testEmail();