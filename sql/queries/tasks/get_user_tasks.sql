-- File: queries/tasks/get_user_tasks.sql

-- Get tasks assigned to a user
SELECT 
    t.task_id,
    t.title,
    t.status,
    t.priority,
    tt.type_name,
    tt.color AS type_color,
    p.project_id,
    p.name AS project_name,
    t.deadline,
    t.estimated_hours,
    t.actual_hours,
    t.created_at,
    t.updated_at,
    
    -- Calculate due date status
    CASE 
        WHEN t.deadline IS NULL THEN 'none'
        WHEN t.status = 'Done' THEN 'completed'
        WHEN t.deadline < CURRENT_DATE() THEN 'overdue'
        WHEN t.deadline = CURRENT_DATE() THEN 'today'
        WHEN t.deadline < DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY) THEN 'upcoming'
        ELSE 'future'
    END AS due_date_status,
    
    -- Calculate days to deadline
    CASE 
        WHEN t.deadline IS NULL THEN NULL
        WHEN t.status = 'Done' THEN 0
        ELSE DATEDIFF(t.deadline, CURRENT_DATE())
    END AS days_to_deadline,
    
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
    
    -- Show if the task is blocked
    EXISTS (
        SELECT 1 
        FROM task_dependencies td
        JOIN tasks blocker ON td.task_id = blocker.task_id
        WHERE td.dependent_task_id = t.task_id
        AND blocker.status != 'Done'
    ) AS is_blocked,
    
    -- Show sprint information
    s.sprint_id,
    s.name AS sprint_name,
    
    -- Show time tracked
    COALESCE(SUM(te.time_spent), 0) AS time_tracked
FROM 
    tasks t
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    task_types tt ON t.type = tt.type_id
LEFT JOIN 
    sprint_tasks st ON t.task_id = st.task_id
LEFT JOIN 
    sprints s ON st.sprint_id = s.sprint_id
LEFT JOIN 
    time_entries te ON t.task_id = te.task_id
WHERE 
    t.assigned_to = :user_id
    AND (COALESCE(:project_id, 0) = 0 OR t.project_id = :project_id)
    AND (COALESCE(:status, '') = '' OR t.status = :status)
    AND (COALESCE(:priority, '') = '' OR t.priority = :priority)
    AND (
        COALESCE(:search_term, '') = ''
        OR t.title LIKE CONCAT('%', :search_term, '%')
        OR t.description LIKE CONCAT('%', :search_term, '%')
    )
GROUP BY 
    t.task_id, t.title, t.status, t.priority, tt.type_name, tt.color,
    p.project_id, p.name, t.deadline, t.estimated_hours, t.actual_hours,
    t.created_at, t.updated_at, s.sprint_id, s.name
ORDER BY 
    CASE 
        WHEN :sort_field = 'priority' AND :sort_direction = 'asc' THEN
            CASE 
                WHEN t.priority = 'Low' THEN 1
                WHEN t.priority = 'Medium' THEN 2
                WHEN t.priority = 'High' THEN 3
                WHEN t.priority = 'Critical' THEN 4
            END
    END ASC,
    CASE 
        WHEN :sort_field = 'priority' AND :sort_direction = 'desc' THEN
            CASE 
                WHEN t.priority = 'Critical' THEN 1
                WHEN t.priority = 'High' THEN 2
                WHEN t.priority = 'Medium' THEN 3
                WHEN t.priority = 'Low' THEN 4
            END
    END ASC,
    CASE 
        WHEN :sort_field = 'deadline' AND :sort_direction = 'asc' THEN t.deadline
    END ASC,
    CASE 
        WHEN :sort_field = 'deadline' AND :sort_direction = 'desc' THEN t.deadline
    END DESC,
    CASE 
        WHEN :sort_field = 'updated_at' AND :sort_direction = 'asc' THEN t.updated_at
    END ASC,
    CASE 
        WHEN :sort_field = 'updated_at' AND :sort_direction = 'desc' THEN t.updated_at
    END DESC,
    CASE 
        WHEN :sort_field = 'project' AND :sort_direction = 'asc' THEN p.name
    END ASC,
    CASE 
        WHEN :sort_field = 'project' AND :sort_direction = 'desc' THEN p.name
    END DESC,
    -- Default sort: overdue first, then by priority
    CASE 
        WHEN :sort_field IS NULL OR :sort_field = '' THEN
            CASE 
                WHEN t.status = 'InProgress' THEN 1
                WHEN t.status = 'Review' THEN 2
                WHEN t.status = 'Todo' THEN 3
                WHEN t.status = 'Backlog' THEN 4
                WHEN t.status = 'Done' THEN 5
            END
    END ASC,
    CASE 
        WHEN t.deadline IS NOT NULL AND t.deadline < CURRENT_DATE() AND t.status != 'Done' THEN 0
        ELSE 1
    END ASC,
    CASE 
        WHEN t.priority = 'Critical' THEN 1
        WHEN t.priority = 'High' THEN 2
        WHEN t.priority = 'Medium' THEN 3
        WHEN t.priority = 'Low' THEN 4
    END ASC,
    t.deadline ASC
