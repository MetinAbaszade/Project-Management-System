UPDATE users 
SET login_attempts = 0, last_login = NOW() 
WHERE user_id = ?;
