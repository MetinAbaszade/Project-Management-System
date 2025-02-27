-- Create a new project
INSERT INTO projects (
    name,
    description,
    start_date,
    end_date,
    status,
    budget,
    owner_id,
    estimated_hours,
    is_public
) VALUES (
    ?, -- name
    ?, -- description
    ?, -- start_date
    ?, -- end_date
    ?, -- status
    ?, -- budget
    ?, -- owner_id
    ?, -- estimated_hours
    ? -- is_public
);

-- Add the owner as a project member automatically
INSERT INTO project_members (
    project_id,
    user_id,
    role_in_project,
    member_type,
    invited_by
) VALUES (
    LAST_INSERT_ID(), -- project_id (from the previous INSERT)
    ?, -- user_id (owner_id)
    'Project Owner', -- role_in_project
    'Owner', -- member_type
    ? -- invited_by (likely the same as owner_id)
);