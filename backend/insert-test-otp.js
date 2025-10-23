const pool = require('./config/database');

async function insertTestOtp() {
  const email = 'test@saividya.ac.in';
  const otp = '822836'; // The OTP we generated
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  try {
    console.log(`Attempting to insert OTP ${otp} for email ${email}`);
    console.log(`Current time: ${new Date()}`);
    console.log(`Expiration time: ${expiresAt}`);
    
    // Try to delete any existing record first
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);
    
    // Insert OTP into database
    const query = 'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)';
    await pool.query(query, [email, otp, expiresAt]);
    console.log(`Successfully inserted OTP ${otp} for email ${email}`);
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error inserting test OTP:', error);
  }
}

insertTestOtp();