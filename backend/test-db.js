const { Pool } = require('pg');

// Create a pool with the database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'postgres',
  port: 5432,
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully!');
    console.log('Current time:', res.rows[0]);
    
    // Check the email_verifications table structure
    pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'email_verifications'
      ORDER BY ordinal_position;
    `, (err, res) => {
      if (err) {
        console.error('Error querying table structure:', err.stack);
      } else {
        console.log('email_verifications table structure:');
        console.table(res.rows);
        
        // Check constraints
        pool.query(`
          SELECT constraint_name, constraint_type
          FROM information_schema.table_constraints
          WHERE table_name = 'email_verifications';
        `, (err, res) => {
          if (err) {
            console.error('Error querying constraints:', err.stack);
          } else {
            console.log('email_verifications constraints:');
            console.table(res.rows);
          }
          
          pool.end();
        });
      }
    });
  }
});