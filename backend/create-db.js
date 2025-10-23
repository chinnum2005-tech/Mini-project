const { Client } = require('pg');

// Connect to PostgreSQL server (not to the specific database)
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Connect to default database
  password: 'Chinnu@2005',
  port: 5432,
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Create the database if it doesn't exist
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'skill_swap_db'"
    );
    
    if (res.rows.length === 0) {
      await client.query('CREATE DATABASE skill_swap_db');
      console.log('Database skill_swap_db created successfully');
    } else {
      console.log('Database skill_swap_db already exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

createDatabase();