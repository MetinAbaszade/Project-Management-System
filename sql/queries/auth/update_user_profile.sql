-- Update user profile information
UPDATE users
SET 
    first_name = ?,
    last_name = ?,
    email = ?,
    image_url = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    user_id = ?;