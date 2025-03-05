INSERT INTO task_attachments (
  task_id, file_url, file_name, file_size, file_type, uploaded_by, description
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?
);
