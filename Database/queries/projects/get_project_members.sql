SELECT pm.*, u.first_name, u.last_name, u.email
FROM project_members pm
JOIN users u ON pm.user_id = u.user_id
WHERE pm.project_id = ?;
