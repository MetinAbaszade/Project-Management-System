DELIMITER //

CREATE FUNCTION get_user_permissions(user_id_param INT, project_id_param INT) 
RETURNS VARCHAR(255)
READS SQL DATA
BEGIN
    DECLARE user_role VARCHAR(50);
    DECLARE is_admin BOOLEAN DEFAULT FALSE;
    DECLARE is_project_owner BOOLEAN DEFAULT FALSE;
    DECLARE permissions VARCHAR(255) DEFAULT '';
    
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = user_id_param AND r.is_admin = TRUE
    ) INTO is_admin;
    
    -- Check if user is project owner
    SELECT EXISTS (
        SELECT 1 FROM projects
        WHERE project_id = project_id_param AND owner_id = user_id_param
    ) INTO is_project_owner;
    
    -- Get user's role in the project
    SELECT pm.role_in_project INTO user_role
    FROM project_members pm
    WHERE pm.project_id = project_id_param AND pm.user_id = user_id_param
    LIMIT 1;
    
    -- Set permissions based on role
    IF is_admin THEN
        SET permissions = 'full_access';
    ELSEIF is_project_owner THEN
        SET permissions = 'owner_access';
    ELSEIF user_role = 'Manager' THEN
        SET permissions = 'read,write,assign,delete';
    ELSEIF user_role = 'Developer' THEN
        SET permissions = 'read,write,update_status';
    ELSEIF user_role = 'Viewer' THEN
        SET permissions = 'read';
    ELSE
        SET permissions = 'none';
    END IF;
    
    RETURN permissions;
END//

DELIMITER ;