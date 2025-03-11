UPDATE boards
SET name = ?, description = ?, board_type = ?, created_at = CURRENT_TIMESTAMP
WHERE board_id = ?;
