const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");

const router = express.Router();

// ✅ Report a user
router.post("/report", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { reported_user_id, report_type, description, session_id } = req.body;

    if (!reported_user_id || !report_type || !description) {
      return res.status(400).json({
        success: false,
        message: "reported_user_id, report_type, and description are required"
      });
    }

    if (!['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other'].includes(report_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report type"
      });
    }

    // Check if user is trying to report themselves
    if (parseInt(reported_user_id) === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot report yourself"
      });
    }

    // Check if session exists (if provided)
    if (session_id) {
      const sessionCheck = `
        SELECT id FROM sessions
        WHERE id = $1 AND (student_id = $2 OR mentor_id = $2)
      `;
      const sessionResult = await pool.query(sessionCheck, [session_id, userId]);

      if (sessionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Session not found or not authorized"
        });
      }
    }

    // Check if already reported this user recently (within 24 hours)
    const recentReport = `
      SELECT id FROM user_reports
      WHERE reported_by = $1 AND reported_user_id = $2
      AND created_at > NOW() - INTERVAL '24 hours'
    `;
    const recentResult = await pool.query(recentReport, [userId, reported_user_id]);

    if (recentResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this user recently"
      });
    }

    // Create the report
    const insertQuery = `
      INSERT INTO user_reports (reported_user_id, reported_by, session_id, report_type, description)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      reported_user_id, userId, session_id, report_type, description
    ]);

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Block a user
router.post("/block", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { blocked_user_id, reason, is_permanent = false } = req.body;

    if (!blocked_user_id) {
      return res.status(400).json({
        success: false,
        message: "blocked_user_id is required"
      });
    }

    // Check if user is trying to block themselves
    if (parseInt(blocked_user_id) === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot block yourself"
      });
    }

    // Check if already blocked
    const existingBlock = `
      SELECT id FROM user_blocks
      WHERE blocked_user_id = $1 AND blocked_by = $2
    `;
    const existingResult = await pool.query(existingBlock, [blocked_user_id, userId]);

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already blocked"
      });
    }

    // Calculate expiration date (30 days if not permanent)
    const expiresAt = is_permanent ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Block the user
    const insertQuery = `
      INSERT INTO user_blocks (blocked_user_id, blocked_by, reason, is_permanent, expires_at)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(insertQuery, [
      blocked_user_id, userId, reason, is_permanent, expiresAt
    ]);

    res.status(201).json({
      success: true,
      message: "User blocked successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Unblock a user
router.delete("/block/:blocked_user_id", authenticateToken, async (req, res) => {
  try {
    const { blocked_user_id } = req.params;
    const userId = req.user.id;

    const deleteQuery = `
      DELETE FROM user_blocks
      WHERE blocked_user_id = $1 AND blocked_by = $2
    `;
    const result = await pool.query(deleteQuery, [blocked_user_id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    res.json({
      success: true,
      message: "User unblocked successfully"
    });

  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get blocked users
router.get("/blocked", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT ub.*, u.first_name, u.last_name, u.email
      FROM user_blocks ub
      JOIN users u ON ub.blocked_user_id = u.id
      WHERE ub.blocked_by = $1
      ORDER BY ub.created_at DESC
    `;
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting blocked users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Check if user is blocked
router.get("/check-block/:user_id", authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user.id;

    // Check if current user has blocked the target user
    const blockedQuery = `
      SELECT id, reason, is_permanent, expires_at
      FROM user_blocks
      WHERE blocked_user_id = $1 AND blocked_by = $2
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const blockedResult = await pool.query(blockedQuery, [user_id, currentUserId]);

    // Check if target user has blocked current user
    const blockedByQuery = `
      SELECT id, reason, is_permanent, expires_at
      FROM user_blocks
      WHERE blocked_user_id = $1 AND blocked_by = $2
      AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const blockedByResult = await pool.query(blockedByQuery, [currentUserId, user_id]);

    res.json({
      success: true,
      data: {
        is_blocked: blockedResult.rows.length > 0,
        is_blocked_by: blockedByResult.rows.length > 0,
        block_details: blockedResult.rows[0] || null,
        blocked_by_details: blockedByResult.rows[0] || null
      }
    });

  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get pending reports (admin only)
router.get("/reports/pending", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin (you might want to add an admin role check here)
    const query = `
      SELECT r.*, reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name,
             reported.first_name as reported_first_name, reported.last_name as reported_last_name,
             s.scheduled_at as session_date, sk.name as skill_name
      FROM user_reports r
      JOIN users reporter ON r.reported_by = reporter.id
      JOIN users reported ON r.reported_user_id = reported.id
      LEFT JOIN sessions s ON r.session_id = s.id
      LEFT JOIN skills sk ON s.skill_id = sk.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting pending reports:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Update report status (admin only)
router.patch("/reports/:report_id", authenticateToken, async (req, res) => {
  try {
    const { report_id } = req.params;
    const userId = req.user.id;
    const { status, admin_notes } = req.body;

    if (!status || !['investigating', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: investigating, resolved, dismissed"
      });
    }

    // Update the report
    const updateQuery = `
      UPDATE user_reports
      SET status = $1, admin_notes = $2, resolved_by = $3, resolved_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND status = 'pending'
    `;
    const result = await pool.query(updateQuery, [status, admin_notes, userId, report_id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Report not found or already processed"
      });
    }

    // If resolved, you might want to take additional actions like blocking the user
    if (status === 'resolved') {
      // Here you could implement automatic blocking or other actions
      // For now, just mark as resolved
    }

    res.json({
      success: true,
      message: `Report ${status} successfully`
    });

  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get user's reports
router.get("/my-reports", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT r.*, reported.first_name as reported_first_name, reported.last_name as reported_last_name,
             s.scheduled_at as session_date, sk.name as skill_name
      FROM user_reports r
      JOIN users reported ON r.reported_user_id = reported.id
      LEFT JOIN sessions s ON r.session_id = s.id
      LEFT JOIN skills sk ON s.skill_id = sk.id
      WHERE r.reported_by = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting user reports:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Admin: Get all reports with statistics
router.get("/reports/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get report statistics
    const statsQuery = `
      SELECT
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
        COUNT(CASE WHEN status = 'dismissed' THEN 1 END) as dismissed_reports,
        report_type,
        COUNT(*) as count
      FROM user_reports
      GROUP BY report_type
      ORDER BY count DESC
    `;
    const statsResult = await pool.query(statsQuery);

    // Get recent reports
    const recentQuery = `
      SELECT r.*, reporter.first_name as reporter_first_name, reporter.last_name as reporter_last_name,
             reported.first_name as reported_first_name, reported.last_name as reported_last_name
      FROM user_reports r
      JOIN users reporter ON r.reported_by = reporter.id
      JOIN users reported ON r.reported_user_id = reported.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const recentResult = await pool.query(recentQuery);

    res.json({
      success: true,
      data: {
        statistics: statsResult.rows,
        recent_reports: recentResult.rows
      }
    });

  } catch (error) {
    console.error("Error getting report stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
