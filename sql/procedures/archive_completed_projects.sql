DELIMITER //

CREATE PROCEDURE archive_completed_projects(
    IN older_than_days INT,
    OUT archived_count INT
)
BEGIN
    DECLARE cutoff_date DATE;
    
    -- Set the cutoff date
    SET cutoff_date = DATE_SUB(CURRENT_DATE, INTERVAL older_than_days DAY);
    
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS archived_projects (
        project_id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(20),
        budget DECIMAL(15, 2),
        budget_used DECIMAL(15, 2),
        owner_id INT,
        completion_percentage FLOAT,
        archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        original_created_at DATETIME,
        project_data JSON
    );
    
    -- Insert completed projects to archive
    INSERT INTO archived_projects (
        project_id, name, description, start_date, end_date,
        status, budget, budget_used, owner_id, completion_percentage,
        original_created_at, project_data
    )
    SELECT 
        p.project_id, p.name, p.description, p.start_date, p.end_date,
        p.status, p.budget, p.budget_used, p.owner_id, p.completion_percentage,
        p.created_at,
        JSON_OBJECT(
            'estimated_hours', p.estimated_hours,
            'actual_hours', p.actual_hours,
            'is_public', p.is_public,
            'owner', CONCAT(u.first_name, ' ', u.last_name)
        ) AS project_data
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.user_id
    WHERE p.status = 'Completed'
    AND p.updated_at < cutoff_date
    AND NOT EXISTS (
        SELECT 1 FROM archived_projects 
        WHERE project_id = p.project_id
    );
    
    -- Get count of archived projects
    SET archived_count = ROW_COUNT();
    
    -- Log the archiving action
    IF archived_count > 0 THEN
        INSERT INTO audit_logs (
            user_id, action_type, entity_type, 
            action_time, changes_made
        )
        VALUES (
            NULL, 'ARCHIVE', 'PROJECT', 
            NOW(), CONCAT('Archived ', archived_count, ' completed projects older than ', older_than_days, ' days')
        );
    END IF;
END//

DELIMITER ;