-- Add a new member to a project
INSERT INTO project_members (
    project_id,
    user_id,
    role_in_project,
    member_type,
    hourly_rate,
    invited_by
) VALUES (
    ?, -- project_id
    ?, -- user_id
    ?, -- role_in_project
    'Collaborator', -- member_type
    ?, -- hourly_rate
    ? -- invited_by
);