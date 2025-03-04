-- File: queries/projects/add_project_member.sql

-- Add a user as a project member
INSERT INTO project_members (
    project_id,
    user_id,
    role_in_project,
    member_type,
    hourly_rate,
    invited_by,
    joined_at
)
VALUES (
    :project_id,
    :user_id,
    :role_in_project,
    :member_type,
    :hourly_rate,
    :invited_by,
    NOW()
)
ON DUPLICATE KEY UPDATE
    role_in_project = :role_in_project,
    member_type = :member_type,
    hourly_rate = :hourly_rate,
    invited_by = :invited_by;

-- Remove a user from a project
DELETE FROM project_members
WHERE project_id = :project_id AND user_id = :user_id;

-- Get all project members with details
SELECT 
    pm.project_member_id,
    pm.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS member_name,
    u.email,
    u.image_url,
    pm.role_in_project,
    pm.member_type,
    pm.total_hours_worked,
    pm.hourly_rate,
    pm.joined_at,
    CONCAT(inv.first_name, ' ', inv.last_name) AS invited_by_name
FROM 
    project_members pm
JOIN 
    users u ON pm.user_id = u.user_id
LEFT JOIN 
    users inv ON pm.invited_by = inv.user_id
WHERE 
    pm.project_id = :project_id
ORDER BY 
    CASE 
        WHEN pm.member_type = 'Owner' THEN 0
        ELSE 1
    END,
    u.first_name, u.last_name;

-- Check if user is a member of the project
SELECT 
    EXISTS (
        SELECT 1 
        FROM project_members 
        WHERE project_id = :project_id 
        AND user_id = :user_id
    ) AS is_member;

-- Get all users who are not project members (for inviting)
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.image_url
FROM 
    users u
WHERE 
    u.is_active = TRUE
    AND u.user_id NOT IN (
        SELECT user_id 
        FROM project_members 
        WHERE project_id = :project_id
    )
ORDER BY 
    u.first_name, u.last_name;

-- Update project member role
UPDATE project_members
SET 
    role_in_project = :new_role,
    hourly_rate = :new_hourly_rate
WHERE 
    project_id = :project_id 
    AND user_id = :user_id;

-- Log member addition
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
    :invited_by,
    'ADD',
    'PROJECT_MEMBER',
    :project_id,
    NOW(),
    :ip_address,
    CONCAT(
        'Added user "',
        (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE user_id = :user_id),
        '" to project with role "',
        :role_in_project,
        '"'
    )
);