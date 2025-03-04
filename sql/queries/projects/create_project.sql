-- File: queries/projects/create_project.sql

-- Create a new project
INSERT INTO projects (
    name,
    description,
    start_date,
    end_date,
    status,
    budget,
    owner_id,
    is_public,
    estimated_hours,
    created_at
)
VALUES (
    :name,
    :description,
    :start_date,
    :end_date,
    :status,
    :budget,
    :owner_id,
    :is_public,
    :estimated_hours,
    NOW()
);

-- Add project owner as a member
INSERT INTO project_members (
    project_id,
    user_id,
    role_in_project,
    member_type,
    invited_by,
    joined_at
)
VALUES (
    LAST_INSERT_ID(),  -- Get the ID of the newly created project
    :owner_id,
    'Project Manager',
    'Owner',
    :owner_id,
    NOW()
);

-- Create default board for the project
INSERT INTO boards (
    project_id,
    name,
    board_type,
    description,
    is_default,
    created_by,
    created_at
)
VALUES (
    LAST_INSERT_ID(),  -- Get the ID of the newly created project
    'Default Board',
    'Kanban',
    'Default project board',
    TRUE,
    :owner_id,
    NOW()
);

-- Create default columns for the board
INSERT INTO board_columns (
    board_id,
    name,
    order_index,
    task_status,
    description
)
VALUES
    (LAST_INSERT_ID(), 'Backlog', 0, 'Backlog', 'Tasks waiting to be worked on'),
    (LAST_INSERT_ID(), 'To Do', 1, 'Todo', 'Tasks ready to be worked on'),
    (LAST_INSERT_ID(), 'In Progress', 2, 'InProgress', 'Tasks currently being worked on'),
    (LAST_INSERT_ID(), 'Review', 3, 'Review', 'Tasks waiting for review'),
    (LAST_INSERT_ID(), 'Done', 4, 'Done', 'Completed tasks');

-- Add project languages if specified
INSERT INTO project_languages (
    project_id,
    language_id,
    usage_percentage
)
SELECT 
    LAST_INSERT_ID(),  -- Get the ID of the newly created project
    language_id,
    :usage_percentage
FROM 
    languages
WHERE 
    language_id IN (:language_ids);

-- Log project creation
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
    :owner_id,
    'CREATE',
    'PROJECT',
    LAST_INSERT_ID(),  -- Get the ID of the newly created project
    NOW(),
    :ip_address,
    CONCAT('Created project "', :name, '"')
);

-- Return the ID of the newly created project
SELECT LAST_INSERT_ID() AS project_id;