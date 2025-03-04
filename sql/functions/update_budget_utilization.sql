-- Function to update project budget utilization based on time entries
DELIMITER //

CREATE FUNCTION update_budget_utilization(project_id_param INT)
RETURNS DECIMAL(15, 2)
DETERMINISTIC
BEGIN
    DECLARE total_labor_cost DECIMAL(15, 2);
    DECLARE total_task_costs DECIMAL(15, 2);
    DECLARE total_budget_used DECIMAL(15, 2);
    
    -- Calculate labor costs based on time entries and hourly rates
    SELECT COALESCE(SUM(te.time_spent * pm.hourly_rate), 0) INTO total_labor_cost
    FROM time_entries te
    JOIN tasks t ON te.task_id = t.task_id
    JOIN project_members pm ON te.user_id = pm.user_id AND t.project_id = pm.project_id
    WHERE t.project_id = project_id_param AND te.billable = TRUE;
    
    -- Get sum of direct task costs
    SELECT COALESCE(SUM(budget_used), 0) INTO total_task_costs
    FROM tasks
    WHERE project_id = project_id_param;
    
    -- Calculate total budget used
    SET total_budget_used = total_labor_cost + total_task_costs;
    
    -- Update the project's budget_used field
    UPDATE projects
    SET budget_used = total_budget_used
    WHERE project_id = project_id_param;
    
    RETURN total_budget_used;
END//

DELIMITER ;
