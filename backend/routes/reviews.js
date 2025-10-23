const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");

const router = express.Router();

// ✅ Submit session review and rating
router.post("/review", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { session_id, rating, review_text } = req.body;

    if (!session_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "session_id and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Verify user was part of this session and it's completed
    const sessionCheck = `
      SELECT s.id, s.student_id, s.mentor_id, s.status,
             CASE WHEN s.student_id = $1 THEN s.mentor_id ELSE s.student_id END as reviewee_id
      FROM sessions s
      WHERE s.id = $1 AND (s.student_id = $1 OR s.mentor_id = $1) AND s.status = 'completed'
    `;
    const sessionResult = await pool.query(sessionCheck, [session_id, userId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found, not authorized, or not completed"
      });
    }

    const { reviewee_id } = sessionResult.rows[0];

    // Check if user already reviewed this session
    const existingReview = `
      SELECT id FROM session_reviews
      WHERE session_id = $1 AND reviewer_id = $2
    `;
    const existingResult = await pool.query(existingReview, [session_id, userId]);

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this session"
      });
    }

    // Insert the review
    const insertQuery = `
      INSERT INTO session_reviews (session_id, reviewer_id, reviewee_id, rating, review_text)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      session_id, userId, reviewee_id, rating, review_text
    ]);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get reviews for a user (mentor or student)
router.get("/reviews/:user_id", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const userId = req.user.id;

    // Verify requesting user can view these reviews
    if (parseInt(user_id) !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these reviews"
      });
    }

    const query = `
      SELECT r.*, s.scheduled_at, s.skill_id, sk.name as skill_name,
             reviewer.first_name as reviewer_first_name, reviewer.last_name as reviewer_last_name,
             reviewee.first_name as reviewee_first_name, reviewee.last_name as reviewee_last_name
      FROM session_reviews r
      JOIN sessions s ON r.session_id = s.id
      JOIN skills sk ON s.skill_id = sk.id
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      JOIN users reviewee ON r.reviewee_id = reviewee.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [user_id]);

    // Calculate average rating
    const avgRating = result.rows.length > 0
      ? result.rows.reduce((sum, row) => sum + row.rating, 0) / result.rows.length
      : 0;

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        average_rating: Math.round(avgRating * 10) / 10,
        total_reviews: result.rows.length
      }
    });

  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get session review (for viewing after session)
router.get("/session/:session_id", authenticateToken, async (req, res) => {
  try {
    const { session_id } = req.params;
    const userId = req.user.id;

    // Verify user was part of this session
    const checkQuery = `
      SELECT id FROM sessions
      WHERE id = $1 AND (student_id = $2 OR mentor_id = $2)
    `;
    const checkResult = await pool.query(checkQuery, [session_id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Session not found or not authorized"
      });
    }

    const query = `
      SELECT r.*, reviewer.first_name as reviewer_first_name, reviewer.last_name as reviewer_last_name
      FROM session_reviews r
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      WHERE r.session_id = $1
    `;
    const result = await pool.query(query, [session_id]);

    res.json({
      success: true,
      data: result.rows[0] || null
    });

  } catch (error) {
    console.error("Error getting session review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get mentor leaderboard
router.get("/leaderboard/mentors", authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email,
             COUNT(r.id) as total_reviews,
             AVG(r.rating) as average_rating,
             SUM(r.rating) as total_rating_points
      FROM users u
      LEFT JOIN session_reviews r ON u.id = (
        SELECT s.mentor_id FROM sessions s WHERE s.id = r.session_id
      )
      WHERE u.user_type = 'mentor'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      HAVING COUNT(r.id) > 0
      ORDER BY average_rating DESC, total_reviews DESC
      LIMIT 50
    `;
    const result = await pool.query(query);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      mentor: {
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email
      },
      stats: {
        total_reviews: parseInt(row.total_reviews),
        average_rating: Math.round(row.average_rating * 10) / 10,
        total_rating_points: parseInt(row.total_rating_points)
      }
    }));

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error("Error getting mentor leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get student leaderboard (based on activity/completed sessions)
router.get("/leaderboard/students", authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email,
             COUNT(s.id) as completed_sessions,
             COUNT(r.id) as reviews_given,
             AVG(r.rating) as average_rating_given
      FROM users u
      LEFT JOIN sessions s ON u.id = s.student_id AND s.status = 'completed'
      LEFT JOIN session_reviews r ON u.id = r.reviewer_id
      WHERE u.user_type = 'student'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY completed_sessions DESC, reviews_given DESC
      LIMIT 50
    `;
    const result = await pool.query(query);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      student: {
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email
      },
      stats: {
        completed_sessions: parseInt(row.completed_sessions),
        reviews_given: parseInt(row.reviews_given),
        average_rating_given: row.average_rating_given ? Math.round(row.average_rating_given * 10) / 10 : 0
      }
    }));

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error("Error getting student leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get top mentors by skill
router.get("/leaderboard/mentors/:skill_id", authenticateToken, async (req, res) => {
  try {
    const { skill_id } = req.params;

    // Verify skill exists
    const skillCheck = await pool.query("SELECT id, name FROM skills WHERE id = $1", [skill_id]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    const query = `
      SELECT u.id, u.first_name, u.last_name, u.email,
             COUNT(r.id) as total_reviews,
             AVG(r.rating) as average_rating
      FROM users u
      JOIN sessions s ON u.id = s.mentor_id
      LEFT JOIN session_reviews r ON s.id = r.session_id
      WHERE s.skill_id = $1 AND s.status = 'completed'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      HAVING COUNT(r.id) > 0
      ORDER BY average_rating DESC, total_reviews DESC
      LIMIT 20
    `;
    const result = await pool.query(query, [skill_id]);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      mentor: {
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        email: row.email
      },
      stats: {
        total_reviews: parseInt(row.total_reviews),
        average_rating: Math.round(row.average_rating * 10) / 10,
        skill_name: skillCheck.rows[0].name
      }
    }));

    res.json({
      success: true,
      data: leaderboard,
      skill: skillCheck.rows[0]
    });

  } catch (error) {
    console.error("Error getting skill leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
