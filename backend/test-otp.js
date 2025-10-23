const { sendOTP } = require('./config/email');
const { generateOTP } = require('./utils/helper');

// Test OTP generation and sending
const testOTP = async () => {
  try {
    console.log('Testing OTP functionality...');
    
    // Generate a test OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);
    
    // Try to send OTP to a test email
    const testEmail = 'shashankm.23cs@saividya.ac.in';
    console.log(`Sending OTP to ${testEmail}...`);
    
    // Try to send the OTP
    const result = await sendOTP(testEmail, otp);
    
    if (result) {
      console.log('✅ OTP email sent successfully!');
    } else {
      console.log('❌ Failed to send OTP email');
    }
  } catch (error) {
    console.error('Error testing OTP:', error);
  }
};

testOTP();