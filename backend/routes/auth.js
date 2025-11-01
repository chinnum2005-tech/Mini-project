const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const pool = require("../config/database");
const { sendOTP, sendAccountDeletionEmail } = require("../config/email");
const nodemailer = require('nodemailer');
const { generateOTP, isValidCampusEmail } = require("../utils/helper");
const { authenticateToken } = require("../middleware/auth");
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// Debug: expose currently allowed campus email domains
router.get("/allowed-domains", (req, res) => {
  const { getAllowedDomains } = require("../utils/helper");
  return res.json({ success: true, domains: getAllowedDomains() });
});

// Debug: Google OAuth configuration check
router.get("/google-config", (req, res) => {
  return res.json({
    success: true,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    clientIdLength: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.length : 0,
    message: process.env.GOOGLE_CLIENT_ID ? "Google Client ID is configured" : "Google Client ID is missing"
  });
});

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6, // Limit each IP to 6 OTP requests per windowMs
  message: "Too many OTP requests, please try again later.",
});

// Rate limiting for OTP verification (stricter)
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 verification attempts per windowMs
  message: "Too many verification attempts, please try again later.",
});

// ✅ Send OTP
router.post("/send-otp", otpLimiter, async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = String(rawEmail || '').trim();
    console.log('[send-otp] email received:', email);

    if (!isValidCampusEmail(email)) {
      console.warn('[send-otp] invalid campus email by validator');
      return res.status(400).json({
        success: false,
        message: "Please use a valid campus email address",
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in DB
    const query = `
      INSERT INTO email_verifications (email, otp, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) 
      DO UPDATE SET otp = $2, expires_at = $3, verified = false
    `;
    // If ON CONFLICT fails, try alternative approach
    try {
      await pool.query(query, [email, otp, expiresAt]);
    } catch (conflictError) {
      // Fallback: Delete existing record and insert new one
      await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);
      await pool.query('INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)', [email, otp, expiresAt]);
    }

    // Send OTP via email
    console.log(`[send-otp] Generated OTP: ${otp} for email: ${email}`);
    const emailSent = await sendOTP(email, otp);
    if (emailSent) {
      console.log(`[send-otp] OTP email successfully sent to ${email}`);
      return res.json({
        success: true,
        message: "OTP sent to your campus email",
      });
    } else {
      console.error(`[send-otp] Failed to send OTP email to ${email}`);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please check your email address and try again.",
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// SMTP health check
router.get('/email-health', async (req, res) => {
  try {
    const { EMAIL_SERVICE, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER } = process.env;
    let transportConfig;
    if (EMAIL_SERVICE) {
      transportConfig = { service: EMAIL_SERVICE, auth: { user: EMAIL_USER, pass: '***' } };
    } else {
      transportConfig = {
        host: EMAIL_HOST || 'smtp.gmail.com',
        port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
        secure: EMAIL_SECURE ? EMAIL_SECURE === 'true' : false,
        auth: { user: EMAIL_USER, pass: '***' }
      };
    }
    const transporter = nodemailer.createTransport(transportConfig);
    const verified = await transporter.verify().catch(err => ({ error: String(err && err.message || err) }));
    return res.json({ success: true, transportConfig, verified });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e && e.message || e) });
  }
});

// ✅ Verify OTP (Register + Login combined)
router.post("/verify-otp", verifyOtpLimiter, async (req, res) => {
  try {
    const { email, otp, firstName, lastName, isNewUser } = req.body;
    console.log(`[verify-otp] Received request for email: ${email}, otp: ${otp}, isNewUser: ${isNewUser}`);

    // Validate inputs
    if (!email || !otp) {
      console.log(`[verify-otp] Missing email or OTP`);
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      console.log(`[verify-otp] Invalid OTP format: ${otp}`);
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    // Validate names if new user
    if (isNewUser && (!firstName || !lastName)) {
      console.log(`[verify-otp] Missing first or last name for new user`);
      return res.status(400).json({
        success: false,
        message: "First name and last name are required for registration",
      });
    }

    // Check OTP
    console.log(`[verify-otp] Checking OTP in database`);
    const otpQuery = `
      SELECT * FROM email_verifications 
      WHERE email = $1 AND otp = $2 AND expires_at > NOW() AND verified = false
    `;
    const otpResult = await pool.query(otpQuery, [email, otp]);
    console.log(`[verify-otp] Database query result: ${otpResult.rows.length} rows found`);
    
    if (otpResult.rows.length === 0) {
      console.log(`[verify-otp] No valid OTP found for email: ${email}`);
      // Let's also check what OTPs exist for this email (for debugging)
      const allOtps = await pool.query(
        "SELECT otp, expires_at, verified FROM email_verifications WHERE email = $1 ORDER BY expires_at DESC LIMIT 5",
        [email]
      );
      console.log(`[verify-otp] All OTPs for ${email}:`, allOtps.rows);
      
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as used
    console.log(`[verify-otp] Marking OTP as verified`);
    await pool.query(
      "UPDATE email_verifications SET verified = true WHERE email = $1",
      [email]
    );

    let user;

    if (isNewUser) {
      // Check if user already exists (avoid duplicate email error)
      const existingUser = await pool.query(
        "SELECT id, email, first_name, last_name, campus_verified, profile_complete FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        user = existingUser.rows[0];
      } else {
        // Register new user
        const userQuery = `
          INSERT INTO users (email, first_name, last_name, campus_verified)
          VALUES ($1, $2, $3, true)
          RETURNING id, email, first_name, last_name, campus_verified, profile_complete
        `;
        const userResult = await pool.query(userQuery, [email, firstName, lastName]);
        user = userResult.rows[0];

        // Create empty profile
        await pool.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [user.id]);
      }
    } else {
      // Login existing user
      const userQuery = `
        SELECT id, email, first_name, last_name, campus_verified, profile_complete
        FROM users WHERE email = $1
      `;
      const userResult = await pool.query(userQuery, [email]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found. Please register first.",
        });
      }
      user = userResult.rows[0];
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: isNewUser ? "Account created successfully" : "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        campusVerified: user.campus_verified,
        profileComplete: user.profile_complete,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ✅ Current user (requires Authorization: Bearer <token>)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // Query names to ensure first/last name are present even if middleware doesn't include them
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, campus_verified, profile_complete FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const row = result.rows[0];
    return res.json({
      success: true,
      user: {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        campusVerified: row.campus_verified,
        profileComplete: row.profile_complete,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ✅ Google OAuth Login
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    // Initialize Google OAuth client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, email_verified } = payload;
    
    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google email not verified",
      });
    }

    // Check if user exists
    let user;
    const existingUser = await pool.query(
      "SELECT id, email, first_name, last_name, campus_verified, profile_complete FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
    } else {
      // Create new user from Google account
      const userQuery = `
        INSERT INTO users (email, first_name, last_name, campus_verified)
        VALUES ($1, $2, $3, true)
        RETURNING id, email, first_name, last_name, campus_verified, profile_complete
      `;
      const userResult = await pool.query(userQuery, [email, given_name, family_name]);
      user = userResult.rows[0];

      // Create empty profile
      await pool.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [user.id]);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        campusVerified: user.campus_verified,
        profileComplete: user.profile_complete,
      },
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
});

// ✅ Traditional email/password login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // For testing purposes, accept any password for existing users
    // In production, you'd hash and verify passwords
    const userQuery = `
      SELECT id, email, first_name, last_name, campus_verified, profile_complete
      FROM users WHERE email = $1
    `;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        campusVerified: user.campus_verified,
        profileComplete: user.profile_complete,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ✅ Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, schoolName, yearOfStudy, department, learningGoals } = req.body;
    
    // Split full name into first and last name
    const nameParts = fullName ? fullName.trim().split(' ') : [];
    const firstName = nameParts.length > 0 ? nameParts[0] : '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Update user information
    const updateUserQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, first_name, last_name, campus_verified, profile_complete
    `;
    
    const userResult = await pool.query(updateUserQuery, [firstName, lastName, userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const user = userResult.rows[0];
    
    // Check if user profile exists
    const profileCheckQuery = `SELECT id FROM user_profiles WHERE user_id = $1`;
    const profileCheckResult = await pool.query(profileCheckQuery, [userId]);
    
    let profile;
    if (profileCheckResult.rows.length > 0) {
      // Update existing profile
      const updateProfileQuery = `
        UPDATE user_profiles 
        SET campus = $1, year_of_study = $2, department = $3, learning_goals = $4, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $5
        RETURNING id, user_id, campus, year_of_study, department, learning_goals
      `;
      
      const profileResult = await pool.query(updateProfileQuery, [
        schoolName, 
        yearOfStudy, 
        department,
        learningGoals,
        userId
      ]);
      
      profile = profileResult.rows[0];
    } else {
      // Create new profile
      const createProfileQuery = `
        INSERT INTO user_profiles (user_id, campus, year_of_study, department, learning_goals)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, campus, year_of_study, department, learning_goals
      `;
      
      const profileResult = await pool.query(createProfileQuery, [
        userId, 
        schoolName, 
        yearOfStudy, 
        department,
        learningGoals
      ]);
      
      profile = profileResult.rows[0];
    }
    
    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        campusVerified: user.campus_verified,
        profileComplete: user.profile_complete,
      },
      profile: {
        id: profile.id,
        campus: profile.campus,
        yearOfStudy: profile.year_of_study,
        department: profile.department,
        learningGoals: profile.learning_goals
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ✅ Mark profile as complete
router.put("/profile-complete", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update user profile completion status
    const updateQuery = `
      UPDATE users 
      SET profile_complete = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, campus_verified, profile_complete
    `;
    
    const result = await pool.query(updateQuery, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const user = result.rows[0];
    
    // Also create a basic user profile if it doesn't exist
    const profileCheckQuery = `SELECT id FROM user_profiles WHERE user_id = $1`;
    const profileCheckResult = await pool.query(profileCheckQuery, [userId]);
    
    if (profileCheckResult.rows.length === 0) {
      const createProfileQuery = `
        INSERT INTO user_profiles (user_id)
        VALUES ($1)
      `;
      await pool.query(createProfileQuery, [userId]);
    }
    
    return res.json({
      success: true,
      message: "Profile marked as complete",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        campusVerified: user.campus_verified,
        profileComplete: user.profile_complete,
      },
    });
  } catch (error) {
    console.error("Profile completion error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ✅ Delete user account
router.delete("/account", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First, verify the user exists and get their information for the email
    const userQuery = "SELECT email, first_name, last_name FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const user = userResult.rows[0];
    
    // Due to CASCADE constraints, we only need to delete the user record
    // All related records will be automatically deleted
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    
    // Send account deletion confirmation email
    try {
      await sendAccountDeletionEmail(user.email, user.first_name);
    } catch (emailError) {
      console.error("Failed to send account deletion email:", emailError);
      // Don't fail the request if email sending fails
    }
    
    return res.json({
      success: true,
      message: "Account and all associated data have been permanently deleted"
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting account"
    });
  }
});

// ✅ Quick login for development/testing
router.post("/quick-login", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists, if not create one
    let user;
    const existingUser = await pool.query(
      "SELECT id, email, first_name, last_name, campus_verified, profile_complete FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
    } else {
      // Create new user
      const userQuery = `
        INSERT INTO users (email, first_name, last_name, campus_verified)
        VALUES ($1, $2, $3, true)
        RETURNING id, email, first_name, last_name, campus_verified, profile_complete
      `;
      const userResult = await pool.query(userQuery, [email, 'Test', 'User']);
      user = userResult.rows[0];

      // Create empty profile
      await pool.query("INSERT INTO user_profiles (user_id) VALUES ($1)", [user.id]);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        campusVerified: user.campus_verified,
        profileComplete: user.profile_complete,
      },
    });
  } catch (error) {
    console.error("Quick login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;