LIMIT :limit OFFSET :offset;

-- Get count of user's tasks for pagination
SELECT 
    COUNT(*) AS total_count
FROM 
    tasks t
WHERE 
    t.assigned_to = :user_id
    AND (COALESCE(:project_id, 0) = 0 OR t.project_id = :project_id)
    AND (COALESCE(:status, '') = '' OR t.status = :status)
    AND (COALESCE(:priority, '') = '' OR t.priority = :priority)
    AND (
        COALESCE(:search_term, '') = ''
        OR t.title LIKE CONCAT('%', :search_term, '%')
        OR t.description LIKE CONCAT('%', :search_term, '%')
    );

-- Get user's task summary
SELECT 
    COUNT(CASE WHEN t.status = 'Done' THEN 1 END) AS completed_tasks,
    COUNT(CASE WHEN t.status != 'Done' THEN 1 END) AS open_tasks,
    COUNT(CASE WHEN t.status = 'InProgress' THEN 1 END) AS in_progress_tasks,
    COUNT(CASE 
        WHEN t.deadline IS NOT NULL AND t.deadline < CURRENT_DATE() AND t.status != 'Done' 
        THEN 1 
    END) AS overdue_tasks,
    COUNT(CASE 
        WHEN t.deadline IS NOT NULL AND t.deadline = CURRENT_DATE() AND t.status != 'Done' 
        THEN 1 
    END) AS due_today_tasks,
    COUNT(CASE WHEN t.priority = 'Critical' OR t.priority = 'High' THEN 1 END) AS high_priority_tasks,
    COUNT(DISTINCT t.project_id) AS active_projects
FROM 
    tasks t
WHERE 
    t.assigned_to = :user_id
    AND (
        t.status != 'Done'
        OR t.updated_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    );

-- Get recently completed tasks
SELECT 
    t.task_id,
    t.title,
    t.status,
    p.project_id,
    p.name AS project_name,
    tsh.updated_at AS completed_at
FROM 
    tasks t
JOIN 
    projects p ON t.project_id = p.project_id
JOIN 
    task_status_history tsh ON t.task_id = tsh.task_id
WHERE 
    t.assigned_to = :user_id
    AND tsh.new_status = 'Done'
    AND tsh.updated_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
ORDER BY 
    tsh.updated_at DESC
LIMIT 5;

-- Get upcoming deadlines
SELECT 
    t.task_id,
    t.title,
    t.priority,
    t.status,
    p.project_id,
    p.name AS project_name,
    t.deadline,
    DATEDIFF(t.deadline, CURRENT_DATE()) AS days_to_deadline
FROM 
    tasks t
JOIN 
    projects p ON t.project_id = p.project_id
WHERE 
    t.assigned_to = :user_id
    AND t.status != 'Done'
    AND t.deadline IS NOT NULL
    AND t.deadline BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY)
ORDER BY 
    t.deadline ASC
LIMIT 5;