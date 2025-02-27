-- Update the status of a project
UPDATE projects
SET 
    status = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    project_id = ?;

-- Insert an audit log entry for the status change
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    changes_made
) VALUES (
    ?, -- user_id
    'UPDATE_STATUS',
    'PROJECT',
    ?, -- project_id
    CONCAT('{"old_status":"', (SELECT status FROM projects WHERE project_id = ?), '", "new_status":"', ?, '"}')
);