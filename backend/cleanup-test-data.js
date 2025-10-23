const pool = require('./config/database');

async function cleanupTestData() {
  try {
    console.log('Starting cleanup of test data...');
    
    // Delete test users (emails with test domains or test names)
    const deleteTestUsersQuery = `
      DELETE FROM users 
      WHERE email LIKE '%test%' 
         OR email LIKE '%example.com' 
         OR first_name LIKE '%test%' 
         OR last_name LIKE '%test%'
         OR email = 'test@saividya.ac.in'
    `;
    
    const userResult = await pool.query(deleteTestUsersQuery);
    console.log(`Deleted ${userResult.rowCount} test users`);
    
    // Delete orphaned email verifications
    const deleteOrphanedVerificationsQuery = `
      DELETE FROM email_verifications 
      WHERE email NOT IN (SELECT email FROM users)
    `;
    
    const verificationResult = await pool.query(deleteOrphanedVerificationsQuery);
    console.log(`Deleted ${verificationResult.rowCount} orphaned email verifications`);
    
    // Delete orphaned user profiles
    const deleteOrphanedProfilesQuery = `
      DELETE FROM user_profiles 
      WHERE user_id NOT IN (SELECT id FROM users)
    `;
    
    const profileResult = await pool.query(deleteOrphanedProfilesQuery);
    console.log(`Deleted ${profileResult.rowCount} orphaned user profiles`);
    
    // Delete orphaned user skills
    const deleteOrphanedSkillsQuery = `
      DELETE FROM user_skills 
      WHERE user_id NOT IN (SELECT id FROM users)
    `;
    
    const skillResult = await pool.query(deleteOrphanedSkillsQuery);
    console.log(`Deleted ${skillResult.rowCount} orphaned user skills`);
    
    // Reset sequences
    await pool.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
    console.log('Reset users sequence');
    
    console.log('Test data cleanup completed successfully!');
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupTestData();