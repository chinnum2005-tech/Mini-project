const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");

const router = express.Router();

// ✅ Get all available skills
router.get("/all-skills", authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, name, category, description
      FROM skills
      ORDER BY category, name
    `;
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting all skills:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get user's skills and roles
router.get("/skills", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT us.skill_id, s.name as skill_name, s.category, us.skill_type, us.proficiency_level
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1
      ORDER BY s.name
    `;
    const result = await pool.query(query, [userId]);

    const skills = result.rows.map(row => ({
      skill_id: row.skill_id,
      skill_name: row.skill_name,
      category: row.category,
      skill_type: row.skill_type,
      proficiency_level: row.proficiency_level
    }));

    res.json({
      success: true,
      data: skills
    });

  } catch (error) {
    console.error("Error getting user skills:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Add or update user's skill with role
router.post("/skills", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill_id, skill_type, proficiency_level = 3 } = req.body;

    if (!skill_id || !skill_type) {
      return res.status(400).json({
        success: false,
        message: "skill_id and skill_type are required"
      });
    }

    // Validate skill_type - for now, we'll allow both "needed" and "offered"
    // In a more robust implementation, you would check the user's role
    if (!['needed', 'offered'].includes(skill_type)) {
      return res.status(400).json({
        success: false,
        message: "skill_type must be 'needed' or 'offered'"
      });
    }

    // For this implementation, we'll treat all users as students who can only learn
    // So we'll force the skill_type to "needed"
    const corrected_skill_type = "needed";

    if (proficiency_level < 1 || proficiency_level > 5) {
      return res.status(400).json({
        success: false,
        message: "proficiency_level must be between 1 and 5"
      });
    }

    // Verify skill exists
    const skillCheck = await pool.query("SELECT id, name FROM skills WHERE id = $1", [skill_id]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    // Insert or update user skill
    const upsertQuery = `
      INSERT INTO user_skills (user_id, skill_id, skill_type, proficiency_level)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, skill_id, skill_type)
      DO UPDATE SET proficiency_level = $4, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(upsertQuery, [userId, skill_id, corrected_skill_type, proficiency_level]);

    res.status(201).json({
      success: true,
      message: "Skill updated successfully",
      data: {
        skill_id: result.rows[0].skill_id,
        skill_name: skillCheck.rows[0].name,
        skill_type: result.rows[0].skill_type,
        proficiency_level: result.rows[0].proficiency_level
      }
    });

  } catch (error) {
    console.error("Error updating user skill:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Remove user's skill
router.delete("/skills/:skill_id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill_id } = req.params;

    const deleteQuery = `
      DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2
    `;
    const result = await pool.query(deleteQuery, [userId, skill_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found in user's profile"
      });
    }

    res.json({
      success: true,
      message: "Skill removed successfully"
    });

  } catch (error) {
    console.error("Error removing user skill:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get available skills for learning (skills user doesn't have as 'teaching' or 'both')
router.get("/skills/available-for-learning", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT s.id, s.name, s.category, s.description
      FROM skills s
      WHERE s.id NOT IN (
        SELECT skill_id FROM user_skills
        WHERE user_id = $1 AND skill_type IN ('teaching', 'both')
      )
      ORDER BY s.category, s.name
    `;
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting available skills for learning:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get available skills for teaching (skills user has proficiency in)
router.get("/skills/available-for-teaching", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT s.id, s.name, s.category, s.description, us.proficiency_level
      FROM skills s
      JOIN user_skills us ON s.id = us.skill_id
      WHERE us.user_id = $1 AND us.skill_type IN ('teaching', 'both')
      ORDER BY s.category, s.name
    `;
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting available skills for teaching:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get mentors for a specific skill (role-aware)
router.get("/mentors/:skill_id", authenticateToken, async (req, res) => {
  try {
    const { skill_id } = req.params;
    const userId = req.user.id;

    // Get current role
    const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
    const roleResult = await pool.query(roleQuery, [userId]);
    const currentRole = roleResult.rows[0]?.current_role || 'both';

    // Verify skill exists
    const skillCheck = await pool.query("SELECT id, name FROM skills WHERE id = $1", [skill_id]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    // Get mentors for this skill (users who have it as 'teaching' or 'both')
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email,
             us.proficiency_level,
             AVG(r.rating) as average_rating,
             COUNT(r.id) as total_reviews
      FROM users u
      JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN sessions s ON u.id = s.mentor_id
      LEFT JOIN session_reviews r ON s.id = r.session_id
      WHERE us.skill_id = $1 AND us.skill_type IN ('teaching', 'both')
        AND u.id != $2  -- Exclude current user
      GROUP BY u.id, u.first_name, u.last_name, u.email, us.proficiency_level
      HAVING COUNT(r.id) > 0 OR AVG(r.rating) IS NOT NULL
      ORDER BY average_rating DESC NULLS LAST, total_reviews DESC, us.proficiency_level DESC
      LIMIT 20
    `;
    const result = await pool.query(query, [skill_id, userId]);

    const mentors = result.rows.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      proficiency_level: row.proficiency_level,
      average_rating: row.average_rating ? Math.round(row.average_rating * 10) / 10 : null,
      total_reviews: parseInt(row.total_reviews)
    }));

    res.json({
      success: true,
      data: mentors,
      skill: skillCheck.rows[0],
      current_role: currentRole
    });

  } catch (error) {
    console.error("Error getting mentors for skill:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get students learning a specific skill (role-aware)
router.get("/students/:skill_id", authenticateToken, async (req, res) => {
  try {
    const { skill_id } = req.params;
    const userId = req.user.id;

    // Get current role
    const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
    const roleResult = await pool.query(roleQuery, [userId]);
    const currentRole = roleResult.rows[0]?.current_role || 'both';

    // Verify skill exists
    const skillCheck = await pool.query("SELECT id, name FROM skills WHERE id = $1", [skill_id]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    // Get students learning this skill (users who have it as 'learning' or 'both')
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email,
             us.proficiency_level,
             COUNT(s.id) as sessions_completed
      FROM users u
      JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN sessions s ON u.id = s.student_id AND s.skill_id = $1 AND s.status = 'completed'
      WHERE us.skill_id = $1 AND us.skill_type IN ('learning', 'both')
        AND u.id != $2  -- Exclude current user
      GROUP BY u.id, u.first_name, u.last_name, u.email, us.proficiency_level
      ORDER BY sessions_completed DESC, us.proficiency_level DESC
      LIMIT 20
    `;
    const result = await pool.query(query, [skill_id, userId]);

    const students = result.rows.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      proficiency_level: row.proficiency_level,
      sessions_completed: parseInt(row.sessions_completed)
    }));

    res.json({
      success: true,
      data: students,
      skill: skillCheck.rows[0],
      current_role: currentRole
    });

  } catch (error) {
    console.error("Error getting students for skill:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Initialize user with default role
router.post("/initialize", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { default_role = 'both' } = req.body;

    if (!['student', 'mentor', 'both'].includes(default_role)) {
      return res.status(400).json({
        success: false,
        message: "Default role must be 'student', 'mentor', or 'both'"
      });
    }

    // Check if user already has a role set
    const existingQuery = `SELECT id FROM user_current_role WHERE user_id = $1`;
    const existingResult = await pool.query(existingQuery, [userId]);

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User role already initialized. Use /role/set to change role."
      });
    }

    // Set initial role
    const insertQuery = `
      INSERT INTO user_current_role (user_id, current_role)
      VALUES ($1, $2) RETURNING *
    `;
    const result = await pool.query(insertQuery, [userId, default_role]);

    res.status(201).json({
      success: true,
      message: `User initialized with role: ${default_role}`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error initializing user role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
