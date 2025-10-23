const pool = require('./config/database');

async function checkConstraints() {
  try {
    console.log('Checking constraints for user_profiles table...');
    
    // Check if there's a unique constraint on user_id
    const constraintQuery = `
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'user_profiles'::regclass
    `;
    
    const result = await pool.query(constraintQuery);
    console.log('All constraints:', result.rows);
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error checking constraints:', error);
  }
}

checkConstraints();