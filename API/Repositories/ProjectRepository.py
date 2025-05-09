from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException
from Schemas.ProjectSchema import ProjectCreate
from Models import Project, User, Team, TeamMember, ProjectStakeholder, ProjectScope
from Models.ProjectMember import ProjectMember
from uuid import UUID
from Models.Task import Task

def CreateProject(db: Session, projectData: ProjectCreate, ownerId: UUID):
    newProject = Project(
        Name=projectData.Name,
        Description=projectData.Description,
        Deadline=projectData.Deadline,
        TotalBudget=projectData.Budget,
        OwnerId=ownerId
    )
    db.add(newProject)
    db.commit()
    db.refresh(newProject)
    return newProject

def GetProjectById(db: Session, projectId: UUID) -> Optional[Project]:
    project = db.query(Project).filter(Project.Id == str(projectId), Project.IsDeleted == False).first()
    return project

def GetProjectsByUser(db: Session, userId: UUID):
    ownedProjects= db.query(Project).filter(
        Project.OwnerId == userId,
        Project.IsDeleted == False
    )

    memberProjectIds = db.query(ProjectMember.ProjectId).filter(
        ProjectMember.UserId == userId,
        ProjectMember.IsDeleted == False 
    )

    memberProjects = db.query(Project).filter(
        Project.Id.in_(memberProjectIds),
        Project.IsDeleted == False
    )

    return ownedProjects.union(memberProjects).all()

def AddMemberToProject(db: Session, projectId: UUID, memberId: UUID):
    member = ProjectMember(
        ProjectId=projectId,
        UserId=memberId,
    )

    db.add(member)
    db.commit()
    db.refresh(member)
    return member

def SoftDeleteProject(db: Session, projectId: UUID, userId: UUID):
    # Step 1: Soft delete the project itself
    db.query(Project).filter(Project.Id == str(projectId)).update(
        {"IsDeleted": True}, synchronize_session=False
    )

    # Step 2: Soft delete project members
    db.query(ProjectMember).filter(
        ProjectMember.ProjectId == str(projectId)
    ).update({"IsDeleted": True}, synchronize_session=False)

    # Step 3: Get all team IDs for this project
    team_ids = db.query(Team.Id).filter(
        Team.ProjectId == str(projectId)
    ).all()
    team_ids = [tid[0] for tid in team_ids]

    # Step 4: Soft delete teams
    db.query(Team).filter(
        Team.ProjectId == str(projectId)
    ).update({"IsDeleted": True}, synchronize_session=False)

    # Step 5: Soft delete team members
    if team_ids:
        db.query(TeamMember).filter(
            TeamMember.TeamId.in_(team_ids)
        ).update({"IsActive": False}, synchronize_session=False)

    # Step 6: Soft delete tasks under this project
    db.query(Task).filter(
        Task.ProjectId == str(projectId)
    ).update({"IsDeleted": True}, synchronize_session=False)

    # Step 7: Soft delete stakeholders
    db.query(ProjectStakeholder).filter(
        ProjectStakeholder.ProjectId == str(projectId)
    ).update({"IsDeleted": True}, synchronize_session=False)

    # Step 8: Soft delete scope
    db.query(ProjectScope).filter(
        ProjectScope.ProjectId == str(projectId)
    ).update({"IsDeleted": True}, synchronize_session=False)

    db.commit()
    return {"message": "Project and all related data soft-deleted successfully"}

def SoftDeleteProjectMember(db: Session, projectId: UUID, memberId: UUID):
    # Step 1: Soft-delete from ProjectMember
    project_member = db.query(ProjectMember).filter(
        ProjectMember.ProjectId == str(projectId),
        ProjectMember.UserId == str(memberId),
        ProjectMember.IsDeleted == False
    ).first()

    if not project_member:
        raise HTTPException(status_code=404, detail="Project member not found")

    project_member.IsDeleted = True

    # Step 2: Get all non-deleted teams of this project
    team_ids = db.query(Team.Id).filter(
        Team.ProjectId == str(projectId),
        Team.IsDeleted == False
    ).all()
    team_ids = [tid[0] for tid in team_ids]

    # Step 3: Soft-delete matching TeamMember records
    if team_ids:
        db.query(TeamMember).filter(
            TeamMember.TeamId.in_(team_ids),
            TeamMember.UserId == str(memberId),
            TeamMember.IsActive == True
        ).update({"IsActive": False}, synchronize_session=False)

    # Step 4: Soft-delete all tasks assigned to this user in the project
    db.query(Task).filter(
        Task.ProjectId == str(projectId),
        Task.AssignedTo == str(memberId),
        Task.IsDeleted == False
    ).update({"IsDeleted": True}, synchronize_session=False)

    db.commit()

    return {"message": "Project member, their tasks, and any team memberships soft-deleted successfully"}

def GetProjectOwner(db: Session, projectId: UUID):
    project = db.query(Project).filter(Project.Id == str(projectId), Project.IsDeleted == False).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    owner = db.query(User).filter(User.Id == project.OwnerId).first()

    if not owner:
        raise HTTPException(status_code=404, detail="Project owner not found")

    return owner

def IsProjectOwner(db: Session, userId: str, projectId: str) -> bool:
    # print("TYPE projectId:", type(projectId))
    # print("VALUE projectId:", projectId)
    project = db.query(Project).filter(Project.Id == str(projectId), Project.IsDeleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return str(project.OwnerId) == str(userId)

def IsProjectMember(db: Session, userId: str, projectId: str) -> bool:
    # print("TYPE projectId:", type(projectId))
    # print("VALUE projectId:", projectId)
    project = db.query(Project).filter(Project.Id == str(projectId), Project.IsDeleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    member = db.query(ProjectMember).filter(
        ProjectMember.ProjectId == str(projectId),
        ProjectMember.UserId == str(userId),
        ProjectMember.IsDeleted == False
    ).first()
    return member is not None

def HasProjectAccess(db: Session, projectId: str, userId: str) -> bool:
    return (
        IsProjectMember(db, userId, projectId) or
        IsProjectOwner(db, userId, projectId)
    )


def GetProjectMembers(db: Session, projectId: UUID):
    project = db.query(Project).filter(
        Project.Id == str(projectId),
        Project.IsDeleted == False
    ).first()

    return [member for member in project.Members if not member.IsDeleted]

def GetProjectTeams(db: Session, projectId: UUID):
    project = db.query(Project).filter(
        Project.Id == str(projectId),
        Project.IsDeleted == False
    ).first()

    return [team for team in project.Teams if not team.IsDeleted]

def GetTasks(db: Session, projectId: UUID):
    project = GetProjectById(db, projectId)
    return [task for task in project.Tasks if not task.IsDeleted]




