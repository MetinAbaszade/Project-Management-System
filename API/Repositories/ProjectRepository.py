from sqlalchemy.orm import Session
from fastapi import HTTPException
from Schemas.ProjectSchema import ProjectCreate, ProjectMemberCreate
from Models.Project import Project
from Models import ProjectMember
from uuid import UUID
from Models import Task

def CreateProject(db: Session, projectData: ProjectCreate, ownerId: UUID):
    newProject = Project(
        Name=projectData.Name,
        Description=projectData.Description,
        StartDate=projectData.StartDate,
        EndDate=projectData.EndDate,
        Status=projectData.Status,
        Budget=projectData.Budget,
        IsPublic=projectData.IsPublic,
        EstimatedHours=projectData.EstimatedHours,
        OwnerId=ownerId
    )
    db.add(newProject)
    db.commit()
    db.refresh(newProject)
    return newProject

def GetProjectsByUser(db: Session, userId: UUID):
    ownedProjects = db.query(Project).filter(
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


def AddMemberToProject(db: Session, ProjectId: UUID, MemberData: ProjectMemberCreate):
    member = ProjectMember(
        ProjectId=ProjectId,
        UserId=MemberData.UserId,
        RoleInProject=MemberData.RoleInProject,
        MemberType=MemberData.MemberType
    )

    db.add(member)
    db.commit()
    db.refresh(member)
    return member

def SoftDeleteProject(db: Session, projectId: UUID, userId: UUID):
    project: Project = db.query(Project).filter(Project.Id == str(projectId)).first()
    print("Project from DB:", project)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.OwnerId != str(userId):
        raise HTTPException(status_code=403, detail="Unauthorized")

    if project.IsDeleted:
        return {"message": "Project already deleted"}

    project.IsDeleted = True
    db.query(ProjectMember).filter(ProjectMember.ProjectId == str(projectId)).update({"IsDeleted": True})
    # db.query(Task).filter(Task.ProjectId == str(projectId)).update({"IsDeleted": True})
    db.commit()

    return {"message": "Project deleted successfully"}

def SoftDeleteProjectMember(db: Session, projectId: UUID, memberId: UUID):
    member: ProjectMember = db.query(ProjectMember).filter(
        ProjectMember.ProjectId == str(projectId),
        ProjectMember.UserId == str(memberId),
        ProjectMember.IsDeleted == False
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Project member not found")

    member.IsDeleted = True

    db.query(Task).filter(
        Task.ProjectId == str(projectId),
        Task.AssignedTo == str(memberId),
        Task.IsDeleted == False
    ).update({"IsDeleted": True})

    db.commit()
    return {"message": "Project member and related tasks deleted successfully"}