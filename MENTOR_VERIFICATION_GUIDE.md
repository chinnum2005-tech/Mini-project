# Mentor Verification System Guide

This guide explains how to set up and use the enhanced mentor verification system in BlockLearn.

## Overview

The mentor verification system implements a multi-step process for professors and teachers who want to become mentors on the platform:

1. **Application Submission** - Mentors submit their qualifications and experience
2. **Document Verification** - Mentors upload required documents for verification
3. **Interview Process** - Approved mentors go through an interview process
4. **Approval** - Mentors are either approved or rejected based on their interview

## System Components

### Database Tables

The system adds the following tables to the database:

1. `mentor_applications` - Stores mentor application information
2. `mentor_documents` - Stores uploaded documents for verification
3. `mentor_interviews` - Tracks mentor interview scheduling and results
4. `mentor_approval_history` - Maintains a history of all actions taken on applications

### API Endpoints

The system adds the following API endpoints under `/api/mentor-verification`:

- `POST /apply` - Submit a mentor application
- `POST /documents/:applicationId` - Upload documents for an application
- `GET /application-status` - Get the current user's application status
- `GET /pending-applications` - Get all pending applications (Admin only)
- `GET /application/:applicationId` - Get detailed application information (Admin only)
- `POST /verify-document/:documentId` - Verify or reject a document (Admin only)
- `POST /schedule-interview/:applicationId` - Schedule an interview (Admin only)
- `POST /complete-interview/:interviewId` - Complete an interview and make a decision (Admin only)
- `GET /can-access-mentor` - Check if a user can access mentor features

### Frontend Pages

The system adds the following frontend pages:

1. `MentorApplication.jsx` - Application form and status tracking
2. `MentorDashboard.jsx` - Dashboard for approved mentors
3. `AdminMentorApplications.jsx` - Admin interface for managing applications

## Setup Instructions

### 1. Initialize Database Tables

Run the initialization script to create the required database tables:

```bash
cd backend
npm run init-mentor-verification
```

### 2. Configure Environment Variables

Ensure the following environment variables are set in your backend [.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini Project/backend/.env) file:

```env
# File upload directory
UPLOAD_DIR=uploads/mentor-documents

# Admin user configuration (for testing)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password
```

### 3. Start the Application

Start both frontend and backend servers:

```bash
# In the root directory
npm run dev
```

## User Workflows

### For Students

1. Navigate to the application
2. Select "Student" role
3. Login or signup
4. Access student dashboard and features

### For Mentors (Professors/Teachers)

1. Navigate to the application
2. Select "Mentor" role
3. Login or signup
4. Complete the mentor application form
5. Upload required documents
6. Wait for document verification
7. Participate in scheduled interview
8. Upon approval, access mentor dashboard

### For Admins

1. Login with admin credentials
2. Navigate to the admin mentor applications page
3. Review pending applications
4. Verify uploaded documents
5. Schedule interviews
6. Conduct interviews and make approval decisions

## Testing the System

### 1. Test Mentor Application

1. Register as a new user
2. Select "Mentor" role during registration
3. Complete the mentor application form
4. Upload test documents
5. Verify the application appears in the admin panel

### 2. Test Admin Functions

1. Login as an admin user
2. Navigate to the mentor applications page
3. Verify document uploads
4. Schedule and complete a test interview
5. Approve or reject the application

### 3. Test Mentor Access

1. After approval, login as the mentor user
2. Verify access to the mentor dashboard
3. Test mentor-specific features

## Security Considerations

1. **File Uploads**: Only PDF, JPG, JPEG, and PNG files are allowed
2. **File Size Limits**: Maximum 5MB per file
3. **Authentication**: All endpoints require authentication
4. **Authorization**: Admin-only endpoints are protected
5. **Data Validation**: All input is validated and sanitized

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify database credentials in [.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini Project/backend/.env) file
   - Ensure PostgreSQL is running
   - Check network connectivity to database server

2. **File Upload Issues**:
   - Verify the uploads directory exists and has write permissions
   - Check file size limits
   - Ensure supported file formats are used

3. **Authentication Issues**:
   - Verify JWT secret is properly configured
   - Check token expiration settings
   - Ensure CORS configuration allows frontend requests

### Getting Help

For additional help:
1. Check the console logs for error messages
2. Verify all environment variables are correctly set
3. Ensure database tables are properly initialized
4. Refer to the API documentation for endpoint details

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0