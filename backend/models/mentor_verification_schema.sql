-- Mentor verification and approval system
-- This schema extends the existing user system to support the enhanced mentor role workflow

-- Mentor application table
CREATE TABLE mentor_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    qualification VARCHAR(100) NOT NULL, -- Degree/qualification
    institution VARCHAR(255) NOT NULL, -- University/college
    years_of_experience INTEGER,
    specialization TEXT, -- Areas of expertise
    teaching_experience TEXT, -- Previous teaching experience
    motivation TEXT, -- Why they want to be a mentor
    status VARCHAR(20) CHECK (status IN ('pending', 'documents_submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected')) DEFAULT 'pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Mentor documents table
CREATE TABLE mentor_documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES mentor_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'degree_certificate', 'id_proof', 'experience_letter', etc.
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL, -- Path to the uploaded document
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id), -- Admin who verified the document
    verified_at TIMESTAMP
);

-- Mentor interview table
CREATE TABLE mentor_interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES mentor_applications(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP,
    conducted_at TIMESTAMP,
    interviewer_id INTEGER REFERENCES users(id), -- Admin who conducted the interview
    interview_notes TEXT,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentor approval history table
CREATE TABLE mentor_approval_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES mentor_applications(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL, -- 'submitted', 'document_verified', 'interview_completed', 'approved', 'rejected'
    performed_by INTEGER REFERENCES users(id), -- Admin who performed the action
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update users table to include mentor verification status
-- We'll add a column to track if a user's mentor application is approved
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mentor_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mentor_application_id INTEGER REFERENCES mentor_applications(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentor_applications_user_id ON mentor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_applications_status ON mentor_applications(status);
CREATE INDEX IF NOT EXISTS idx_mentor_documents_application_id ON mentor_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_documents_document_type ON mentor_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_mentor_interviews_application_id ON mentor_interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_interviews_status ON mentor_interviews(status);
CREATE INDEX IF NOT EXISTS idx_mentor_approval_history_application_id ON mentor_approval_history(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_approval_history_action ON mentor_approval_history(action);
CREATE INDEX IF NOT EXISTS idx_users_mentor_approved ON users(mentor_approved);
CREATE INDEX IF NOT EXISTS idx_users_mentor_application_id ON users(mentor_application_id);