DELIMITER //

CREATE PROCEDURE generate_monthly_reports(
    IN report_month INT,
    IN report_year INT,
    IN user_id_param INT
)
BEGIN
    DECLARE report_start_date DATE;
    DECLARE report_end_date DATE;
    DECLARE report_id INT;
    
    -- Set report period
    SET report_start_date = CONCAT(report_year, '-', LPAD(report_month, 2, '0'), '-01');
    SET report_end_date = LAST_DAY(report_start_date);
    
    -- Create reports table if it doesn't exist
    CREATE TABLE IF NOT EXISTS monthly_reports (
        report_id INT PRIMARY KEY AUTO_INCREMENT,
        report_period VARCHAR(20),
        generated_by INT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        report_data JSON,
        FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE SET NULL
    );
    
    -- Insert report metadata
    INSERT INTO monthly_reports (report_period, generated_by)
    VALUES (DATE_FORMAT(report_start_date, '%Y-%m'), user_id_param);
    
    -- Get the inserted report ID
    SET report_id = LAST_INSERT_ID();
    
    -- Update with report data as JSON
    UPDATE monthly_reports
    SET report_data = (
        SELECT JSON_OBJECT(
            'period', DATE_FORMAT(report_start_date, '%Y-%m'),
            'generated_at', NOW(),
            'generated_by', (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE user_id = user_id_param),
            'project_summary', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'project_id', p.project_id,
                        'project_name', p.name,
                        'status', p.status,
                        'completion', p.completion_percentage,
                        'budget_utilization', COALESCE((p.budget_used / p.budget) * 100, 0),
                        'tasks_completed', (
                            SELECT COUNT(*) 
                            FROM tasks t
                            WHERE t.project_id = p.project_id
                            AND t.status = 'Done'
                            AND t.updated_at BETWEEN report_start_date AND report_end_date
                        ),
                        'hours_logged', (
                            SELECT COALESCE(SUM(time_spent), 0)
                            FROM time_entries te
                            JOIN tasks t ON te.task_id = t.task_id
                            WHERE t.project_id = p.project_id
                            AND te.entry_date BETWEEN report_start_date AND report_end_date
                        )
                    )
                )
                FROM projects p
                WHERE EXISTS (
                    SELECT 1 FROM tasks t
                    JOIN time_entries te ON t.task_id = te.task_id
                    WHERE t.project_id = p.project_id
                    AND te.entry_date BETWEEN report_start_date AND report_end_date
                )
            ),
            'user_productivity', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'user_id', u.user_id,
                        'user_name', CONCAT(u.first_name, ' ', u.last_name),
                        'hours_logged', COALESCE(SUM(te.time_spent), 0),
                        'tasks_completed', (
                            SELECT COUNT(DISTINCT t.task_id)
                            FROM tasks t
                            JOIN task_status_history tsh ON t.task_id = tsh.task_id
                            WHERE tsh.user_id = u.user_id
                            AND tsh.new_status = 'Done'
                            AND tsh.updated_at BETWEEN report_start_date AND report_end_date
                        )
                    )
                )
                FROM users u
                LEFT JOIN time_entries te ON u.user_id = te.user_id AND te.entry_date BETWEEN report_start_date AND report_end_date
                WHERE EXISTS (
                    SELECT 1 FROM time_entries
                    WHERE user_id = u.user_id
                    AND entry_date BETWEEN report_start_date AND report_end_date
                )
                GROUP BY u.user_id
            )
        )
    )
    WHERE report_id = report_id;
    
    -- Log report generation
    INSERT INTO audit_logs (
        user_id, action_type, entity_type, entity_id,
        action_time, changes_made
    )
    VALUES (
        user_id_param, 'GENERATE', 'MONTHLY_REPORT', report_id,
        NOW(), CONCAT('Generated monthly report for ', DATE_FORMAT(report_start_date, '%Y-%m'))
    );
    
    -- Select the report ID to return to the caller
    SELECT report_id;
END//

DELIMITER ;