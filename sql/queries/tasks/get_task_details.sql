-- Get detailed information about a specific task
SELECT 
    t.*,
    tt.type_name,
    tt.color AS type_color,
    p.name AS project_name,
    CONCAT(creator.first_name, ' ', creator.last_name) AS created_by_name,
    creator.image_url AS created_by_image,
    CONCAT(assignee.first_name, ' ', assignee.last_name) AS assigned_to_name,
    assignee.image_url AS assigned_to_image,
    
    -- Time tracking
    SUM(te.time_spent) AS total_time_spent,
    
    -- Subtasks
    (SELECT COUNT(*) FROM subtasks st WHERE st.parent_task_id = t.task_id) AS total_subtasks,
    (SELECT COUNT(*) FROM subtasks st WHERE st.parent_task_id = t.task_id AND st.status = 'Done') AS completed_subtasks,
    
    -- Comments
    (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.task_id) AS comment_count,
    
    -- Dependencies
    (SELECT COUNT(*) FROM task_dependencies td WHERE td.task_id = t.task_id) AS blocking_count,
    (SELECT COUNT(*) FROM task_dependencies td WHERE td.dependent_task_id = t.task_id) AS blocked_by_count,
    
    -- Attachments
    (SELECT COUNT(*) FROM task_attachments ta WHERE ta.task_id = t.task_id) AS attachment_count
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
    time_entries te ON t.task_id = te.task_id
WHERE 
    t.task_id = ?
GROUP BY 
    t.task_id;