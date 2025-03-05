INSERT INTO notifications (
  user_id, title, content, notification_type, entity_type, entity_id, link, source_user_id
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?
);
