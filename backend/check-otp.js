const pool = require('./config/database');

async function checkOtp() {
  try {
    const result = await pool.query('SELECT * FROM email_verifications WHERE email = $1', ['test@saividya.ac.in']);
    console.log('Database records for test@saividya.ac.in:', result.rows);
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error checking OTP:', error);
  }
}

checkOtp();