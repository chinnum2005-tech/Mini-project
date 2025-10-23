const express = require('express');
const { generateOTP } = require('./utils/helper');

const app = express();
const PORT = 3000;

// Simple endpoint to generate and display OTP
app.get('/generate-otp', (req, res) => {
  const otp = generateOTP();
  res.json({
    otp: otp,
    message: `Your OTP is: ${otp}. Use this to test the verification flow.`
  });
});

app.listen(PORT, () => {
  console.log(`OTP display server running on http://localhost:${PORT}`);
  console.log('Visit http://localhost:3000/generate-otp to get a test OTP');
});