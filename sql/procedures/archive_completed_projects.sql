-- Procedure to archive completed projects older than a specified period
CREATE PROCEDURE archive_completed_projects(IN days_threshold INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE project_id_var INT;
    DECLARE cur CURSOR FOR 
        SELECT project_id 
        FROM projects 
        WHERE status = 'Completed' 
        AND updated_at < DATE_SUB(CURRENT_DATE(), INTERVAL days_threshold DAY);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Create archive tables if they don't exist
    CREATE TABLE IF NOT