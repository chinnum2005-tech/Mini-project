-- Add missing user_current_role table
CREATE TABLE IF NOT EXISTS user_current_role (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    current_role VARCHAR(10) CHECK (current_role IN ('student', 'mentor', 'both')) DEFAULT 'both',
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_current_role_user_id ON user_current_role(user_id);
CREATE INDEX IF NOT EXISTS idx_user_current_role_current_role ON user_current_role(current_role);

-- Add table for session reviews
CREATE TABLE IF NOT EXISTS session_reviews (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, reviewer_id)
);

-- Add indexes for session_reviews
CREATE INDEX IF NOT EXISTS idx_session_reviews_session_id ON session_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_session_reviews_reviewer_id ON session_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_session_reviews_reviewee_id ON session_reviews(reviewee_id);

-- Add table for feedback_sessions
CREATE TABLE IF NOT EXISTS feedback_sessions (
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

-- Add indexes for feedback_sessions
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_session_id ON feedback_sessions(session_id);

-- Add table for user_reports
CREATE TABLE IF NOT EXISTS user_reports (
    id SERIAL PRIMARY KEY,
    reported_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reported_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
    report_type VARCHAR(20) CHECK (report_type IN ('spam', 'harassment', 'inappropriate_content', 'fake_profile', 'other')),
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for user_reports
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_by ON user_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_user_reports_session_id ON user_reports(session_id);

-- Add table for user_blocks
CREATE TABLE IF NOT EXISTS user_blocks (
    id SERIAL PRIMARY KEY,
    blocked_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    blocked_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    is_permanent BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocked_user_id, blocked_by)
);

-- Add indexes for user_blocks
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_user_id ON user_blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_by ON user_blocks(blocked_by);

-- Add table for learning_groups
CREATE TABLE IF NOT EXISTS learning_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for learning_groups
CREATE INDEX IF NOT EXISTS idx_learning_groups_created_by ON learning_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_learning_groups_skill_id ON learning_groups(skill_id);

-- Add table for group_members
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES learning_groups(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(10) CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Add indexes for group_members
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Add table for session_qa
CREATE TABLE IF NOT EXISTS session_qa (
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

-- Add indexes for session_qa
CREATE INDEX IF NOT EXISTS idx_session_qa_session_id ON session_qa(session_id);
CREATE INDEX IF NOT EXISTS idx_session_qa_student_id ON session_qa(student_id);
CREATE INDEX IF NOT EXISTS idx_session_qa_mentor_id ON session_qa(mentor_id);
CREATE INDEX IF NOT EXISTS idx_session_qa_status ON session_qa(status);

-- Add table for session_recordings
CREATE TABLE IF NOT EXISTS session_recordings (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    recording_url VARCHAR(255),
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for session_recordings
CREATE INDEX IF NOT EXISTS idx_session_recordings_session_id ON session_recordings(session_id);

-- Add table for blockchain_blocks
CREATE TABLE IF NOT EXISTS blockchain_blocks (
    block_index SERIAL PRIMARY KEY,
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64),
    nonce INTEGER,
    data JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for blockchain_blocks
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_block_index ON blockchain_blocks(block_index);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_previous_hash ON blockchain_blocks(previous_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_blocks_current_hash ON blockchain_blocks(current_hash);

-- Add table for blockchain_audit_trail
CREATE TABLE IF NOT EXISTS blockchain_audit_trail (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    record_id INTEGER,
    operation VARCHAR(10) CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for blockchain_audit_trail
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_trail_table_name ON blockchain_audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_trail_record_id ON blockchain_audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_audit_trail_user_id ON blockchain_audit_trail(user_id);

-- Add constraints to prevent duplicate sessions
ALTER TABLE sessions 
ADD CONSTRAINT unique_student_mentor_skill_time 
UNIQUE(student_id, mentor_id, skill_id, scheduled_at);

-- Update existing tables with missing constraints
ALTER TABLE users 
ADD CONSTRAINT unique_email 
UNIQUE(email);

-- Create a function to clean up duplicate sessions
CREATE OR REPLACE FUNCTION cleanup_duplicate_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete duplicate sessions, keeping the one with the earliest created_at
    WITH duplicates AS (
        SELECT id, 
               ROW_NUMBER() OVER (
                   PARTITION BY student_id, mentor_id, skill_id, scheduled_at 
                   ORDER BY created_at
               ) as rn
        FROM sessions
    )
    DELETE FROM sessions 
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to prevent duplicate mentors in skill matching
CREATE OR REPLACE FUNCTION get_unique_mentors_for_skill(skill_ids INTEGER[])
RETURNS TABLE(
    id INTEGER,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    skill_id INTEGER,
    skill_name VARCHAR(100),
    average_rating NUMERIC,
    total_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (u.id)
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        s.id as skill_id,
        s.name as skill_name,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as total_reviews
    FROM users u
    JOIN user_skills us ON u.id = us.user_id
    JOIN skills s ON us.skill_id = s.id
    LEFT JOIN sessions sess ON u.id = sess.mentor_id AND sess.status = 'completed'
    LEFT JOIN session_reviews r ON sess.id = r.session_id
    WHERE us.skill_id = ANY(skill_ids)
      AND us.skill_type IN ('teaching', 'both')
    GROUP BY u.id, u.first_name, u.last_name, u.email, s.id, s.name
    ORDER BY u.id, COUNT(sess.id) DESC;
END;
$$ LANGUAGE plpgsql;