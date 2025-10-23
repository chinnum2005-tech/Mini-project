const pool = require('./config/database');

async function addLearningGoalsColumn() {
  try {
    console.log('Adding learning_goals column to user_profiles table...');
    
    // Check if the column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' AND column_name = 'learning_goals'
    `;
    
    const result = await pool.query(checkQuery);
    
    if (result.rows.length > 0) {
      console.log('Column learning_goals already exists');
    } else {
      // Add the column
      const addColumnQuery = `
        ALTER TABLE user_profiles 
        ADD COLUMN learning_goals TEXT
      `;
      
      await pool.query(addColumnQuery);
      console.log('Successfully added learning_goals column to user_profiles table');
    }
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error adding learning_goals column:', error);
  }
}

addLearningGoalsColumn();