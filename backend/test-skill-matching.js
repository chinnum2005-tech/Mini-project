const { Pool } = require('pg');

// Create a pool with the database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skill_swap_db',
  password: 'Chinnu@2005',
  port: 5432,
});

// Test the skill matching query directly
const testSkillMatchingQuery = async () => {
  try {
    console.log('Testing skill matching query...');
    
    // Test with a sample user ID and skill preferences
    const userId = 1; // Sample user ID
    const skillPreferences = [1, 2, 3]; // Sample skill IDs
    
    console.log(`Testing for user ${userId} with skills:`, skillPreferences);
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      console.log('❌ User not found');
      await pool.end();
      return;
    }
    
    console.log(`✅ User found: ${userCheck.rows[0].first_name} ${userCheck.rows[0].last_name}`);
    
    // Check if skills exist
    const skillsCheck = await pool.query('SELECT id, name FROM skills WHERE id = ANY($1)', [skillPreferences]);
    console.log(`✅ Found ${skillsCheck.rows.length} matching skills:`);
    skillsCheck.rows.forEach(skill => {
      console.log(`  - ${skill.name} (ID: ${skill.id})`);
    });
    
    // Test the actual mentor matching query
    const mentorsQuery = `
      SELECT DISTINCT ON (u.id)
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        us.skill_id,
        s.name as skill_name,
        s.category as skill_category,
        us.proficiency_level,
        us.skill_type,
        -- Calculate mentor score based on multiple factors
        AVG(r.rating) as average_rating,
        COUNT(r.id) as total_reviews,
        COUNT(DISTINCT sess.id) as total_sessions_taught,
        COUNT(DISTINCT sess.student_id) as unique_students_taught,
        -- Availability score (simplified - could be enhanced)
        CASE WHEN up.availability IS NOT NULL THEN 1 ELSE 0 END as has_availability
      FROM users u
      JOIN user_skills us ON u.id = us.user_id
      JOIN skills s ON us.skill_id = s.id
      LEFT JOIN sessions sess ON u.id = sess.mentor_id AND sess.status = 'completed'
      LEFT JOIN session_reviews r ON sess.id = r.session_id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE us.skill_id = ANY($1)
        AND us.skill_type IN ('teaching', 'both')
        AND u.id != $2
        AND u.user_type = 'mentor'
      GROUP BY u.id, u.first_name, u.last_name, u.email, us.skill_id, s.name, s.category,
               us.proficiency_level, us.skill_type, up.availability
      ORDER BY
        -- Primary sort: User ID (for DISTINCT ON)
        u.id,
        -- Secondary sort: Average rating (descending)
        AVG(r.rating) DESC NULLS LAST
    `;
    
    console.log('Executing mentor matching query...');
    const mentorsResult = await pool.query(mentorsQuery, [skillPreferences, userId]);
    console.log(`✅ Found ${mentorsResult.rows.length} mentor records`);
    
    // Group and display results
    const mentorMap = new Map();
    mentorsResult.rows.forEach(row => {
      const mentorId = row.id;
      if (!mentorMap.has(mentorId)) {
        mentorMap.set(mentorId, {
          id: mentorId,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          skills: [],
          stats: {
            average_rating: row.average_rating ? Math.round(row.average_rating * 10) / 10 : 0,
            total_reviews: parseInt(row.total_reviews || 0),
            total_sessions: parseInt(row.total_sessions_taught || 0),
            unique_students: parseInt(row.unique_students_taught || 0),
            has_availability: row.has_availability === 1
          }
        });
      }
      
      const mentor = mentorMap.get(mentorId);
      if (!mentor.skills.some(skill => skill.skill_id === row.skill_id)) {
        mentor.skills.push({
          skill_id: row.skill_id,
          skill_name: row.skill_name,
          category: row.skill_category,
          proficiency_level: row.proficiency_level,
          skill_type: row.skill_type
        });
      }
    });
    
    console.log(`📊 Grouped into ${mentorMap.size} unique mentors:`);
    mentorMap.forEach((mentor, id) => {
      console.log(`  - ${mentor.name} (${mentor.email})`);
      console.log(`    Rating: ${mentor.stats.average_rating} (${mentor.stats.total_reviews} reviews)`);
      console.log(`    Skills: ${mentor.skills.map(s => s.skill_name).join(', ')}`);
    });
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error('Error testing skill matching query:', error.message);
    console.error('Stack trace:', error.stack);
    await pool.end();
  }
};

testSkillMatchingQuery();