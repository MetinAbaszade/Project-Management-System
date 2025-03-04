-- File: queries/tasks/create_task.sql

-- Create a new task
INSERT INTO tasks (
    project_id,
    title,
    description,
    type,
    priority,
    status,
    created_by,
    assigned_to,
    created_at,
    updated_at,
    deadline,
    estimated_hours,
    tags,
    is_billable
)
VALUES (
    :project_id,
    :title,
    :description,
    :type_id,
    :priority,
    :status,
    :created_by,
    :assigned_to,
    NOW(),
    NOW(),
    :deadline,
    :estimated_hours,
    :tags,
    :is_billable
);

-- Get the newly created task ID
SET @new_task_id = LAST_INSERT_ID();

-- Add task to sprint if specified
INSERT INTO sprint_tasks (
    sprint_id,
    task_id,
    added_by,
    added_at,
    story_points
)
SELECT 
    :sprint_id,
    @new_task_id,
    :created_by,
    NOW(),
    :story_points
WHERE 
    :sprint_id IS NOT NULL;

-- Assign labels to task if provided
INSERT INTO task_labels (
    task_id,
    label_id,
    added_by,
    added_at
)
SELECT 
    @new_task_id,
    label_id,
    :created_by,
    NOW()
FROM 
    labels
WHERE 
    label_id IN (:label_ids);

-- Add dependencies if provided
INSERT INTO task_dependencies (
    task_id,
    dependent_task_id,
    dependency_type,
    created_by,
    created_at
)
SELECT 
    @new_task_id,
    dependent_id,
    :dependency_type,
    :created_by,
    NOW()
FROM 
    (SELECT CAST(value AS UNSIGNED) AS dependent_id
     FROM JSON_TABLE(
         :dependent_task_ids,
         '$[*]' COLUMNS (value VARCHAR(20) PATH '$')
     ) AS jt) dependent_tasks;

-- Create subtasks if provided
INSERT INTO subtasks (
    parent_task_id,
    title,
    description,
    status,
    estimated_hours,
    created_at
)
SELECT
    @new_task_id,
    title,
    description,
    'Todo',
    estimated_hours,
    NOW()
FROM
    JSON_TABLE(
        :subtasks_json,
        '$[*]' COLUMNS (
            title VARCHAR(100) PATH '$.title',
            description TEXT PATH '$.description',
            estimated_hours FLOAT PATH '$.estimated_hours'
        )
    ) AS st;

-- Log task creation
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
    :created_by,
    'CREATE',
    'TASK',
    @new_task_id,
    NOW(),
    :ip_address,
    CONCAT('Created task "', :title, '"')
);

-- Create notifications for assigned user if assigned during creation
INSERT INTO notifications (
    user_id,
    title,
    content,
    notification_type,
    entity_type,
    entity_id,
    created_at,
    link,
    source_user_id
)
SELECT
    :assigned_to,
    'New Task Assigned',
    CONCAT('You have been assigned to task: ', :title),
    'TASK_ASSIGNMENT',
    'TASK',
    @new_task_id,
    NOW(),
    CONCAT('/tasks/', @new_task_id),
    :created_by
WHERE
    :assigned_to IS NOT NULL;

-- Return the newly created task ID
SELECT @new_task_id AS task_id;