UPDATE teams
SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
WHERE team_id = ?;
