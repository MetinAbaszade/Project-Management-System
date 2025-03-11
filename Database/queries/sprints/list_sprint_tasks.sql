SELECT st.*, t.title, t.status
FROM sprint_tasks st
JOIN tasks t ON st.task_id = t.task_id
WHERE st.sprint_id = ?;
