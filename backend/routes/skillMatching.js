const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");

const router = express.Router();

// ✅ AI Skill Matching - Find best mentors for student's interests
router.post("/match-mentors", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill_preferences, max_results = 10, include_availability = true } = req.body;

    if (!skill_preferences || !Array.isArray(skill_preferences) || skill_preferences.length === 0) {
      return res.status(400).json({
        success: false,
        message: "skill_preferences array is required"
      });
    }

    // Get current role to ensure user is in student mode
    // First check if user_current_role table exists
    let currentRole = 'both';
    try {
      const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
      const roleResult = await pool.query(roleQuery, [userId]);
      currentRole = roleResult.rows[0]?.current_role || 'both';
    } catch (roleError) {
      // If table doesn't exist, default to 'both'
      console.warn('user_current_role table not found, defaulting to "both" role');
      currentRole = 'both';
      
      // Try to create the table if it doesn't exist
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS user_current_role (
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
            current_role VARCHAR(10) CHECK (current_role IN ('student', 'mentor', 'both')) DEFAULT 'both',
            selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Add default role for this user
        await pool.query(`
          INSERT INTO user_current_role (user_id, current_role)
          VALUES ($1, 'both')
          ON CONFLICT (user_id) DO NOTHING
        `, [userId]);
      } catch (createError) {
        console.warn('Could not create user_current_role table:', createError.message);
      }
    }

    if (!['student', 'both'].includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: "Switch to student role to find mentors"
      });
    }

    // Get student's current learning skills to avoid suggesting mentors for skills they already know
    const studentSkillsQuery = `
      SELECT skill_id FROM user_skills
      WHERE user_id = $1 AND skill_type IN ('teaching', 'both')
    `;
    const studentSkillsResult = await pool.query(studentSkillsQuery, [userId]);
    const knownSkillIds = studentSkillsResult.rows.map(row => row.skill_id);

    // Filter out skills the student already knows well
    const desiredSkills = skill_preferences.filter(skillId => !knownSkillIds.includes(skillId));

    if (desiredSkills.length === 0) {
      return res.json({
        success: true,
        message: "No new skills to learn - you already know all requested skills!",
        data: []
      });
    }

    // Find mentors who teach these skills (using DISTINCT to prevent duplicates)
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
        AND u.user_type IN ('mentor', 'both', 'student')
      GROUP BY u.id, u.first_name, u.last_name, u.email, us.skill_id, s.name, s.category,
               us.proficiency_level, us.skill_type, up.availability
      ORDER BY
        -- Primary sort: User ID (for DISTINCT ON)
        u.id,
        -- Secondary sort: Average rating (descending)
        AVG(r.rating) DESC NULLS LAST,
        -- Tertiary sort: Total reviews (more reviews = more reliable)
        COUNT(r.id) DESC,
        -- Quaternary sort: Proficiency level
        us.proficiency_level DESC,
        -- Quinary sort: Experience (total sessions)
        COUNT(DISTINCT sess.id) DESC
    `;

    const mentorsResult = await pool.query(mentorsQuery, [desiredSkills, userId]);

    // Group mentors by their skills and calculate match scores
    const mentorMap = new Map();

    mentorsResult.rows.forEach(row => {
      const mentorId = row.id;

      if (!mentorMap.has(mentorId)) {
        mentorMap.set(mentorId, {
          id: mentorId,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          skills: [],
          overall_score: 0,
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
      // Only add skill if not already present (prevent duplicates)
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

    // Calculate overall match scores for each mentor
    const scoredMentors = Array.from(mentorMap.values()).map(mentor => {
      // Calculate score based on multiple factors
      const ratingScore = mentor.stats.average_rating * 25; // 0-125 points
      const reviewScore = Math.min(mentor.stats.total_reviews * 2, 20); // 0-20 points (max 10 reviews)
      const experienceScore = Math.min(mentor.stats.total_sessions * 0.5, 15); // 0-15 points (max 30 sessions)
      const availabilityScore = mentor.stats.has_availability ? 10 : 0; // 0-10 points
      const skillCountScore = Math.min(mentor.skills.length * 5, 15); // 0-15 points (max 3 skills)

      mentor.overall_score = ratingScore + reviewScore + experienceScore + availabilityScore + skillCountScore;

      return mentor;
    });

    // Sort by overall score and limit results
    scoredMentors.sort((a, b) => b.overall_score - a.overall_score);

    const topMentors = scoredMentors.slice(0, max_results);

    res.json({
      success: true,
      data: {
        requested_skills: desiredSkills,
        known_skills: knownSkillIds,
        matched_mentors: topMentors,
        total_matches: topMentors.length,
        search_criteria: {
          max_results,
          include_availability,
          current_role: currentRole
        }
      }
    });

  } catch (error) {
    console.error("Error in AI skill matching:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
});

// ✅ Get skill recommendations for students
router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    // Get current role
    const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
    const roleResult = await pool.query(roleQuery, [userId]);
    const currentRole = roleResult.rows[0]?.current_role || 'both';

    if (!['student', 'both'].includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: "Switch to student role to get recommendations"
      });
    }

    // Get skills the student already knows (teaching/both)
    const knownSkillsQuery = `
      SELECT skill_id FROM user_skills
      WHERE user_id = $1 AND skill_type IN ('teaching', 'both')
    `;
    const knownSkillsResult = await pool.query(knownSkillsQuery, [userId]);
    const knownSkillIds = knownSkillsResult.rows.map(row => row.skill_id);

    // Get skills in the same categories as what they know, but don't know yet
    const categoryRecommendationsQuery = `
      SELECT DISTINCT s.id, s.name, s.category, s.description,
             COUNT(us.user_id) as mentor_count,
             AVG(us.proficiency_level) as avg_proficiency
      FROM skills s
      LEFT JOIN user_skills us ON s.id = us.skill_id AND us.skill_type IN ('teaching', 'both')
      WHERE s.category IN (
        SELECT DISTINCT s2.category FROM skills s2
        JOIN user_skills us2 ON s2.id = us2.skill_id
        WHERE us2.user_id = $1 AND us2.skill_type IN ('teaching', 'both')
      )
      AND s.id NOT IN (
        SELECT skill_id FROM user_skills WHERE user_id = $1
      )
      GROUP BY s.id, s.name, s.category, s.description
      HAVING COUNT(us.user_id) > 0
      ORDER BY mentor_count DESC, avg_proficiency DESC
      LIMIT $2
    `;
    const categoryRecsResult = await pool.query(categoryRecommendationsQuery, [userId, limit]);

    // Get trending/popular skills (skills with most mentors)
    const trendingSkillsQuery = `
      SELECT s.id, s.name, s.category, s.description,
             COUNT(us.user_id) as mentor_count,
             AVG(us.proficiency_level) as avg_proficiency
      FROM skills s
      JOIN user_skills us ON s.id = us.skill_id AND us.skill_type IN ('teaching', 'both')
      WHERE s.id NOT IN (
        SELECT skill_id FROM user_skills WHERE user_id = $1
      )
      GROUP BY s.id, s.name, s.category, s.description
      HAVING COUNT(us.user_id) > 0
      ORDER BY mentor_count DESC, avg_proficiency DESC
      LIMIT $2
    `;
    const trendingRecsResult = await pool.query(trendingSkillsQuery, [userId, limit]);

    res.json({
      success: true,
      data: {
        category_based: categoryRecsResult.rows,
        trending_skills: trendingRecsResult.rows,
        known_skills_count: knownSkillIds.length,
        current_role: currentRole
      }
    });

  } catch (error) {
    console.error("Error getting skill recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get detailed mentor profile for skill matching
router.get("/mentor/:mentor_id/skills", authenticateToken, async (req, res) => {
  try {
    const { mentor_id } = req.params;
    const userId = req.user.id;

    // Verify mentor exists and is actually a mentor
    const mentorCheck = await pool.query(
      "SELECT id, first_name, last_name, email FROM users WHERE id = $1 AND user_type = 'mentor'",
      [mentor_id]
    );

    if (mentorCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }

    // Get mentor's teaching skills with stats
    const skillsQuery = `
      SELECT
        s.id as skill_id,
        s.name as skill_name,
        s.category as skill_category,
        s.description as skill_description,
        us.proficiency_level,
        us.skill_type,
        -- Teaching stats for this skill
        COUNT(DISTINCT sess.id) as sessions_taught,
        COUNT(DISTINCT sess.student_id) as students_taught,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as total_reviews,
        -- Recent activity
        MAX(sess.scheduled_at) as last_session_date
      FROM skills s
      JOIN user_skills us ON s.id = us.skill_id
      LEFT JOIN sessions sess ON us.user_id = sess.mentor_id AND sess.skill_id = s.id AND sess.status = 'completed'
      LEFT JOIN session_reviews r ON sess.id = r.session_id
      WHERE us.user_id = $1 AND us.skill_type IN ('teaching', 'both')
      GROUP BY s.id, s.name, s.category, s.description, us.proficiency_level, us.skill_type
      ORDER BY us.proficiency_level DESC, sessions_taught DESC
    `;

    const skillsResult = await pool.query(skillsQuery, [mentor_id]);

    // Get mentor's availability
    const availabilityQuery = `
      SELECT availability FROM user_profiles WHERE user_id = $1
    `;
    const availabilityResult = await pool.query(availabilityQuery, [mentor_id]);

    // Get mentor's overall stats
    const statsQuery = `
      SELECT
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT s.student_id) as unique_students,
        AVG(r.rating) as overall_rating,
        COUNT(r.id) as total_reviews
      FROM sessions s
      LEFT JOIN session_reviews r ON s.id = r.session_id
      WHERE s.mentor_id = $1 AND s.status = 'completed'
    `;
    const statsResult = await pool.query(statsQuery, [mentor_id]);

    const mentor = mentorCheck.rows[0];
    const skills = skillsResult.rows.map(row => ({
      skill_id: row.skill_id,
      skill_name: row.skill_name,
      category: row.skill_category,
      description: row.skill_description,
      proficiency_level: row.proficiency_level,
      teaching_stats: {
        sessions_taught: parseInt(row.sessions_taught || 0),
        students_taught: parseInt(row.students_taught || 0),
        average_rating: row.average_rating ? Math.round(row.average_rating * 10) / 10 : null,
        total_reviews: parseInt(row.total_reviews || 0)
      },
      last_session: row.last_session_date
    }));

    res.json({
      success: true,
      data: {
        mentor: {
          id: mentor.id,
          name: `${mentor.first_name} ${mentor.last_name}`,
          email: mentor.email
        },
        skills: skills,
        availability: availabilityResult.rows[0]?.availability || null,
        overall_stats: statsResult.rows[0] || {
          total_sessions: 0,
          unique_students: 0,
          overall_rating: null,
          total_reviews: 0
        }
      }
    });

  } catch (error) {
    console.error("Error getting mentor skills profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Smart skill search with mentor matching
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { q: searchQuery, category, limit = 20 } = req.query;

    if (!searchQuery && !category) {
      return res.status(400).json({
        success: false,
        message: "Search query or category is required"
      });
    }

    // Get current role
    const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
    const roleResult = await pool.query(roleQuery, [userId]);
    const currentRole = roleResult.rows[0]?.current_role || 'both';

    // Get skills the user already knows
    const knownSkillsQuery = `
      SELECT skill_id FROM user_skills
      WHERE user_id = $1 AND skill_type IN ('teaching', 'both')
    `;
    const knownSkillsResult = await pool.query(knownSkillsQuery, [userId]);
    const knownSkillIds = knownSkillsResult.rows.map(row => row.skill_id);

    // Build search conditions
    let whereConditions = [];
    let queryParams = [userId];
    let paramIndex = 2;

    if (searchQuery) {
      whereConditions.push(`(s.name ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`s.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    // Exclude known skills
    if (knownSkillIds.length > 0) {
      whereConditions.push(`s.id NOT IN (${knownSkillIds.map((_, i) => `$${paramIndex + i}`).join(',')})`);
      queryParams.push(...knownSkillIds);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Search for skills with mentor availability
    const searchQuerySQL = `
      SELECT
        s.id,
        s.name,
        s.category,
        s.description,
        COUNT(DISTINCT us.user_id) as available_mentors,
        AVG(us.proficiency_level) as avg_mentor_proficiency,
        MAX(r.rating) as best_mentor_rating,
        COUNT(DISTINCT r.id) as total_skill_reviews
      FROM skills s
      LEFT JOIN user_skills us ON s.id = us.skill_id AND us.skill_type IN ('teaching', 'both')
      LEFT JOIN sessions sess ON us.user_id = sess.mentor_id AND sess.skill_id = s.id AND sess.status = 'completed'
      LEFT JOIN session_reviews r ON sess.id = r.session_id
      ${whereClause}
      GROUP BY s.id, s.name, s.category, s.description
      HAVING COUNT(DISTINCT us.user_id) > 0
      ORDER BY available_mentors DESC, avg_mentor_proficiency DESC, best_mentor_rating DESC
      LIMIT $${paramIndex}
    `;

    queryParams.push(limit);
    const searchResult = await pool.query(searchQuerySQL, queryParams);

    const skills = searchResult.rows.map(row => ({
      skill_id: row.id,
      skill_name: row.name,
      category: row.category,
      description: row.description,
      mentor_availability: {
        available_mentors: parseInt(row.available_mentors),
        avg_proficiency: Math.round(row.avg_mentor_proficiency * 10) / 10,
        best_rating: row.best_mentor_rating ? Math.round(row.best_mentor_rating * 10) / 10 : null,
        total_reviews: parseInt(row.total_skill_reviews)
      }
    }));

    res.json({
      success: true,
      data: {
        skills: skills,
        search_query: searchQuery || null,
        category_filter: category || null,
        known_skills_excluded: knownSkillIds.length,
        current_role: currentRole
      }
    });

  } catch (error) {
    console.error("Error in skill search:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get mentor statistics for a specific skill
router.get("/skill/:skill_id/stats", authenticateToken, async (req, res) => {
  try {
    const { skill_id } = req.params;

    // Verify skill exists
    const skillCheck = await pool.query("SELECT id, name, category FROM skills WHERE id = $1", [skill_id]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    // Get comprehensive stats for this skill
    const statsQuery = `
      SELECT
        COUNT(DISTINCT us.user_id) as total_mentors,
        AVG(us.proficiency_level) as avg_proficiency,
        COUNT(DISTINCT sess.id) as total_sessions,
        COUNT(DISTINCT sess.student_id) as total_students,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as total_reviews,
        -- Top mentors for this skill
        (
          SELECT json_agg(
            json_build_object(
              'mentor_id', u.id,
              'mentor_name', CONCAT(u.first_name, ' ', u.last_name),
              'proficiency_level', us2.proficiency_level,
              'avg_rating', ROUND(AVG(r2.rating)::numeric, 2),
              'total_sessions', COUNT(sess2.id)
            ) ORDER BY AVG(r2.rating) DESC NULLS LAST, COUNT(sess2.id) DESC
          )
          FROM users u
          JOIN user_skills us2 ON u.id = us2.user_id
          LEFT JOIN sessions sess2 ON u.id = sess2.mentor_id AND sess2.skill_id = $1 AND sess2.status = 'completed'
          LEFT JOIN session_reviews r2 ON sess2.id = r2.session_id
          WHERE us2.skill_id = $1 AND us2.skill_type IN ('teaching', 'both')
          GROUP BY u.id, u.first_name, u.last_name, us2.proficiency_level
          HAVING COUNT(sess2.id) > 0
          LIMIT 5
        ) as top_mentors
      FROM skills s
      LEFT JOIN user_skills us ON s.id = us.skill_id AND us.skill_type IN ('teaching', 'both')
      LEFT JOIN sessions sess ON us.user_id = sess.mentor_id AND sess.skill_id = s.id AND sess.status = 'completed'
      LEFT JOIN session_reviews r ON sess.id = r.session_id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.category
    `;

    const statsResult = await pool.query(statsQuery, [skill_id]);

    if (statsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data available for this skill"
      });
    }

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        skill: skillCheck.rows[0],
        statistics: {
          total_mentors: parseInt(stats.total_mentors || 0),
          avg_proficiency: stats.avg_proficiency ? Math.round(stats.avg_proficiency * 10) / 10 : 0,
          total_sessions: parseInt(stats.total_sessions || 0),
          total_students: parseInt(stats.total_students || 0),
          avg_rating: stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0,
          total_reviews: parseInt(stats.total_reviews || 0)
        },
        top_mentors: stats.top_mentors || []
      }
    });

  } catch (error) {
    console.error("Error getting skill statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
