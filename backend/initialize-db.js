const { Pool } = require('pg');

// Create a pool with the database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'Chinnu@2005',
  port: 5432,
});

// Initialize missing tables
const initializeDatabase = async () => {
  try {
    console.log('Initializing database with missing tables...');
    
    // Create user_current_role table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_current_role (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
        current_role VARCHAR(10) CHECK (current_role IN ('student', 'mentor', 'both')) DEFAULT 'both',
        selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Created user_current_role table');
    
    // Add indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_current_role_user_id ON user_current_role(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_current_role_current_role ON user_current_role(current_role)
    `);
    
    console.log('✅ Created indexes for user_current_role table');
    
    // Set default roles for existing users
    const result = await pool.query(`
      INSERT INTO user_current_role (user_id, current_role)
      SELECT id, 'both'
      FROM users
      WHERE id NOT IN (SELECT user_id FROM user_current_role)
    `);
    
    console.log(`✅ Set default roles for ${result.rowCount} users`);
    
    // Create session_reviews table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session_reviews (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, reviewer_id)
      )
    `);
    
    console.log('✅ Created session_reviews table');
    
    // Add indexes for session_reviews
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_session_reviews_session_id ON session_reviews(session_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_session_reviews_reviewer_id ON session_reviews(reviewer_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_session_reviews_reviewee_id ON session_reviews(reviewee_id)
    `);
    
    console.log('✅ Created indexes for session_reviews table');
    
    // Close the pool
    await pool.end();
    
    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    await pool.end();
  }
};

initializeDatabase();