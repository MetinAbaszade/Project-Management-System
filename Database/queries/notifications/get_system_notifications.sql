SELECT *
FROM system_notifications
WHERE start_date <= CURRENT_TIMESTAMP
  AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP);
