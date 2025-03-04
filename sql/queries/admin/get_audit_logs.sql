-- File: queries/admin/get_audit_logs.sql

-- Get all audit logs with pagination and filtering options
SELECT 
    al.log_id,
    al.action_time,
    al.action_type,
    al.entity_type,
    al.entity_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.user_id,
    al.ip_address,
    al.request_method,
    al.request_path,
    al.changes_made,
    al.status_code
FROM 
    audit_logs al
LEFT JOIN 
    users u ON al.user_id = u.user_id
WHERE 
    (COALESCE(:action_type, '') = '' OR al.action_type = :action_type)
    AND (COALESCE(:entity_type, '') = '' OR al.entity_type = :entity_type)
    AND (COALESCE(:entity_id, 0) = 0 OR al.entity_id = :entity_id)
    AND (COALESCE(:user_id, 0) = 0 OR al.user_id = :user_id)
    AND (
        COALESCE(:date_from, '') = '' 
        OR DATE(al.action_time) >= STR_TO_DATE(:date_from, '%Y-%m-%d')
    )
    AND (
        COALESCE(:date_to, '') = '' 
        OR DATE(al.action_time) <= STR_TO_DATE(:date_to, '%Y-%m-%d')
    )
    AND (
        COALESCE(:search_term, '') = ''
        OR al.changes_made LIKE CONCAT('%', :search_term, '%')
        OR al.request_path LIKE CONCAT('%', :search_term, '%')
        OR CONCAT(u.first_name, ' ', u.last_name) LIKE CONCAT('%', :search_term, '%')
    )
ORDER BY 
    CASE 
        WHEN LOWER(:sort_direction) = 'asc' THEN
            CASE 
                WHEN :sort_field = 'action_time' THEN al.action_time
                WHEN :sort_field = 'user_name' THEN CONCAT(u.first_name, ' ', u.last_name)
                WHEN :sort_field = 'action_type' THEN al.action_type
                WHEN :sort_field = 'entity_type' THEN al.entity_type
            END
    END ASC,
    CASE 
        WHEN LOWER(:sort_direction) = 'desc' OR :sort_direction IS NULL THEN
            CASE 
                WHEN :sort_field = 'action_time' OR :sort_field IS NULL THEN al.action_time
                WHEN :sort_field = 'user_name' THEN CONCAT(u.first_name, ' ', u.last_name)
                WHEN :sort_field = 'action_type' THEN al.action_type
                WHEN :sort_field = 'entity_type' THEN al.entity_type
            END
    END DESC
LIMIT :limit OFFSET :offset;

-- Get total count for pagination
SELECT 
    COUNT(*) AS total_count
FROM 
    audit_logs al
LEFT JOIN 
    users u ON al.user_id = u.user_id
WHERE 
    (COALESCE(:action_type, '') = '' OR al.action_type = :action_type)
    AND (COALESCE(:entity_type, '') = '' OR al.entity_type = :entity_type)
    AND (COALESCE(:entity_id, 0) = 0 OR al.entity_id = :entity_id)
    AND (COALESCE(:user_id, 0) = 0 OR al.user_id = :user_id)
    AND (
        COALESCE(:date_from, '') = '' 
        OR DATE(al.action_time) >= STR_TO_DATE(:date_from, '%Y-%m-%d')
    )
    AND (
        COALESCE(:date_to, '') = '' 
        OR DATE(al.action_time) <= STR_TO_DATE(:date_to, '%Y-%m-%d')
    )
    AND (
        COALESCE(:search_term, '') = ''
        OR al.changes_made LIKE CONCAT('%', :search_term, '%')
        OR al.request_path LIKE CONCAT('%', :search_term, '%')
        OR CONCAT(u.first_name, ' ', u.last_name) LIKE CONCAT('%', :search_term, '%')
    );