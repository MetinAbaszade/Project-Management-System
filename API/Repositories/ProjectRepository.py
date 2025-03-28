from sqlalchemy.orm import Session
from Models.projects import Project
from Schemas.ProjectSchema import ProjectCreate, ProjectMemberCreate
from Models.projects import Project
from Models.project_members import ProjectMember

def create_project(db: Session, project_data: ProjectCreate, owner_id: int):
    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        start_date=project_data.start_date,
        end_date=project_data.end_date,
        status=project_data.status,
        budget=project_data.budget,
        is_public=project_data.is_public,
        estimated_hours=project_data.estimated_hours,
        owner_id=owner_id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


def get_projects_by_user(db: Session, user_id: int):
    # Get owned projects
    owned_projects = db.query(Project).filter(Project.owner_id == user_id)

    # Get member projects
    member_project_ids = db.query(ProjectMember.project_id).filter(ProjectMember.user_id == user_id)
    member_projects = db.query(Project).filter(Project.project_id.in_(member_project_ids))

    # Union both queries
    return owned_projects.union(member_projects).all()


def add_member_to_project(db: Session, project_id: int, member_data: ProjectMemberCreate):
    member = ProjectMember(
        project_id=project_id,
        user_id=member_data.user_id,
        role_in_project=member_data.role_in_project,
        member_type=member_data.member_type
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member



