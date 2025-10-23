const { Pool } = require('pg');

// Create a pool with the database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'Chinnu@2005',
  port: 5432,
});

// Check for OTP entries in the database
const checkOTPEntries = async () => {
  try {
    console.log('Checking OTP entries in database...');
    
    // Query the email_verifications table
    const result = await pool.query('SELECT * FROM email_verifications ORDER BY created_at DESC LIMIT 5');
    
    if (result.rows.length > 0) {
      console.log('Recent OTP entries:');
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. Email: ${row.email}, OTP: ${row.otp}, Expires: ${row.expires_at}, Verified: ${row.verified}`);
      });
    } else {
      console.log('No OTP entries found in database');
    }
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error checking OTP entries:', error);
  }
};

checkOTPEntries();