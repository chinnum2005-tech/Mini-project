const { Pool } = require('pg');

// Create a pool with the database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'Chinnu@2005',
  port: 5432,
});

// Function to clean up duplicate sessions
const cleanupDuplicateSessions = async () => {
  try {
    console.log('Cleaning up duplicate sessions...');
    
    // Delete duplicate sessions, keeping the one with the earliest created_at
    const result = await pool.query(`
      WITH duplicates AS (
        SELECT id, 
               ROW_NUMBER() OVER (
                   PARTITION BY student_id, mentor_id, skill_id, scheduled_at 
                   ORDER BY created_at
               ) as rn
        FROM sessions
      )
      DELETE FROM sessions 
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
      RETURNING id
    `);
    
    console.log(`Deleted ${result.rows.length} duplicate sessions`);
    
    // Close the pool
    await pool.end();
    
    return result.rows.length;
  } catch (error) {
    console.error('Error cleaning up duplicate sessions:', error);
    await pool.end();
    return 0;
  }
};

// Run the cleanup function
cleanupDuplicateSessions().then(deletedCount => {
  console.log(`Cleanup completed. ${deletedCount} duplicate sessions removed.`);
}).catch(error => {
  console.error('Error during cleanup:', error);
});