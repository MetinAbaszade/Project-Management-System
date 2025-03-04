-- File: queries/tasks/get_task_details.sql

-- Get task details
SELECT 
    t.task_id,
    t.title,
    t.description,
    t.priority,
    t.status,
    tt.type_id,
    tt.type_name,
    tt.color AS type_color,
    tt.icon AS type_icon,
    t.created_at,
    t.updated_at,
    t.deadline,
    t.estimated_hours,
    t.actual_hours,
    t.completion_percentage,
    t.is_billable,
    t.tags,
    p.project_id,
    p.name AS project_name,
    p.status AS project_status,
    
    -- Creator info
    creator.user_id AS creator_id,
    CONCAT(creator.first_name, ' ', creator.last_name) AS creator_name,
    creator.image_url AS creator_image,
    
    -- Assignee info
    assignee.user_id AS assignee_id,
    CONCAT(assignee.first_name, ' ', assignee.last_name) AS assignee_name,
    assignee.image_url AS assignee_image,
    
    -- Sprint info
    s.sprint_id,
    s.name AS sprint_name,
    s.status AS sprint_status,
    s.start_date AS sprint_start_date,
    s.end_date AS sprint_end_date,
    st.story_points,
    
    -- Board column info
    bc.column_id,
    bc.name AS column_name,
    b.board_id,
    b.name AS board_name,
    
    -- Calculate due date status
    CASE 
        WHEN t.deadline IS NULL THEN 'none'
        WHEN t.status = 'Done' THEN 'completed'
        WHEN t.deadline < CURRENT_DATE() THEN 'overdue'
        WHEN t.deadline = CURRENT_DATE() THEN 'today'
        WHEN t.deadline < DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY) THEN 'upcoming'
        ELSE 'future'
    END AS due_date_status,
    
    -- Calculate days overdue or remaining
    CASE 
        WHEN t.deadline IS NULL THEN NULL
        WHEN t.status = 'Done' THEN 0
        ELSE DATEDIFF(t.deadline, CURRENT_DATE())
    END AS days_to_deadline,
    
    -- Count comments
    (
        SELECT COUNT(*) 
        FROM comments 
        WHERE task_id = t.task_id
    ) AS comment_count,
    
    -- Count attachments
    (
        SELECT COUNT(*) 
        FROM task_attachments 
        WHERE task_id = t.task_id
    ) AS attachment_count,
    
    -- Count subtasks and their status
    (
        SELECT COUNT(*) 
        FROM subtasks 
        WHERE parent_task_id = t.task_id
    ) AS subtask_count,
    (
        SELECT COUNT(*) 
        FROM subtasks 
        WHERE parent_task_id = t.task_id
        AND status = 'Done'
    ) AS completed_subtask_count,
    
    -- Dependencies count
    (
        SELECT COUNT(*) 
        FROM task_dependencies 
        WHERE dependent_task_id = t.task_id
    ) AS blocking_task_count,
    (
        SELECT COUNT(*) 
        FROM task_dependencies 
        WHERE task_id = t.task_id
    ) AS blocked_task_count
FROM 
    tasks t
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    task_types tt ON t.type = tt.type_id
LEFT JOIN 
    users creator ON t.created_by = creator.user_id
LEFT JOIN 
    users assignee ON t.assigned_to = assignee.user_id
LEFT JOIN 
    sprint_tasks st ON t.task_id = st.task_id
LEFT JOIN 
    sprints s ON st.sprint_id = s.sprint_id
LEFT JOIN 
    board_columns bc ON t.status = bc.task_status
LEFT JOIN 
    boards b ON bc.board_id = b.board_id AND b.project_id = t.project_id
WHERE 
    t.task_id = :task_id;

-- Get task labels
SELECT 
    l.label_id,
    l.name,
    l.color,
    tl.added_at,
    CONCAT(u.first_name, ' ', u.last_name) AS added_by_name
FROM 
    task_labels tl
JOIN 
    labels l ON tl.label_id = l.label_id
LEFT JOIN 
    users u ON tl.added_by = u.user_id
WHERE 
    tl.task_id = :task_id
ORDER BY 
    l.name;

-- Get task comments
SELECT 
    c.comment_id,
    c.content,
    c.created_at,
    c.updated_at,
    c.is_edited,
    c.parent_comment_id,
    c.mentions,
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.image_url,
    (
        SELECT COUNT(*) 
        FROM comments 
        WHERE parent_comment_id = c.comment_id
    ) AS reply_count
FROM 
    comments c
LEFT JOIN 
    users u ON c.user_id = u.user_id
WHERE 
    c.task_id = :task_id
ORDER BY 
    COALESCE(c.parent_comment_id, c.comment_id),
    c.created_at;

-- Get task attachments
SELECT 
    ta.attachment_id,
    ta.file_url,
    ta.file_name,
    ta.file_size,
    ta.file_type,
    ta.uploaded_at,
    ta.description,
    CONCAT(u.first_name, ' ', u.last_name) AS uploaded_by_name,
    u.image_url
FROM 
    task_attachments ta
LEFT JOIN 
    users u ON ta.uploaded_by = u.user_id
WHERE 
    ta.task_id = :task_id
ORDER BY 
    ta.uploaded_at DESC;

-- Get task subtasks
SELECT 
    s.subtask_id,
    s.title,
    s.description,
    s.status,
    s.estimated_hours,
    s.actual_hours,
    s.created_at,
    s.updated_at,
    s.deadline,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
    u.image_url AS assigned_to_image
FROM 
    subtasks s
LEFT JOIN 
    users u ON s.assigned_to = u.user_id
WHERE 
    s.parent_task_id = :task_id
ORDER BY 
    CASE 
        WHEN s.status = 'Todo' THEN 1
        WHEN s.status = 'InProgress' THEN 2
        WHEN s.status = 'Done' THEN 3
    END,
    s.created_at;

-- Get task status history
SELECT 
    tsh.history_id,
    tsh.old_status,
    tsh.new_status,
    tsh.updated_at,
    tsh.time_in_status,
    tsh.notes,
    CONCAT(u.first_name, ' ', u.last_name) AS updated_by_name,
    u.image_url
FROM 
    task_status_history tsh
LEFT JOIN 
    users u ON tsh.user_id = u.user_id
WHERE 
    tsh.task_id = :task_id
ORDER BY 
    tsh.updated_at DESC;

-- Get time entries for the task
SELECT 
    te.time_entry_id,
    te.time_spent,
    te.entry_date,
    te.start_time,
    te.end_time,
    te.description,
    te.billable,
    te.created_at,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.image_url,
    CONCAT(a.first_name, ' ', a.last_name) AS approved_by_name,
    te.approved_at
FROM 
    time_entries te
LEFT JOIN 
    users u ON te.user_id = u.user_id
LEFT JOIN 
    users a ON te.approved_by = a.user_id
WHERE 
    te.task_id = :task_id
ORDER BY 
    te.entry_date DESC, te.created_at DESC;