UPDATE users
SET first_name = ?, last_name = ?, email = ?, last_login = CURRENT_TIMESTAMP
WHERE user_id = ?;
