-- File: queries/projects/update_project_status.sql

-- Update project status
UPDATE projects
SET 
    status = :new_status,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    project_id = :project_id;

-- Complete a project
UPDATE projects
SET 
    status = 'Completed',
    completion_percentage = 100,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    project_id = :project_id;

-- Mark project as on hold
UPDATE projects
SET 
    status = 'On Hold',
    updated_at = CURRENT_TIMESTAMP
WHERE 
    project_id = :project_id;

-- Cancel a project
UPDATE projects
SET 
    status = 'Canceled',
    updated_at = CURRENT_TIMESTAMP
WHERE 
    project_id = :project_id;

-- Reactivate a project
UPDATE projects
SET 
    status = 'Active',
    updated_at = CURRENT_TIMESTAMP
WHERE 
    project_id = :project_id
    AND (status = 'On Hold' OR status = 'Planning');

-- Update project status and log the change
BEGIN;
    -- Get current status for logging
    SET @old_status = (
        SELECT status FROM projects WHERE project_id = :project_id
    );
    
    -- Update the status
    UPDATE projects
    SET 
        status = :new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        project_id = :project_id;
    
    -- Log the status change
    INSERT INTO audit_logs (
        user_id,
        action_type,
        entity_type,
        entity_id,
        action_time,
        ip_address,
        changes_made
    )
    VALUES (
        :user_id,
        'UPDATE',
        'PROJECT_STATUS',
        :project_id,
        NOW(),
        :ip_address,
        CONCAT(
            'Changed project status from "', 
            @old_status, 
            '" to "', 
            :new_status,
            '"'
        )
    );
COMMIT;

-- Check if project can be completed (all tasks done)
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN TRUE  -- No incomplete tasks
        ELSE FALSE                   -- Has incomplete tasks
    END AS can_complete
FROM 
    tasks
WHERE 
    project_id = :project_id
    AND status != 'Done';

-- Get project status history (derived from audit logs)
SELECT 
    al.action_time AS changed_at,
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(al.changes_made, '"', 4),
        '"',
        -1
    ) AS old_status,
    SUBSTRING_INDEX(
        SUBSTRING_INDEX(al.changes_made, '"', 6),
        '"',
        -1
    ) AS new_status,
    CONCAT(u.first_name, ' ', u.last_name) AS changed_by
FROM 
    audit_logs al
JOIN 
    users u ON al.user_id = u.user_id
WHERE 
    al.entity_type = 'PROJECT_STATUS'
    AND al.entity_id = :project_id
ORDER BY 
    al.action_time DESC;