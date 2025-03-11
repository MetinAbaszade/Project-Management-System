UPDATE projects
SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
WHERE project_id = ?;
