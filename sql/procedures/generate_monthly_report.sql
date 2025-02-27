-- Procedure to generate monthly reports for all active projects
CREATE PROCEDURE generate_monthly_report(
    IN year_param INT,
    IN month_param INT,
    IN admin_user_id INT
)
BEGIN
    DECLARE report_start_date DATE;
    DECLARE report_end_date DATE;
    DECLARE project_id_var INT;
    DECLARE project_name_var VARCHAR(100);
    DECLARE done INT DEFAULT FALSE;
    DECLARE project_cursor CURSOR FOR
        SELECT project_id, name
        FROM projects
        WHERE status = 'Active';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Set report period
    SET report_start_date = CONCAT(year_param, '-', LPAD(month_param, 2, '0'), '-01');
    SET report_end_date = LAST_DAY(report_start_date);
    
    -- Create temporary table for report data
    CREATE TEMPORARY TABLE IF NOT EXISTS monthly_report_data (
        project_id INT,
        project_name VARCHAR(100),
        report_period VARCHAR(20),
        total_tasks INT,
        completed_tasks INT,
        completion_rate FLOAT,
        total_hours FLOAT,
        billable_hours FLOAT,
        budget_used DECIMAL(15, 2),
        budget_remaining DECIMAL(15, 2),
        overdue_tasks INT,
        active_members INT,
        generated_at DATETIME,
        generated_by INT
    );
    
    -- Clear any existing data for the reporting period
    DELETE FROM monthly_report_data
    WHERE report_period = CONCAT(year_param, '-', LPAD(month_param, 2, '0'));
    
    OPEN project_cursor;
    
    read_loop: LOOP
        FETCH project_cursor INTO project_id_var, project_name_var;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert report data for this project
        INSERT INTO monthly_report_data
        SELECT
            p.project_id,
            p.name AS project_name,
            CONCAT(year_param, '-', LPAD(month_param, 2, '0')) AS report_period,
            COUNT(t.task_id) AS total_tasks,
            SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks,
            (SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) / COUNT(t.task_id) * 100) AS completion_rate,
            SUM(te.time_spent) AS total_hours,
            SUM(CASE WHEN te.billable = TRUE THEN te.time_spent ELSE 0 END) AS billable_hours,
            p.budget_used,
            (p.budget - p.budget_used) AS budget_remaining,
            SUM(CASE WHEN t.deadline < CURRENT_DATE() AND t.status != 'Done' THEN 1 ELSE 0 END) AS overdue_tasks,
            COUNT(DISTINCT pm.user_id) AS active_members,
            NOW() AS generated_at,
            admin_user_id AS generated_by
        FROM projects p
        LEFT JOIN tasks t ON p.project_id = t.project_id
        LEFT JOIN time_entries te ON t.task_id = te.task_id AND te.entry_date BETWEEN report_start_date AND report_end_date
        LEFT JOIN project_members pm ON p.project_id = pm.project_id
        WHERE p.project_id = project_id_var
        GROUP BY p.project_id;
        
        -- Call the budget update function to ensure budget figures are current
        SELECT update_budget_utilization(project_id_var);
        
    END LOOP;
    
    CLOSE project_cursor;
    
    -- Select the final report data
    SELECT * FROM monthly_report_data WHERE report_period = CONCAT(year_param, '-', LPAD(month_param, 2, '0'));
    
    -- Log report generation
    INSERT INTO audit_logs (
        user_id,
        action_type,
        entity_type,
        entity_id,
        changes_made
    ) VALUES (
        admin_user_id,
        'GENERATE_REPORT',
        'SYSTEM',
        NULL,
        CONCAT('{"report_type":"monthly", "period":"', CONCAT(year_param, '-', LPAD(month_param, 2, '0')), '"}')
    );
    
    -- Drop the temporary table
    DROP TEMPORARY TABLE IF EXISTS monthly_report_data;
    
END;