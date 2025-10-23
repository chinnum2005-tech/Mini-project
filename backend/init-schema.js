const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connect to the skill_swap_db database
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'Chinnu@2005',
  port: 5432,
});

async function initSchema() {
  try {
    await client.connect();
    console.log('Connected to skill_swap_db database');

    // Read and execute the main schema file
    const schemaSql = fs.readFileSync(path.join(__dirname, 'models', 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('Main schema created successfully');

    // Read and execute the missing tables schema file
    const missingTablesSql = fs.readFileSync(path.join(__dirname, 'models', 'missing_tables.sql'), 'utf8');
    await client.query(missingTablesSql);
    console.log('Missing tables schema created successfully');

    console.log('All tables created successfully!');
  } catch (err) {
    console.error('Error initializing schema:', err.message);
  } finally {
    await client.end();
  }
}

initSchema();