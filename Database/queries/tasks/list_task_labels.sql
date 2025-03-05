SELECT tl.*, l.name, l.color
FROM task_labels tl
JOIN labels l ON tl.label_id = l.label_id
WHERE tl.task_id = ?;
