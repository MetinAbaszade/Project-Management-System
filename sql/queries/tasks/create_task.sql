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
    deadline,
    estimated_hours,
    is_billable,
    tags
) VALUES (
    ?, -- project_id
    ?, -- title
    ?, -- description
    ?, -- type
    ?, -- priority
    ?, -- status
    ?, -- created_by
    ?, -- assigned_to
    ?, -- deadline
    ?, -- estimated_hours
    ?, -- is_billable
    ? -- tags
);

-- Insert into task_status_history to track initial status
INSERT INTO task_status_history (
    task_id,
    user_id,
    old_status,
    new_status
) VALUES (
    LAST_INSERT_ID(), -- task_id
    ?, -- user_id (same as created_by)
    '', -- old_status (empty for new task)
    ? -- new_status (same as initial status)
);