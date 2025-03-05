DELIMITER //

DROP TRIGGER IF EXISTS trg_projects_audit_update;
-- Trigger to log changes in the projects table after an update.
CREATE TRIGGER trg_projects_audit_update
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
      user_id,
      action_type,
      entity_type,
      entity_id,
      action_time,
      ip_address,
      request_method,
      changes_made
    )
    VALUES (
      NEW.owner_id,
      'UPDATE',
      'projects',
      NEW.project_id,
      CURRENT_TIMESTAMP,
      '0.0.0.0',  -- Replace with actual IP 
      CONCAT('Old Name: ', OLD.name, '; New Name: ', NEW.name)
    );
END;
//

DROP TRIGGER IF EXISTS trg_tasks_before_update;
-- Trigger to automatically update the "updated_at" column on tasks.
CREATE TRIGGER trg_tasks_before_update
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END;
//

DELIMITER ;
