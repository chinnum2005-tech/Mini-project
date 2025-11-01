const express = require("express");
const pool = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/mentor-documents');
    // Create directory if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true }).then(() => {
      cb(null, uploadPath);
    }).catch(err => {
      console.error('Error creating upload directory:', err);
      cb(err);
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF, JPG, JPEG, PNG files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'));
    }
  }
});

// ✅ Submit mentor application
router.post("/apply", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      email,
      phone,
      qualification,
      institution,
      yearsOfExperience,
      specialization,
      teachingExperience,
      motivation
    } = req.body;

    // Check if user already has a pending application
    const existingAppQuery = `
      SELECT id, status FROM mentor_applications 
      WHERE user_id = $1 AND status NOT IN ('approved', 'rejected')
    `;
    const existingAppResult = await pool.query(existingAppQuery, [userId]);
    
    if (existingAppResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending mentor application"
      });
    }

    // Create mentor application
    const insertQuery = `
      INSERT INTO mentor_applications (
        user_id, first_name, last_name, email, phone, qualification, 
        institution, years_of_experience, specialization, teaching_experience, motivation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, status
    `;
    
    const result = await pool.query(insertQuery, [
      userId, firstName, lastName, email, phone, qualification,
      institution, yearsOfExperience, specialization, teachingExperience, motivation
    ]);

    // Update user record with application ID
    await pool.query(
      "UPDATE users SET mentor_application_id = $1 WHERE id = $2",
      [result.rows[0].id, userId]
    );

    res.status(201).json({
      success: true,
      message: "Mentor application submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error submitting mentor application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Upload mentor documents
router.post("/documents/:applicationId", authenticateToken, upload.array('documents', 5), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const documents = req.files;

    if (!documents || documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded"
      });
    }

    // Verify the application belongs to the user
    const appQuery = `
      SELECT id, status FROM mentor_applications 
      WHERE id = $1 AND user_id = $2
    `;
    const appResult = await pool.query(appQuery, [applicationId, userId]);
    
    if (appResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Application not found or not authorized"
      });
    }

    const application = appResult.rows[0];
    
    // Check if application is in correct status
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Documents can only be uploaded for pending applications"
      });
    }

    // Insert documents
    const documentRecords = [];
    for (const doc of documents) {
      const insertDocQuery = `
        INSERT INTO mentor_documents (application_id, document_type, document_name, file_path)
        VALUES ($1, $2, $3, $4)
        RETURNING id, document_type, document_name, uploaded_at
      `;
      
      const docType = doc.mimetype === 'application/pdf' ? 'document' : 'image';
      const result = await pool.query(insertDocQuery, [
        applicationId, 
        docType, 
        doc.originalname, 
        doc.path
      ]);
      
      documentRecords.push(result.rows[0]);
    }

    // Update application status
    await pool.query(
      "UPDATE mentor_applications SET status = 'documents_submitted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [applicationId]
    );

    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      data: documentRecords
    });

  } catch (error) {
    console.error("Error uploading mentor documents:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get user's mentor application status
router.get("/application-status", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT 
        ma.id,
        ma.first_name,
        ma.last_name,
        ma.email,
        ma.qualification,
        ma.institution,
        ma.status,
        ma.application_date,
        ma.updated_at,
        COUNT(md.id) as document_count
      FROM mentor_applications ma
      LEFT JOIN mentor_documents md ON ma.id = md.application_id
      WHERE ma.user_id = $1
      GROUP BY ma.id
      ORDER BY ma.application_date DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: "No mentor application found",
        data: null
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error getting mentor application status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get all pending mentor applications (Admin only)
router.get("/pending-applications", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        ma.id,
        ma.user_id,
        ma.first_name,
        ma.last_name,
        ma.email,
        ma.qualification,
        ma.institution,
        ma.years_of_experience,
        ma.status,
        ma.application_date,
        COUNT(md.id) as document_count
      FROM mentor_applications ma
      LEFT JOIN mentor_documents md ON ma.id = md.application_id
      WHERE ma.status IN ('pending', 'documents_submitted', 'under_review', 'interview_scheduled')
      GROUP BY ma.id
      ORDER BY ma.application_date ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Error getting pending mentor applications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Get application details (Admin only)
router.get("/application/:applicationId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Get application details
    const appQuery = `
      SELECT 
        ma.*,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM mentor_applications ma
      JOIN users u ON ma.user_id = u.id
      WHERE ma.id = $1
    `;
    
    const appResult = await pool.query(appQuery, [applicationId]);
    
    if (appResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Get documents
    const docsQuery = `
      SELECT id, document_type, document_name, uploaded_at, verified
      FROM mentor_documents
      WHERE application_id = $1
      ORDER BY uploaded_at ASC
    `;
    
    const docsResult = await pool.query(docsQuery, [applicationId]);

    // Get interview details if scheduled
    const interviewQuery = `
      SELECT id, scheduled_at, status, interview_notes
      FROM mentor_interviews
      WHERE application_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const interviewResult = await pool.query(interviewQuery, [applicationId]);

    res.json({
      success: true,
      data: {
        application: appResult.rows[0],
        documents: docsResult.rows,
        interview: interviewResult.rows[0] || null
      }
    });

  } catch (error) {
    console.error("Error getting mentor application details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Verify documents (Admin only)
router.post("/verify-document/:documentId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { verified } = req.body;
    const adminId = req.user.userId;

    // Update document verification status
    const updateQuery = `
      UPDATE mentor_documents 
      SET verified = $1, verified_by = $2, verified_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING application_id
    `;
    
    const result = await pool.query(updateQuery, [verified, adminId, documentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const applicationId = result.rows[0].application_id;

    // Add to approval history
    await pool.query(
      `INSERT INTO mentor_approval_history (application_id, action, performed_by, notes)
       VALUES ($1, 'document_verified', $2, $3)`,
      [applicationId, adminId, verified ? 'Document verified' : 'Document rejected']
    );

    // If all documents are verified, update application status
    if (verified) {
      const docsQuery = `
        SELECT COUNT(*) as total, 
               COUNT(CASE WHEN verified = true THEN 1 END) as verified
        FROM mentor_documents 
        WHERE application_id = $1
      `;
      
      const docsResult = await pool.query(docsQuery, [applicationId]);
      const docs = docsResult.rows[0];
      
      if (docs.total > 0 && docs.verified === docs.total) {
        // All documents verified, update application status
        await pool.query(
          "UPDATE mentor_applications SET status = 'under_review', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [applicationId]
        );
        
        await pool.query(
          `INSERT INTO mentor_approval_history (application_id, action, performed_by, notes)
           VALUES ($1, 'all_documents_verified', $2, 'All documents verified, application under review')`,
          [applicationId, adminId]
        );
      }
    }

    res.json({
      success: true,
      message: verified ? "Document verified successfully" : "Document marked as rejected"
    });

  } catch (error) {
    console.error("Error verifying mentor document:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Schedule interview (Admin only)
router.post("/schedule-interview/:applicationId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { scheduledAt, notes } = req.body;
    const adminId = req.user.userId;

    // Check if application exists and is in correct status
    const appQuery = `
      SELECT status FROM mentor_applications 
      WHERE id = $1 AND status = 'under_review'
    `;
    const appResult = await pool.query(appQuery, [applicationId]);
    
    if (appResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Application not found or not ready for interview"
      });
    }

    // Create interview record
    const insertQuery = `
      INSERT INTO mentor_interviews (application_id, scheduled_at, interviewer_id, interview_notes)
      VALUES ($1, $2, $3, $4)
      RETURNING id, scheduled_at
    `;
    
    const result = await pool.query(insertQuery, [applicationId, scheduledAt, adminId, notes]);

    // Update application status
    await pool.query(
      "UPDATE mentor_applications SET status = 'interview_scheduled', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [applicationId]
    );

    // Add to approval history
    await pool.query(
      `INSERT INTO mentor_approval_history (application_id, action, performed_by, notes)
       VALUES ($1, 'interview_scheduled', $2, $3)`,
      [applicationId, adminId, `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}`]
    );

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error scheduling mentor interview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Complete interview (Admin only)
router.post("/complete-interview/:interviewId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { feedback, rating, approve } = req.body;
    const adminId = req.user.userId;

    // Update interview record
    const updateQuery = `
      UPDATE mentor_interviews 
      SET conducted_at = CURRENT_TIMESTAMP, interviewer_id = $1, feedback = $2, rating = $3, status = 'completed'
      WHERE id = $4
      RETURNING application_id
    `;
    
    const result = await pool.query(updateQuery, [adminId, feedback, rating, interviewId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    const applicationId = result.rows[0].application_id;

    // Update application status based on approval
    const newStatus = approve ? 'approved' : 'rejected';
    await pool.query(
      "UPDATE mentor_applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newStatus, applicationId]
    );

    // If approved, update user record
    if (approve) {
      await pool.query(
        "UPDATE users SET mentor_approved = true, user_type = 'mentor' WHERE mentor_application_id = $1",
        [applicationId]
      );
    }

    // Add to approval history
    await pool.query(
      `INSERT INTO mentor_approval_history (application_id, action, performed_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [applicationId, newStatus, adminId, feedback]
    );

    res.json({
      success: true,
      message: approve ? "Mentor approved successfully" : "Mentor application rejected",
      approved: approve
    });

  } catch (error) {
    console.error("Error completing mentor interview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// ✅ Check if user can access mentor features
router.get("/can-access-mentor", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT 
        u.mentor_approved,
        u.user_type,
        ma.status as application_status
      FROM users u
      LEFT JOIN mentor_applications ma ON u.mentor_application_id = ma.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];
    const canAccessMentor = user.mentor_approved && user.user_type === 'mentor';

    res.json({
      success: true,
      data: {
        canAccessMentor,
        mentorApproved: user.mentor_approved,
        userType: user.user_type,
        applicationStatus: user.application_status
      }
    });

  } catch (error) {
    console.error("Error checking mentor access:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;