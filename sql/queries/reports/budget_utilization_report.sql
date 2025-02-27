-- Generate a budget utilization report for projects
SELECT 
    p.project_id,
    p.name AS project_name,
    p.status,
    p.budget,
    p.budget_used,
    (p.budget_used / p.budget * 100) AS budget_utilization_percentage,
    p.start_date,
    p.end_date,
    
    -- Time budget analysis
    p.estimated_hours,
    SUM(te.time_spent) AS actual_hours,
    (SUM(te.time_spent) / p.estimated_hours * 100) AS time_utilization_percentage,
    
    -- Billable vs non-billable
    SUM(CASE WHEN te.billable = TRUE THEN te.time_spent ELSE 0 END) AS billable_hours,
    SUM(CASE WHEN te.billable = FALSE THEN te.time_spent ELSE 0 END) AS non_billable_hours,
    
    -- Task type breakdown
    (SELECT GROUP_CONCAT(CONCAT(tt.type_name, ': $', SUM(t2.budget_used)) SEPARATOR ', ')
     FROM tasks t2
     JOIN task_types tt ON t2.type = tt.type_id
     WHERE t2.project_id = p.project_id
     GROUP BY tt.type_id) AS cost_by_task_type,
    
    -- Member cost
    (SELECT SUM(te2.time_spent * pm.hourly_rate)
     FROM time_entries te2
     JOIN tasks t2 ON te2.task_id = t2.task_id
     JOIN project_members pm ON te2.user_id = pm.user_id AND t2.project_id = pm.project_id
     WHERE t2.project_id = p.project_id) AS calculated_labor_cost,
    
    -- Completion vs Budget
    (p.completion_percentage / (p.budget_used / p.budget * 100)) AS value_efficiency_ratio,
    
    -- Remaining budget
    (p.budget - p.budget_used) AS remaining_budget
FROM 
    projects p
LEFT JOIN 
    tasks t ON p.project_id = t.project_id
LEFT JOIN 
    time_entries te ON t.task_id = te.task_id
WHERE 
    (? IS NULL OR p.project_id = ?) AND -- Filter by specific project
    (? IS NULL OR p.status = ?) -- Filter by status
GROUP BY 
    p.project_id
ORDER BY 
    budget_utilization_percentage DESC;