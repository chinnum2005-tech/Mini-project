-- Create database
-- Note: Run this command separately before running the rest of the schema
-- CREATE DATABASE skill_swap_db;

-- Connect to the database before running the rest of this script
-- \c skill_swap_db;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    campus_verified BOOLEAN DEFAULT FALSE,
    profile_complete BOOLEAN DEFAULT FALSE,
    user_type VARCHAR(10) CHECK (user_type IN ('student', 'mentor', 'admin')) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification table
CREATE TABLE email_verifications (
    email VARCHAR(255) PRIMARY KEY,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(255),
    campus VARCHAR(100),
    year_of_study INTEGER,
    department VARCHAR(100),
    availability TEXT, -- JSON string for time slots
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User skills (offered and needed)
CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    skill_type VARCHAR(10) CHECK (skill_type IN ('teaching', 'learning', 'both')),
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id, skill_type)
);

-- User current role table
CREATE TABLE user_current_role (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    current_role VARCHAR(10) CHECK (current_role IN ('student', 'mentor', 'both')) DEFAULT 'both',
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for tracking learning sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    meeting_link TEXT,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Constraint to prevent duplicate sessions
    UNIQUE(student_id, mentor_id, skill_id, scheduled_at)
);

-- Session reviews table
CREATE TABLE session_reviews (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, reviewer_id)
);

-- Feedback sessions table
CREATE TABLE feedback_sessions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
    student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
    student_feedback_type VARCHAR(20),
    student_comment TEXT,
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    mentor_feedback_type VARCHAR(20),
    mentor_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User reports table
CREATE TABLE user_reports (
    id SERIAL PRIMARY KEY,
    reported_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reported_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
    report_type VARCHAR(20) CHECK (report_type IN ('spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other')),
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User blocks table
CREATE TABLE user_blocks (
    id SERIAL PRIMARY KEY,
    blocked_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    blocked_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    is_permanent BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocked_user_id, blocked_by)
);

-- Learning groups table
CREATE TABLE learning_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group members table
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES learning_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Session Q&A table
CREATE TABLE session_qa (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'answered', 'resolved')) DEFAULT 'pending',
    priority INTEGER DEFAULT 0,
    asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

-- Session recordings table
CREATE TABLE session_recordings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    recording_url VARCHAR(255),
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat conversations table
CREATE TABLE chat_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('active', 'closed')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) CHECK (sender_type IN ('user', 'bot')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- For storing additional message data like AI confidence, suggestions, etc.
);

-- Blockchain blocks table
CREATE TABLE blockchain_blocks (
    block_index SERIAL PRIMARY KEY,
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64),
    nonce INTEGER,
    data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain audit trail table
CREATE TABLE blockchain_audit_trail (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    record_id INTEGER,
    operation VARCHAR(10) CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
-- Index on users email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on email_verifications for OTP lookups
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Index on user_profiles for user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Index on user_skills for faster skill matching
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_type ON user_skills(skill_type);

-- Index on skills name for searching
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_user_skills_user_type ON user_skills(user_id, skill_type);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_skill_id ON sessions(skill_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);

-- Indexes for session_reviews
CREATE INDEX IF NOT EXISTS idx_session_reviews_session_id ON session_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_session_reviews_reviewer_id ON session_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_session_reviews_reviewee_id ON session_reviews(reviewee_id);

-- Indexes for feedback_sessions
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_session_id ON feedback_sessions(session_id);

-- Indexes for user_reports
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_by ON user_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_user_reports_session_id ON user_reports(session_id);

-- Indexes for user_blocks
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_user_id ON user_blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_by ON user_blocks(blocked_by);

-- Indexes for learning_groups
CREATE INDEX IF NOT EXISTS idx_learning_groups_created_by ON learning_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_learning_groups_skill_id ON learning_groups(skill_id);

-- Indexes for group_members
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Indexes for session_qa
CREATE INDEX IF NOT EXISTS idx_session_qa_session_id ON session_qa(session_id);
CREATE INDEX IF NOT EXISTS idx_session_qa_student_id ON session_qa(student_id);
CREATE INDEX IF NOT EXISTS idx_session_qa_mentor_id ON session_qa(mentor_id);
CREATE INDEX IF NOT EXISTS idx_session_qa_status ON session_qa(status);

-- Indexes for session_recordings
CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON session_recordings(session_id);

-- Indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Indexes for blockchain_blocks
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_block_index ON blockchain_blocks(block_index);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_previous_hash ON blockchain_blocks(previous_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_current_hash ON blockchain_blocks(current_hash);

-- Indexes for blockchain_audit_trail
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_trail_table_name ON blockchain_audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_trail_record_id ON blockchain_audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_trail_user_id ON blockchain_audit_trail(user_id);

-- Indexes for user_current_role
CREATE INDEX IF NOT EXISTS idx_user_current_role_user_id ON user_current_role(user_id);
CREATE INDEX IF NOT EXISTS idx_user_current_role_current_role ON user_current_role(current_role);

ANALYZE users;
ANALYZE email_verifications;
ANALYZE user_profiles;
ANALYZE skills;
ANALYZE user_skills;
ANALYZE sessions;
ANALYZE session_reviews;