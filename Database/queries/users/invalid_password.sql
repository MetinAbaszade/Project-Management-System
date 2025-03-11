UPDATE users 
SET login_attempts = login_attempts + 1 
WHERE email = ?;
