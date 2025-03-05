-- Get audit logs with filtering options
SELECT 
    al.*,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email AS user_email
FROM 
    audit_logs al
LEFT JOIN 
    users u ON al.user_id = u.user_id
WHERE 
    (? IS NULL OR al.user_id = ?) AND -- Filter by user_id
    (? IS NULL OR al.action_type = ?) AND -- Filter by action_type
    (? IS NULL OR al.entity_type = ?) AND -- Filter by entity_type
    (? IS NULL OR al.action_time >= ?) AND -- Filter by start_date
    (? IS NULL OR al.action_time <= ?) -- Filter by end_date
ORDER BY 
    al.action_time DESC
LIMIT ?, ?; -- Pagination: offset, limit