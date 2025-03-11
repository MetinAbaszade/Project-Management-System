INSERT INTO project_members (
  project_id, user_id, role_in_project, member_type, total_hours_worked, hourly_rate, joined_at, invited_by
)
VALUES (
  ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?
);
