SELECT p.*
FROM projects p
WHERE p.owner_id = ?
UNION
SELECT p.*
FROM projects p
JOIN project_members pm ON p.project_id = pm.project_id
WHERE pm.user_id = ?;
