SELECT *
FROM time_entries
WHERE task_id = ?
ORDER BY entry_date DESC;
