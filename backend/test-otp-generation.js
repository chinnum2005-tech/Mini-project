const { generateOTP } = require('./utils/helper');

// Test OTP generation
const testOTPGen = () => {
  console.log('Testing OTP generation...');
  
  // Generate several OTPs to verify they're 6 digits
  for (let i = 0; i < 5; i++) {
    const otp = generateOTP();
    console.log(`Generated OTP ${i + 1}: ${otp} (Length: ${otp.length})`);
  }
};

testOTPGen();