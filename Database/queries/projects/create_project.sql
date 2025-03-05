INSERT INTO projects (
  name, description, start_date, end_date, status, budget, owner_id, is_public, estimated_hours
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?
);
