from sqlalchemy.orm import Session
from Models.projects import Project
from Schemas.ProjectSchema import ProjectCreate, ProjectMemberCreate
from Models.projects import Project
from Models.project_members import ProjectMember

def CreateProject(db: Session, projectData: ProjectCreate, ownerId: int):
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


def GetProjectsByUser(db: Session, userId: int):
    ownedProjects = db.query(Project).filter(Project.OwnerId == userId)

    memberProjectIds = db.query(ProjectMember.ProjectId).filter(ProjectMember.UserId == userId)
    memberProjects = db.query(Project).filter(Project.Id.in_(memberProjectIds))

    return ownedProjects.union(memberProjects).all()


def AddMemberToProject(db: Session, ProjectId: int, MemberData: ProjectMemberCreate):
    member = ProjectMember(
        projectId=ProjectId,
        userId=MemberData.UserId,
        roleInProject=MemberData.RoleInProject,
        memberType=MemberData.MemberType
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member



