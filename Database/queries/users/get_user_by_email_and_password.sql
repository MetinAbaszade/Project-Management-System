SELECT user_id, first_name, last_name, email, image_url, is_active 
FROM users 
WHERE email = ? AND password = ?;
