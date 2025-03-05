SELECT ur.*, r.role_name, r.is_admin
FROM user_roles ur
JOIN roles r ON ur.role_id = r.role_id
WHERE ur.user_id = ?;
