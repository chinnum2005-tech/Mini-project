const { Pool } = require('pg');

// Create a pool with the database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'Chinnu@2005',
  port: 5432,
});

// Test if user_current_role table exists and has data
const testUserRoleTable = async () => {
  try {
    console.log('Testing user_current_role table...');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_current_role'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ user_current_role table does not exist');
      return;
    }
    
    console.log('✅ user_current_role table exists');
    
    // Check if table has data
    const dataCheck = await pool.query('SELECT COUNT(*) as count FROM user_current_role');
    console.log(`📊 user_current_role table has ${dataCheck.rows[0].count} records`);
    
    // Check a sample record
    const sampleCheck = await pool.query('SELECT * FROM user_current_role LIMIT 1');
    if (sampleCheck.rows.length > 0) {
      console.log('📝 Sample record:', sampleCheck.rows[0]);
    } else {
      console.log('📭 user_current_role table is empty');
    }
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error testing user_current_role table:', error.message);
    await pool.end();
  }
};

testUserRoleTable();