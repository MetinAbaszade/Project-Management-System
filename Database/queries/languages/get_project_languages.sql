SELECT pl.*, l.language_name, l.language_code
FROM project_languages pl
JOIN languages l ON pl.language_id = l.language_id
WHERE pl.project_id = ?;
