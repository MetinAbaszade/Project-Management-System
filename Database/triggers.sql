DELIMITER //

DROP TRIGGER IF EXISTS trg_projects_audit_update;
-- Trigger to log changes in the Projects table after an update.
CREATE TRIGGER trg_projects_audit_update
AFTER UPDATE ON Projects
FOR EACH ROW
BEGIN
    INSERT INTO AuditLogs (
      UserId,
      ActionType,
      EntityType,
      EntityId,
      ActionTime,
      IpAddress,
      RequestMethod,
      ChangesMade
    )
    VALUES (
      NEW.OwnerId,
      'UPDATE',
      'Projects',
      NEW.Id,
      CURRENT_TIMESTAMP,
      '0.0.0.0',  -- Replace with actual IP if available
      CONCAT('Old Name: ', OLD.Name, '; New Name: ', NEW.Name)
    );
END;
//

DROP TRIGGER IF EXISTS trg_tasks_before_update;
-- Trigger to automatically update the UpdatedAt column on Tasks.
CREATE TRIGGER trg_tasks_before_update
BEFORE UPDATE ON Tasks
FOR EACH ROW
BEGIN
    SET NEW.UpdatedAt = CURRENT_TIMESTAMP;
END;
//

DELIMITER ;
