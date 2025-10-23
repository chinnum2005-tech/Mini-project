const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { blockchainService, TRANSACTION_TYPES } = require('../services/blockchainService');

const router = express.Router();

// ✅ Get current user role
router.get("/role/current", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user_current_role table exists
    let currentRole = 'both';
    try {
      const query = `
        SELECT current_role FROM user_current_role WHERE user_id = $1
      `;
      const result = await pool.query(query, [userId]);
      currentRole = result.rows.length > 0 ? result.rows[0].current_role : 'both';
    } catch (error) {
      // If table doesn't exist, default to 'both'
      console.warn('user_current_role table not found, defaulting to "both" role');
      currentRole = 'both';
    }

    res.json({
      success: true,
      data: { current_role: currentRole }
    });

  } catch (error) {
    console.error("Error getting current role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
});

// ✅ Set current user role (student/mentor/both)
router.post("/role/set", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.body;

    if (!role || !['student', 'mentor', 'both'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'student', 'mentor', or 'both'"
      });
    }

    // Ensure user_current_role table exists
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_current_role (
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
          current_role VARCHAR(10) CHECK (current_role IN ('student', 'mentor', 'both')) DEFAULT 'both',
          selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (createError) {
      console.warn('Could not ensure user_current_role table exists:', createError.message);
    }

    // Insert or update current role
    const upsertQuery = `
      INSERT INTO user_current_role (user_id, current_role)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET current_role = $2, selected_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await pool.query(upsertQuery, [userId, role]);

    res.json({
      success: true,
      message: `Role set to ${role}`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error setting role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
});

// ✅ Get user sessions (both as student and mentor)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT
        s.id,
        s.scheduled_at,
        s.duration_minutes,
        s.status,
        s.meeting_link,
        s.location,
        s.notes,
        s.created_at,
        s.updated_at,
        -- Student info
        student.id as student_id,
        student.first_name as student_first_name,
        student.last_name as student_last_name,
        student.email as student_email,
        -- Mentor info
        mentor.id as mentor_id,
        mentor.first_name as mentor_first_name,
        mentor.last_name as mentor_last_name,
        mentor.email as mentor_email,
        -- Skill info
        skill.id as skill_id,
        skill.name as skill_name,
        skill.category as skill_category
      FROM sessions s
      JOIN users student ON s.student_id = student.id
      JOIN users mentor ON s.mentor_id = mentor.id
      JOIN skills skill ON s.skill_id = skill.id
      WHERE s.student_id = $1 OR s.mentor_id = $1
      ORDER BY s.scheduled_at DESC
    `;

    const result = await pool.query(query, [userId]);

    const sessions = result.rows.map(row => ({
      id: row.id,
      scheduled_at: row.scheduled_at,
      duration_minutes: row.duration_minutes,
      status: row.status,
      meeting_link: row.meeting_link,
      location: row.location,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      student: {
        id: row.student_id,
        first_name: row.student_first_name,
        last_name: row.student_last_name,
        email: row.student_email
      },
      mentor: {
        id: row.mentor_id,
        first_name: row.mentor_first_name,
        last_name: row.mentor_last_name,
        email: row.mentor_email
      },
      skill: {
        id: row.skill_id,
        name: row.skill_name,
        category: row.skill_category
      }
    }));

    res.json({
      success: true,
      data: sessions
    });

  } catch (error) {
    console.error("Error getting user sessions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Create new session
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      mentor_id,
      skill_id,
      scheduled_at,
      duration_minutes,
      meeting_link,
      location,
      notes
    } = req.body;

    if (!mentor_id || !skill_id || !scheduled_at) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID, skill ID, and scheduled time are required"
      });
    }

    // Check for existing duplicate session
    const duplicateCheckQuery = `
      SELECT id FROM sessions 
      WHERE student_id = $1 AND mentor_id = $2 AND skill_id = $3 AND scheduled_at = $4
    `;
    const duplicateCheck = await pool.query(duplicateCheckQuery, [userId, mentor_id, skill_id, scheduled_at]);
    
    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A session with the same details already exists"
      });
    }

    // Verify the mentor exists and offers the requested skill
    const mentorCheckQuery = `
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN user_skills us ON u.id = us.user_id
      WHERE u.id = $1 AND us.skill_id = $2 AND us.skill_type IN ('teaching', 'both')
    `;
    const mentorCheck = await pool.query(mentorCheckQuery, [mentor_id, skill_id]);

    if (mentorCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Mentor not found or doesn't offer the requested skill"
      });
    }

    // Verify the skill exists
    const skillCheckQuery = "SELECT id, name FROM skills WHERE id = $1";
    const skillCheck = await pool.query(skillCheckQuery, [skill_id]);

    if (skillCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Skill not found"
      });
    }

    // Create the session
    const insertQuery = `
      INSERT INTO sessions (
        student_id, mentor_id, skill_id, scheduled_at, duration_minutes,
        meeting_link, location, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      userId, mentor_id, skill_id, scheduled_at, duration_minutes,
      meeting_link, location, notes
    ]);

    const session = result.rows[0];
    const skill = skillCheck.rows[0];
    const mentor = mentorCheck.rows[0];

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: {
        id: session.id,
        scheduled_at: session.scheduled_at,
        duration_minutes: session.duration_minutes,
        status: session.status,
        meeting_link: session.meeting_link,
        location: session.location,
        notes: session.notes,
        created_at: session.created_at,
        updated_at: session.updated_at,
        student: {
          id: userId,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email
        },
        mentor: {
          id: mentor.id,
          first_name: mentor.first_name,
          last_name: mentor.last_name,
          email: mentor.email
        },
        skill: {
          id: skill.id,
          name: skill.name
        }
      }
    });

  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Update session status (start, complete, cancel)
router.patch("/:session_id/status", authenticateToken, async (req, res) => {
  try {
    const { session_id } = req.params;
    const userId = req.user.id;
    const { status, notes } = req.body;

    if (!status || !['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: scheduled, in_progress, completed, cancelled"
      });
    }

    // Verify user is part of this session
    const checkQuery = `
      SELECT id, student_id, mentor_id, status FROM sessions
      WHERE id = $1 AND (student_id = $2 OR mentor_id = $2)
    `;
    const checkResult = await pool.query(checkQuery, [session_id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found or not authorized"
      });
    }

    const session = checkResult.rows[0];

    // Validate status transitions
    if (status === 'in_progress' && session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: "Can only start scheduled sessions"
      });
    }

    if (status === 'completed' && session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: "Can only complete in-progress sessions"
      });
    }

    if (status === 'cancelled' && ['completed', 'cancelled'].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed or already cancelled sessions"
      });
    }

    // Update session status
    const updateQuery = `
      UPDATE sessions
      SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;

    await pool.query(updateQuery, [status, notes, session_id]);

    res.json({
      success: true,
      message: `Session ${status} successfully`
    });

  } catch (error) {
    console.error("Error updating session status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get mentor profile with stats (only if current role allows)
router.get("/mentor/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current role
    const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
    const roleResult = await pool.query(roleQuery, [userId]);
    const currentRole = roleResult.rows[0]?.current_role || 'both';

    // Check if user can access mentor features
    if (!['mentor', 'both'].includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Switch to mentor role to access this feature."
      });
    }

    // Get mentor stats
    const statsQuery = `
      SELECT
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT s.student_id) as unique_students,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as total_reviews,
        COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_sessions
      FROM sessions s
      LEFT JOIN session_reviews r ON s.id = r.session_id
      WHERE s.mentor_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [userId]);

    // Get recent sessions
    const sessionsQuery = `
      SELECT s.*, sk.name as skill_name, st.first_name as student_first_name, st.last_name as student_last_name
      FROM sessions s
      JOIN skills sk ON s.skill_id = sk.id
      JOIN users st ON s.student_id = st.id
      WHERE s.mentor_id = $1
      ORDER BY s.scheduled_at DESC
      LIMIT 10
    `;
    const sessionsResult = await pool.query(sessionsQuery, [userId]);

    // Get pending Q&A
    const qaQuery = `
      SELECT COUNT(*) as pending_questions
      FROM session_qa qa
      WHERE qa.mentor_id = $1 AND qa.status = 'pending'
    `;
    const qaResult = await pool.query(qaQuery, [userId]);

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
        recent_sessions: sessionsResult.rows,
        pending_questions: parseInt(qaResult.rows[0]?.pending_questions || 0),
        current_role: currentRole
      }
    });

  } catch (error) {
    console.error("Error getting mentor profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get student profile with stats (only if current role allows)
router.get("/student/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current role
    const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
    const roleResult = await pool.query(roleQuery, [userId]);
    const currentRole = roleResult.rows[0]?.current_role || 'both';

    // Check if user can access student features
    if (!['student', 'both'].includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Switch to student role to access this feature."
      });
    }

    // Get student stats
    const statsQuery = `
      SELECT
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT s.mentor_id) as unique_mentors,
        AVG(r.rating) as average_rating_given,
        COUNT(r.id) as reviews_given,
        COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_sessions
      FROM sessions s
      LEFT JOIN session_reviews r ON s.id = r.session_id AND r.reviewer_id = $1
      WHERE s.student_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [userId]);

    // Get recent sessions with recordings
    const sessionsQuery = `
      SELECT s.*, sk.name as skill_name, m.first_name as mentor_first_name, m.last_name as mentor_last_name,
             COUNT(sr.id) as recording_count
      FROM sessions s
      JOIN skills sk ON s.skill_id = sk.id
      JOIN users m ON s.mentor_id = m.id
      LEFT JOIN session_recordings sr ON s.id = sr.session_id
      WHERE s.student_id = $1 AND s.status = 'completed'
      GROUP BY s.id, sk.name, m.first_name, m.last_name
      ORDER BY s.scheduled_at DESC
      LIMIT 10
    `;
    const sessionsResult = await pool.query(sessionsQuery, [userId]);

    // Get user's groups
    const groupsQuery = `
      SELECT g.*, s.name as skill_name, COUNT(gm.id) as member_count
      FROM learning_groups g
      JOIN group_members gm ON g.id = gm.group_id
      JOIN skills s ON g.skill_id = s.id
      WHERE gm.user_id = $1 AND g.is_active = true
      GROUP BY g.id, s.name
      ORDER BY gm.joined_at DESC
    `;
    const groupsResult = await pool.query(groupsQuery, [userId]);

    res.json({
      success: true,
      data: {
        stats: statsResult.rows[0],
        recent_sessions: sessionsResult.rows,
        groups: groupsResult.rows,
        current_role: currentRole
      }
    });

  } catch (error) {
    console.error("Error getting student profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get unified dashboard (shows both roles if applicable)
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current role
    const roleQuery = `SELECT current_role FROM user_current_role WHERE user_id = $1`;
    const roleResult = await pool.query(roleQuery, [userId]);
    const currentRole = roleResult.rows[0]?.current_role || 'both';

    // Get user's skills for both teaching and learning
    const skillsQuery = `
      SELECT us.skill_id, s.name as skill_name, us.skill_type, us.proficiency_level
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      WHERE us.user_id = $1
      ORDER BY s.name
    `;
    const skillsResult = await pool.query(skillsQuery, [userId]);

    // Get upcoming sessions (next 7 days)
    const sessionsQuery = `
      SELECT s.*, sk.name as skill_name,
             CASE WHEN s.student_id = $1 THEN 'student' ELSE 'mentor' END as user_role_in_session
      FROM sessions s
      JOIN skills sk ON s.skill_id = sk.id
      WHERE (s.student_id = $1 OR s.mentor_id = $1)
        AND s.status IN ('scheduled', 'in_progress')
        AND s.scheduled_at >= NOW()
        AND s.scheduled_at <= NOW() + INTERVAL '7 days'
      ORDER BY s.scheduled_at ASC
    `;
    const sessionsResult = await pool.query(sessionsQuery, [userId]);

    // Get pending Q&A if mentor
    let pendingQA = [];
    if (['mentor', 'both'].includes(currentRole)) {
      const qaQuery = `
        SELECT qa.*, s.first_name as student_first_name, s.last_name as student_last_name,
               sess.skill_id, sk.name as skill_name
        FROM session_qa qa
        JOIN users s ON qa.student_id = s.id
        JOIN sessions sess ON qa.session_id = sess.id
        JOIN skills sk ON sess.skill_id = sk.id
        WHERE qa.mentor_id = $1 AND qa.status = 'pending'
        ORDER BY qa.priority DESC, qa.asked_at ASC
        LIMIT 5
      `;
      const qaResult = await pool.query(qaQuery, [userId]);
      pendingQA = qaResult.rows;
    }

    // Get user's groups if student
    let userGroups = [];
    if (['student', 'both'].includes(currentRole)) {
      const groupsQuery = `
        SELECT g.*, s.name as skill_name, COUNT(gm.id) as member_count,
               gm.role as user_role_in_group
        FROM learning_groups g
        JOIN group_members gm ON g.id = gm.group_id
        JOIN skills s ON g.skill_id = s.id
        WHERE gm.user_id = $1 AND g.is_active = true
        GROUP BY g.id, s.name, gm.role
        ORDER BY gm.joined_at DESC
        LIMIT 5
      `;
      const groupsResult = await pool.query(groupsQuery, [userId]);
      userGroups = groupsResult.rows;
    }

    res.json({
      success: true,
      data: {
        current_role: currentRole,
        skills: skillsResult.rows,
        upcoming_sessions: sessionsResult.rows,
        pending_questions: pendingQA,
        groups: userGroups,
        can_switch_to_mentor: ['mentor', 'both'].includes(currentRole),
        can_switch_to_student: ['student', 'both'].includes(currentRole)
      }
    });

  } catch (error) {
    console.error("Error getting dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Cancel session (with notification support)
router.post("/:session_id/cancel", authenticateToken, async (req, res) => {
  try {
    const { session_id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    // Verify user is part of this session
    const checkQuery = `
      SELECT id, student_id, mentor_id, status FROM sessions
      WHERE id = $1 AND (student_id = $2 OR mentor_id = $2)
    `;
    const checkResult = await pool.query(checkQuery, [session_id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found or not authorized"
      });
    }

    const session = checkResult.rows[0];

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed sessions"
      });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Session is already cancelled"
      });
    }

    // Update session status
    const updateQuery = `
      UPDATE sessions
      SET status = 'cancelled', notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(updateQuery, [session_id, reason ? `Cancelled: ${reason}` : 'Cancelled']);

    res.json({
      success: true,
      message: "Session cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
