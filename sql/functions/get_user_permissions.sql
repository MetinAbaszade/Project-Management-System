-- Function to get a user's permissions for a specific project
CREATE FUNCTION get_user_permissions(user_id_param INT, project_id_param INT)
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE is_project_owner BOOLEAN;
    DECLARE is_system_admin BOOLEAN;
    DECLARE member_type VARCHAR(20);
    DECLARE role_in_project VARCHAR(50);
    DECLARE permissions JSON;
    
    -- Check if user is project owner
    SELECT (owner_id = user_id_param) INTO is_project_owner
    FROM projects
    WHERE project_id = project_id_param;
    
    -- Check if user is system admin
    SELECT MAX(r.is_admin) INTO is_system_admin
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = user_id_param;
    
    -- Get project member info
    SELECT pm.member_type, pm.role_in_project INTO member_type, role_in_project
    FROM project_members pm
    WHERE pm.project_id = project_id_param AND pm.user_id = user_id_param;
    
    -- Build permissions JSON
    SET permissions = JSON_OBJECT(
        'view_project', TRUE,
        'edit_project', (is_project_owner OR is_system_admin OR member_type = 'Owner'),
        'delete_project', (is_project_owner OR is_system_admin),
        'manage_members', (is_project_owner OR is_system_admin OR member_type = 'Owner'),
        'create_tasks', (is_project_owner OR is_system_admin OR member_type IS NOT NULL),
        'edit_all_tasks', (is_project_owner OR is_system_admin OR member_type = 'Owner'),
        'edit_own_tasks', TRUE,
        'delete_tasks', (is_project_owner OR is_system_admin OR member_type = 'Owner'),
        'manage_sprints', (is_project_owner OR is_system_admin OR member_type = 'Owner'),
        'track_time', (is_project_owner OR is_system_admin OR member_type IS NOT NULL),
        'view_reports', (is_project_owner OR is_system_admin OR member_type IS NOT NULL),
        'manage_boards', (is_project_owner OR is_system_admin OR member_type = 'Owner'),
        'user_role', IFNULL(role_in_project, 'none'),
        'user_type', IFNULL(member_type, 'none'),
        'is_admin', is_system_admin
    );
    
    RETURN permissions;
END;