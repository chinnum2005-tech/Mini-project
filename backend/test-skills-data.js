const { Pool } = require('pg');

// Create a pool with the database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'Chinnu@2005',
  port: 5432,
});

// Test skills and user skills data
const testSkillsData = async () => {
  try {
    console.log('Testing skills and user skills data...');
    
    // Check skills table
    const skillsCheck = await pool.query('SELECT COUNT(*) as count FROM skills');
    console.log(`📊 Skills table has ${skillsCheck.rows[0].count} records`);
    
    // Check user_skills table
    const userSkillsCheck = await pool.query('SELECT COUNT(*) as count FROM user_skills');
    console.log(`📊 User skills table has ${userSkillsCheck.rows[0].count} records`);
    
    // Check if there are users with teaching skills
    const teachingSkillsCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM user_skills 
      WHERE skill_type IN ('teaching', 'both')
    `);
    console.log(`📊 Users with teaching skills: ${teachingSkillsCheck.rows[0].count}`);
    
    // Show sample skills
    const sampleSkills = await pool.query('SELECT id, name, category FROM skills ORDER BY id LIMIT 5');
    console.log('📚 Sample skills:');
    sampleSkills.rows.forEach(skill => {
      console.log(`  - ${skill.name} (${skill.category}) - ID: ${skill.id}`);
    });
    
    // Show sample user skills
    const sampleUserSkills = await pool.query(`
      SELECT us.user_id, us.skill_id, us.skill_type, us.proficiency_level, s.name as skill_name
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      ORDER BY us.user_id
      LIMIT 5
    `);
    console.log('👩‍🏫 Sample user skills:');
    sampleUserSkills.rows.forEach(userSkill => {
      console.log(`  - User ${userSkill.user_id}: ${userSkill.skill_name} (${userSkill.skill_type}, level ${userSkill.proficiency_level})`);
    });
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error testing skills data:', error.message);
    await pool.end();
  }
};

testSkillsData();