const pool = require("../config/database");

// Middleware to check if user is an admin
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Query to check if user is admin
    // In a real implementation, you might have a separate admins table
    // or an isAdmin flag in the users table
    const query = `
      SELECT id, email, user_type 
      FROM users 
      WHERE id = $1 AND user_type = 'admin'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }
    
    // User is admin, proceed to next middleware
    req.admin = result.rows[0];
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { requireAdmin };