SELECT pt.*, t.name
FROM project_teams pt
JOIN teams t ON pt.team_id = t.team_id
WHERE pt.project_id = ?;
