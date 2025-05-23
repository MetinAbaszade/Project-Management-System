from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException
from Schemas.ProjectSchema import ProjectCreate, ProjectUpdate
from Models import Project, User, Team, TeamMember, Attachment, ProjectStakeholder
from Models.ProjectMember import ProjectMember
from uuid import UUID
from Models.Resource import Resource
from Models.Task import Task
from Models.Risk import Risk
from Repositories import RiskRepository
from Repositories import ResourceRepository
from Repositories.ProjectScopeRepository import ProjectScopeRepository
from Repositories.StakeholderRepository import StakeholderRepository


def CreateProject(db: Session, projectData: ProjectCreate, ownerId: UUID):
    newProject = Project(
        Name=projectData.Name,
        Description=projectData.Description,
        Deadline=projectData.Deadline,
        TotalBudget=projectData.TotalBudget,
        OwnerId=ownerId
    )
    db.add(newProject)
    db.commit()
    db.refresh(newProject)
    return newProject

def UpdateProject(db: Session, project: Project, updateData: ProjectUpdate):
    oldTotal = Decimal(str(project.TotalBudget or 0))
    oldRemaining = Decimal(str(project.RemainingBudget or 0))
    usedAmount = abs(oldTotal- abs(oldRemaining))

    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(project, field, value)

    if "TotalBudget" in updateData.dict(exclude_unset=True):
        newTotal = Decimal(str(project.TotalBudget))
        newRemaining = newTotal - usedAmount

        if newRemaining < 0:
            raise HTTPException(status_code=400, detail="New budget is lower than amount already used.")
        
        project.RemainingBudget = newRemaining

    db.commit()
    db.refresh(project)
    return project

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

def SoftDeleteProject(db: Session, userId: UUID, project: Project):
    project.IsDeleted = True

    members = db.query(ProjectMember).filter(
        ProjectMember.ProjectId == str(project.Id),
        ProjectMember.IsDeleted == False
    ).all()
    for member in members:
        SoftDeleteProjectMember(db, project.Id, member.UserId)

    try:
        scopeRepo = ProjectScopeRepository(db)
        scopeRepo.SoftDeleteScope(project.Id)
    except HTTPException:
        pass

    resource_ids = db.query(Resource.Id).filter(
        Resource.ProjectId == str(project.Id),
        Resource.IsDeleted == False
    ).all()

    for rid in resource_ids:
        try:
            ResourceRepository.SoftDeleteResource(db, rid[0])
        except HTTPException:
            pass

    risk_ids = db.query(Risk.Id).filter(
        Risk.ProjectId == str(project.Id),
        Risk.IsDeleted == False
    ).all()

    for rid in risk_ids:
        try:
            RiskRepository.SoftDeleteRisk(db, rid[0])
        except HTTPException:
            pass

    stakeholderRepo = StakeholderRepository(db)
    stakeholders = db.query(ProjectStakeholder).filter(
        ProjectStakeholder.ProjectId == str(project.Id)
    ).all()
    for stakeholder in stakeholders:
        stakeholderRepo.Delete(stakeholder.Id)

    db.query(Attachment).filter(
        Attachment.ProjectId == str(project.Id),
        Attachment.EntityType != "User"
    ).update({"IsDeleted": True}, synchronize_session=False)

    db.commit()

    return {"message": "Project and all related data soft-deleted successfully"}

def SoftDeleteProjectMember(db: Session, projectId: UUID, memberId: UUID):
    project_member = db.query(ProjectMember).filter(
        ProjectMember.ProjectId == str(projectId),
        ProjectMember.UserId == str(memberId),
        ProjectMember.IsDeleted == False
    ).first()

    if not project_member:
        raise HTTPException(status_code=404, detail="Project member not found")

    project_member.IsDeleted = True

    team_ids = db.query(Team.Id).filter(
        Team.ProjectId == str(projectId),
        Team.IsDeleted == False
    ).all()
    team_ids = [tid[0] for tid in team_ids]

    if team_ids:
        db.query(TeamMember).filter(
            TeamMember.TeamId.in_(team_ids),
            TeamMember.UserId == str(memberId),
            TeamMember.IsActive == True
        ).update({"IsActive": False}, synchronize_session=False)

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
    project = db.query(Project).filter(Project.Id == str(projectId), Project.IsDeleted == False).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return str(project.OwnerId) == str(userId)

def IsProjectMember(db: Session, userId: str, projectId: str) -> bool:
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


def UpdateProject(db: Session, projectId: UUID, projectData: dict):
    project = db.query(Project).filter(Project.Id == str(projectId), Project.IsDeleted == False).first()
    
    if not project:
        return None

    if "Budget" in projectData:
        project.TotalBudget = projectData.pop("Budget")

    for key, value in projectData.items():
        if hasattr(project, key):
            setattr(project, key, value)
    
    project.UpdatedAt = datetime.now()
    db.commit()
    db.refresh(project)
    return project

