-- Get all tasks assigned to a specific user
SELECT 
    t.*,
    tt.type_name,
    tt.color AS type_color,
    p.name AS project_name,
    p.owner_id AS project_owner_id,
    
    -- Due date status
    CASE
        WHEN t.deadline IS NULL THEN 'no_deadline'
        WHEN t.deadline < CURRENT_DATE() AND t.status != 'Done' THEN 'overdue'
        WHEN t.deadline BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY) THEN 'due_soon'
        ELSE 'on_track'
    END AS due_status,
    
    -- Subtasks progress
    (SELECT COUNT(*) FROM subtasks st WHERE st.parent_task_id = t.task_id) AS total_subtasks,
    (SELECT COUNT(*) FROM subtasks st WHERE st.parent_task_id = t.task_id AND st.status = 'Done') AS completed_subtasks,
    
    -- Sprint info
    (SELECT s.name FROM sprints s 
     JOIN sprint_tasks st ON s.sprint_id = st.sprint_id 
     WHERE st.task_id = t.task_id AND s.status = 'Active' LIMIT 1) AS active_sprint
FROM 
    tasks t
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    task_types tt ON t.type = tt.type_id
WHERE 
    t.assigned_to = ?
ORDER BY 
    CASE
        WHEN t.status = 'InProgress' THEN 1
        WHEN t.status = 'Todo' THEN 2
        WHEN t.status = 'Review' THEN 3
        WHEN t.status = 'Backlog' THEN 4
        WHEN t.status = 'Done' THEN 5
    END,
    CASE
        WHEN t.deadline IS NULL THEN DATE('9999-12-31')
        ELSE t.deadline
    END ASC;