const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");

const router = express.Router();

// ✅ Create a new learning group
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, skill_id, max_members = 10 } = req.body;

    if (!name || !skill_id) {
      return res.status(400).json({
        success: false,
        message: "name and skill_id are required"
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

    // Create the group
    const insertQuery = `
      INSERT INTO learning_groups (name, description, created_by, skill_id, max_members)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(insertQuery, [name, description, userId, skill_id, max_members]);

    // Add creator as admin member
    const memberQuery = `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'admin')
    `;
    await pool.query(memberQuery, [result.rows[0].id, userId]);

    res.status(201).json({
      success: true,
      message: "Learning group created successfully",
      data: {
        ...result.rows[0],
        skill: skillCheck.rows[0],
        member_count: 1
      }
    });

  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Join a learning group
router.post("/:group_id/join", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.params;
    const userId = req.user.id;

    // Check if group exists and is active
    const groupCheck = `
      SELECT g.*, COUNT(gm.id) as current_members
      FROM learning_groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.id = $1 AND g.is_active = true
      GROUP BY g.id
    `;
    const groupResult = await pool.query(groupCheck, [group_id]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Group not found or inactive"
      });
    }

    const group = groupResult.rows[0];

    // Check if group is full
    if (group.current_members >= group.max_members) {
      return res.status(400).json({
        success: false,
        message: "Group is full"
      });
    }

    // Check if user is already a member
    const memberCheck = `
      SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2
    `;
    const memberResult = await pool.query(memberCheck, [group_id, userId]);

    if (memberResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Already a member of this group"
      });
    }

    // Add user as member
    const joinQuery = `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'member')
    `;
    await pool.query(joinQuery, [group_id, userId]);

    res.json({
      success: true,
      message: "Successfully joined the group"
    });

  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Leave a learning group
router.post("/:group_id/leave", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.params;
    const userId = req.user.id;

    // Check if user is a member (not admin)
    const memberCheck = `
      SELECT role FROM group_members
      WHERE group_id = $1 AND user_id = $2 AND role = 'member'
    `;
    const memberResult = await pool.query(memberCheck, [group_id, userId]);

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Not a member of this group or cannot leave as admin"
      });
    }

    // Remove user from group
    const leaveQuery = `
      DELETE FROM group_members WHERE group_id = $1 AND user_id = $2
    `;
    await pool.query(leaveQuery, [group_id, userId]);

    res.json({
      success: true,
      message: "Successfully left the group"
    });

  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get group details with members
router.get("/:group_id", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.params;

    const query = `
      SELECT g.*, s.name as skill_name, s.category as skill_category,
             creator.first_name as creator_first_name, creator.last_name as creator_last_name,
             COUNT(gm.id) as member_count,
             json_agg(
               json_build_object(
                 'id', m.id,
                 'name', CONCAT(m.first_name, ' ', m.last_name),
                 'role', gm.role,
                 'joined_at', gm.joined_at
               ) ORDER BY gm.role DESC, gm.joined_at ASC
             ) as members
      FROM learning_groups g
      JOIN skills s ON g.skill_id = s.id
      JOIN users creator ON g.created_by = creator.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN users m ON gm.user_id = m.id
      WHERE g.id = $1 AND g.is_active = true
      GROUP BY g.id, s.name, s.category, creator.first_name, creator.last_name
    `;
    const result = await pool.query(query, [group_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    const group = result.rows[0];
    group.members = group.members.filter(m => m.id !== null); // Remove null entries

    res.json({
      success: true,
      data: group
    });

  } catch (error) {
    console.error("Error getting group:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get groups by skill (for students to discover groups)
router.get("/skill/:skill_id", authenticateToken, async (req, res) => {
  try {
    const { skill_id } = req.params;
    const userId = req.user.id;

    // Verify skill exists
    const skillCheck = await pool.query("SELECT id, name FROM skills WHERE id = $1", [skill_id]);
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    const query = `
      SELECT g.*, s.name as skill_name,
             creator.first_name as creator_first_name, creator.last_name as creator_last_name,
             COUNT(gm.id) as member_count,
             (SELECT role FROM group_members WHERE group_id = g.id AND user_id = $2) as user_role
      FROM learning_groups g
      JOIN skills s ON g.skill_id = s.id
      JOIN users creator ON g.created_by = creator.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.skill_id = $1 AND g.is_active = true
      GROUP BY g.id, s.name, creator.first_name, creator.last_name
      ORDER BY g.created_at DESC
    `;
    const result = await pool.query(query, [skill_id, userId]);

    const groups = result.rows.map(group => ({
      ...group,
      is_member: !!group.user_role,
      user_role: group.user_role || null
    }));

    res.json({
      success: true,
      data: groups,
      skill: skillCheck.rows[0]
    });

  } catch (error) {
    console.error("Error getting groups by skill:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get user's groups
router.get("/user/groups", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT g.*, s.name as skill_name, s.category as skill_category,
             gm.role as user_role, gm.joined_at as joined_at
      FROM learning_groups g
      JOIN group_members gm ON g.id = gm.group_id
      JOIN skills s ON g.skill_id = s.id
      WHERE gm.user_id = $1 AND g.is_active = true
      ORDER BY gm.joined_at DESC
    `;
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting user groups:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Schedule group session
router.post("/:group_id/session", authenticateToken, async (req, res) => {
  try {
    const { group_id } = req.params;
    const userId = req.user.id;
    const {
      scheduled_at,
      duration_minutes,
      meeting_link,
      location,
      notes
    } = req.body;

    if (!scheduled_at || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message: "scheduled_at and duration_minutes are required"
      });
    }

    // Verify user is admin of the group
    const memberCheck = `
      SELECT gm.role FROM group_members gm
      WHERE gm.group_id = $1 AND gm.user_id = $2 AND gm.role = 'admin'
    `;
    const memberResult = await pool.query(memberCheck, [group_id, userId]);

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Only group admins can schedule sessions"
      });
    }

    // Get group details
    const groupQuery = "SELECT * FROM learning_groups WHERE id = $1";
    const groupResult = await pool.query(groupQuery, [group_id]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    const group = groupResult.rows[0];

    // Get group members to create individual sessions
    const membersQuery = `
      SELECT user_id FROM group_members WHERE group_id = $1 AND role IN ('admin', 'member')
    `;
    const membersResult = await pool.query(membersQuery, [group_id]);

    if (membersResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No members in group"
      });
    }

    // Find a mentor for the group (could be enhanced to select based on availability/reviews)
    // For now, we'll use a simple approach - find any mentor offering this skill
    const mentorQuery = `
      SELECT u.id FROM users u
      JOIN user_skills us ON u.id = us.user_id
      WHERE us.skill_id = $1 AND us.skill_type = 'offered' AND u.user_type = 'mentor'
      LIMIT 1
    `;
    const mentorResult = await pool.query(mentorQuery, [group.skill_id]);

    if (mentorResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No available mentors for this skill"
      });
    }

    const mentorId = mentorResult.rows[0].id;

    // Create sessions for each group member
    const sessionPromises = membersResult.rows.map(member =>
      pool.query(`
        INSERT INTO sessions (student_id, mentor_id, skill_id, group_id, scheduled_at, duration_minutes, meeting_link, location, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        member.user_id, mentorId, group.skill_id, group_id,
        scheduled_at, duration_minutes, meeting_link, location, notes
      ])
    );

    const sessionResults = await Promise.all(sessionPromises);

    res.status(201).json({
      success: true,
      message: `Group session scheduled for ${membersResult.rows.length} members`,
      data: {
        group_session: {
          group_id: group_id,
          skill_name: group.name,
          scheduled_at: scheduled_at,
          duration_minutes: duration_minutes,
          member_count: membersResult.rows.length,
          mentor_id: mentorId
        },
        individual_sessions: sessionResults.map(result => result.rows[0].id)
      }
    });

  } catch (error) {
    console.error("Error scheduling group session:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;
