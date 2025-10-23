-- Create the missing user_current_role table
CREATE TABLE IF NOT EXISTS user_current_role (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    current_role VARCHAR(10) CHECK (current_role IN ('student', 'mentor', 'both')) DEFAULT 'both',
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_current_role_user_id ON user_current_role(user_id);
CREATE INDEX IF NOT EXISTS idx_user_current_role_current_role ON user_current_role(current_role);

-- Insert default roles for existing users (if any)
INSERT INTO user_current_role (user_id, current_role)
SELECT id, 'both'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_current_role)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the table was created
SELECT COUNT(*) as count FROM user_current_role;