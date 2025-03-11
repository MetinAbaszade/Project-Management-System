INSERT INTO comments (
  task_id, user_id, content, parent_comment_id, mentions
)
VALUES (
  ?, ?, ?, ?, ?
);
