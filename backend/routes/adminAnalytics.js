const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const analyticsService = require("../services/analyticsService");
const pool = require("../config/database");

const router = express.Router();

// ✅ Get platform overview statistics
router.get("/overview", authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin role verification
    const userId = req.user.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const overview = await analyticsService.getPlatformOverview();

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error("Error getting platform overview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get user growth analytics
router.get("/users/growth", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const userGrowth = await analyticsService.getUserGrowthAnalytics(parseInt(days));

    res.json({
      success: true,
      data: userGrowth
    });

  } catch (error) {
    console.error("Error getting user growth analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get session analytics
router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const sessionAnalytics = await analyticsService.getSessionAnalytics(parseInt(days));

    res.json({
      success: true,
      data: sessionAnalytics
    });

  } catch (error) {
    console.error("Error getting session analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get skill analytics
router.get("/skills", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const skillAnalytics = await analyticsService.getSkillAnalytics();

    res.json({
      success: true,
      data: skillAnalytics
    });

  } catch (error) {
    console.error("Error getting skill analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get mentor performance analytics
router.get("/mentors", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const mentorAnalytics = await analyticsService.getMentorAnalytics();

    res.json({
      success: true,
      data: mentorAnalytics
    });

  } catch (error) {
    console.error("Error getting mentor analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get student engagement analytics
router.get("/students", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const studentAnalytics = await analyticsService.getStudentAnalytics();

    res.json({
      success: true,
      data: studentAnalytics
    });

  } catch (error) {
    console.error("Error getting student analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get real-time activity metrics
router.get("/realtime", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const realtimeMetrics = await analyticsService.getRealTimeMetrics();

    res.json({
      success: true,
      data: realtimeMetrics
    });

  } catch (error) {
    console.error("Error getting real-time metrics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get blockchain analytics
router.get("/blockchain", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const blockchainAnalytics = await analyticsService.getBlockchainAnalytics();

    res.json({
      success: true,
      data: blockchainAnalytics
    });

  } catch (error) {
    console.error("Error getting blockchain analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get system health metrics
router.get("/health", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const systemHealth = await analyticsService.getSystemHealth();

    res.json({
      success: true,
      data: systemHealth
    });

  } catch (error) {
    console.error("Error getting system health:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Generate comprehensive report
router.post("/report", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { report_type = 'daily' } = req.body;

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const report = await analyticsService.generateReport(report_type);

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Export analytics data as CSV
router.get("/export/:type", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params; // users, sessions, skills, mentors, students

    // Check if user is admin
    const adminCheck = await pool.query(
      "SELECT user_type FROM users WHERE id = $1 AND user_type = 'admin'",
      [userId]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    let data = [];
    let filename = '';

    switch (type) {
      case 'users':
        const userGrowth = await analyticsService.getUserGrowthAnalytics(30);
        data = userGrowth.data;
        filename = 'user_growth_analytics.csv';
        break;

      case 'sessions':
        const sessionAnalytics = await analyticsService.getSessionAnalytics(30);
        data = sessionAnalytics.data;
        filename = 'session_analytics.csv';
        break;

      case 'skills':
        const skillAnalytics = await analyticsService.getSkillAnalytics();
        data = skillAnalytics.top_skills;
        filename = 'skill_analytics.csv';
        break;

      case 'mentors':
        const mentorAnalytics = await analyticsService.getMentorAnalytics();
        data = mentorAnalytics.top_mentors;
        filename = 'mentor_analytics.csv';
        break;

      case 'students':
        const studentAnalytics = await analyticsService.getStudentAnalytics();
        data = studentAnalytics.top_students;
        filename = 'student_analytics.csv';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid export type. Use: users, sessions, skills, mentors, students"
        });
    }

    // Generate CSV content
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data available for export"
      });
    }

    const headers = Object.keys(data[0]).join(',');
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(csvContent);

  } catch (error) {
    console.error("Error exporting analytics data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
