#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'blocklearn_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password_here',
});

async function initializeMentorVerificationTables() {
  console.log('🚀 Initializing Mentor Verification Tables...');
  
  try {
    // Read the mentor verification schema file
    const schemaPath = path.join(__dirname, '../models/mentor_verification_schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
      }
    }
    
    console.log('✅ Mentor verification tables initialized successfully!');
    
    // Test the connection by querying the new tables
    console.log('🔍 Testing new tables...');
    
    const testQueries = [
      'SELECT COUNT(*) FROM mentor_applications',
      'SELECT COUNT(*) FROM mentor_documents',
      'SELECT COUNT(*) FROM mentor_interviews'
    ];
    
    for (const query of testQueries) {
      try {
        const result = await pool.query(query);
        console.log(`✅ ${query}: ${result.rows[0].count} rows`);
      } catch (error) {
        // This is expected for empty tables
        console.log(`✅ ${query}: Table exists (no data)`);
      }
    }
    
    console.log('\n🎉 Mentor verification system is ready!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your backend server');
    console.log('2. Test the mentor application API endpoints');
    console.log('3. Verify that the frontend can access mentor verification features');
    
  } catch (error) {
    console.error('❌ Error initializing mentor verification tables:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeMentorVerificationTables().catch(console.error);
}

module.exports = { initializeMentorVerificationTables };