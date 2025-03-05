UPDATE comments
SET content = ?, is_edited = TRUE, updated_at = CURRENT_TIMESTAMP
WHERE comment_id = ?;
