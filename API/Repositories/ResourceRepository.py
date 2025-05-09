from sqlalchemy.orm import Session
from Models.Resource import Resource
from Models.ActivityResource import ActivityResource
from Models.ResourcePlan import ResourcePlan
from Schemas.ResourceSchema import (
    ResourceBase, ResourceUpdate,
    ActivityResourceBase, ActivityResourceUpdate,
    ResourcePlanBase, ResourcePlanUpdate
)
import uuid
from datetime import datetime

# -----------------------------
# Resource CRUD

def CreateResource(db: Session, resourceData: ResourceBase):
    newResource = Resource(
        Id=str(uuid.uuid4()),
        Name=resourceData.Name,
        Type=resourceData.Type,
        Description=resourceData.Description,
        Unit=resourceData.Unit,
        Total=resourceData.Total,
        Available=resourceData.Available,
        CreatedAt=datetime.utcnow()
    )
    db.add(newResource)
    db.commit()
    db.refresh(newResource)
    return newResource

def UpdateResource(db: Session, resourceId: str, updateData: ResourceUpdate):
    resource = db.query(Resource).filter(Resource.Id == resourceId, Resource.IsDeleted == False).first()
    if not resource:
        return None

    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)
    return resource

def SoftDeleteResource(db: Session, resourceId: str):
    resource = db.query(Resource).filter(Resource.Id == resourceId, Resource.IsDeleted == False).first()
    if not resource:
        return None

    resource.IsDeleted = True
    db.commit()

    # Cascade soft delete ActivityResources
    activities = db.query(ActivityResource).filter(ActivityResource.ResourceId == resourceId, ActivityResource.IsDeleted == False).all()
    for activity in activities:
        activity.IsDeleted = True
    db.commit()

    return resource

def GetResourceById(db: Session, resourceId: str):
    return db.query(Resource).filter(Resource.Id == resourceId, Resource.IsDeleted == False).first()

def GetAllResourcesByProjectId(db: Session, projectId: str):
    return db.query(Resource).filter(
        Resource.ProjectId == projectId,
        Resource.IsDeleted == False
    ).all()


# -----------------------------
# ActivityResource CRUD

def CreateActivityResource(db: Session, assignmentData: ActivityResourceBase):
    newAssignment = ActivityResource(
        Id=str(uuid.uuid4()),
        TaskId=assignmentData.TaskId,
        ResourceId=assignmentData.ResourceId,
        Quantity=assignmentData.Quantity,
        EstimatedCost=assignmentData.EstimatedCost,
        AssignedAt=datetime.utcnow()
    )
    db.add(newAssignment)
    db.commit()
    db.refresh(newAssignment)
    return newAssignment

def UpdateActivityResource(db: Session, assignmentId: str, updateData: ActivityResourceUpdate):
    assignment = db.query(ActivityResource).filter(ActivityResource.Id == assignmentId, ActivityResource.IsDeleted == False).first()
    if not assignment:
        return None

    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)
    return assignment

def SoftDeleteActivityResource(db: Session, assignmentId: str):
    assignment = db.query(ActivityResource).filter(ActivityResource.Id == assignmentId, ActivityResource.IsDeleted == False).first()
    if not assignment:
        return None

    assignment.IsDeleted = True
    db.commit()
    return assignment

def GetActivityResourceById(db: Session, assignmentId: str):
    return db.query(ActivityResource).filter(ActivityResource.Id == assignmentId, ActivityResource.IsDeleted == False).first()

def GetAllActivityResourcesByTaskId(db: Session, activityId: str):
    return db.query(ActivityResource).filter(ActivityResource.TaskId == activityId, ActivityResource.IsDeleted == False).all()

# -----------------------------
# ResourcePlan CRUD

def CreateResourcePlan(db: Session, planData: ResourcePlanBase):
    newPlan = ResourcePlan(
        Id=str(uuid.uuid4()),
        ProjectId=planData.ProjectId,
        OwnerId=planData.OwnerId,
        Notes=planData.Notes,
        CreatedAt=datetime.utcnow()
    )
    db.add(newPlan)
    db.commit()
    db.refresh(newPlan)
    return newPlan

def UpdateResourcePlan(db: Session, planId: str, updateData: ResourcePlanUpdate):
    plan = db.query(ResourcePlan).filter(ResourcePlan.Id == planId, ResourcePlan.IsDeleted == False).first()
    if not plan:
        return None

    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return plan

def SoftDeleteResourcePlan(db: Session, planId: str):
    plan = db.query(ResourcePlan).filter(ResourcePlan.Id == planId, ResourcePlan.IsDeleted == False).first()
    if not plan:
        return None

    plan.IsDeleted = True
    db.commit()
    return plan

def GetResourcePlanById(db: Session, planId: str):
    return db.query(ResourcePlan).filter(ResourcePlan.Id == planId, ResourcePlan.IsDeleted == False).first()

def GetAllResourcePlansByProjectId(db: Session, projectId: str):
    return db.query(ResourcePlan).filter(ResourcePlan.ProjectId == projectId, ResourcePlan.IsDeleted == False).all()
