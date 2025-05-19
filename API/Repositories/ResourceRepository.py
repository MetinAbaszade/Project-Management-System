from sqlalchemy.orm import Session
from fastapi import HTTPException
from decimal import Decimal
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
from Models.Project import Project
from Models.Task import Task

def CreateResource(db: Session, resourceData: ResourceBase):
    available = resourceData.Available if resourceData.Available is not None else resourceData.Total

    newResource = Resource(
        Id=str(uuid.uuid4()),
        Name=resourceData.Name,
        ProjectId = resourceData.ProjectId,
        Type=resourceData.Type,
        Description=resourceData.Description,
        Unit=resourceData.Unit,
        Total=resourceData.Total,
        Available=available,
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


def CreateActivityResource(db: Session, assignmentData: ActivityResourceBase, task: Task, resource: Resource):
    resource.Available -= assignmentData.Quantity
    newAssignment = ActivityResource(
        Id=str(uuid.uuid4()),
        TaskId=assignmentData.TaskId,
        ResourceId=assignmentData.ResourceId,
        Quantity=assignmentData.Quantity,
        EstimatedCost=assignmentData.EstimatedCost,
        AssignedAt=datetime.utcnow()
    )
    db.add(newAssignment)

    AdjustRemainingBudget(db, task.ProjectId, -assignmentData.EstimatedCost)

    db.commit()
    db.refresh(newAssignment)

    return newAssignment

def UpdateActivityResource(db: Session, assignment: ActivityResource, updateData: ActivityResourceUpdate, task: Task, resource: Resource):
    oldQuantity = assignment.Quantity
    newQuantity = updateData.Quantity if updateData.Quantity is not None else oldQuantity

    quantityDelta = newQuantity - oldQuantity
    if quantityDelta > 0:
        if resource.Available is None or resource.Available < quantityDelta:
            raise HTTPException(status_code=400, detail="Not enough available resource quantity.")
        resource.Available -= quantityDelta
    elif quantityDelta < 0:
        resource.Available += abs(quantityDelta)
    
    oldCost = assignment.EstimatedCost
    for field, value in updateData.dict(exclude_unset=True).items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)

    delta = assignment.EstimatedCost - oldCost
    print (oldCost)
    print (assignment.EstimatedCost)
    print (delta)
    AdjustRemainingBudget(db, task.ProjectId, delta)

    return assignment

def SoftDeleteActivityResource(db: Session, assignment: ActivityResource, task: Task, resource: Resource):
    if resource.Available is not None:
        resource.Available += assignment.Quantity

    assignment.IsDeleted = True
    db.commit()

    AdjustRemainingBudget(db, task.ProjectId, assignment.EstimatedCost)

    return assignment

def GetActivityResourceById(db: Session, assignmentId: str):
    return db.query(ActivityResource).filter(ActivityResource.Id == assignmentId, ActivityResource.IsDeleted == False).first()

def GetAllActivityResourcesByTaskId(db: Session, activityId: str):
    return db.query(ActivityResource).filter(ActivityResource.TaskId == activityId, ActivityResource.IsDeleted == False).all()

def AdjustRemainingBudget(db: Session, projectId: str, amountDelta: int):
    project: Project = db.query(Project).filter(Project.Id == projectId, Project.IsDeleted == False).first()
    if not project:
        return
    amountDelta = Decimal(str(amountDelta))

    new_budget = project.RemainingBudget + amountDelta
    if new_budget < 0:
        raise HTTPException(status_code=400, detail="Insufficient remaining budget to complete this operation.")

    project.RemainingBudget = new_budget

    db.commit()

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
