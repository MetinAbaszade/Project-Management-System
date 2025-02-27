-- Assign a role to a user
INSERT INTO user_roles (user_id, role_id, assigned_by)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE
    assigned_at = CURRENT_TIMESTAMP,
    assigned_by = VALUES(assigned_by);