SELECT tm.*, u.first_name, u.last_name
FROM team_members tm
JOIN users u ON tm.user_id = u.user_id
WHERE tm.team_id = ?;
