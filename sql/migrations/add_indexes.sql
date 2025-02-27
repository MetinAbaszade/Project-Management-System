-- Add performance indexes to frequently queried columns

-- User related indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Project related indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Task related indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);

-- Time entries optimization
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, entry_date);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);

-- Audit logs optimization
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_time ON audit_logs(action_time);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Settings optimization
CREATE INDEX idx_admin_settings_category ON admin_settings(category);

-- Sprint optimization
CREATE INDEX idx_sprints_project_status ON sprints(project_id, status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);