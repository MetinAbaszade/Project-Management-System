from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from Dependencies.db import GetDb
from Repositories import ResourceRepository, ProjectRepository
from Schemas.ResourceSchema import (
    ResourceBase, ResourceUpdate,
    ActivityResourceBase, ActivityResourceUpdate,
    ResourcePlanBase, ResourcePlanUpdate
)
from Models.Resource import Resource
from Models.ResourcePlan import ResourcePlan
from Models.ActivityResource import ActivityResource


class ResourceService:
    def __init__(self, db: Session = Depends(GetDb)):
        self.db = db

    # -----------------------------
    # Resource

    def CreateResource(self, userId: UUID, resourceData: ResourceBase):
        if not ProjectRepository.HasProjectAccess(self.db, resourceData.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not allowed to add resources to this project.")
        return ResourceRepository.CreateResource(self.db, resourceData)

    def UpdateResource(self, userId: UUID, resourceId: str, updateData: ResourceUpdate):
        resource = ResourceRepository.GetResourceById(self.db, resourceId)
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")

        if not ProjectRepository.HasProjectAccess(self.db, resource.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not allowed to modify this resource.")

        return ResourceRepository.UpdateResource(self.db, resourceId, updateData)

    def SoftDeleteResource(self, userId: UUID, resourceId: str):
        resource = ResourceRepository.GetResourceById(self.db, resourceId)
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")

        if not ProjectRepository.HasProjectAccess(self.db, resource.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not allowed to delete this resource.")

        return ResourceRepository.SoftDeleteResource(self.db, resourceId)

    def GetAllResourcesByProjectId(self, projectId: str):
        return ResourceRepository.GetAllResourcesByProjectId(self.db, projectId)

    def GetResourceById(self, resourceId: str):
        resource = ResourceRepository.GetResourceById(self.db, resourceId)
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        return resource

    # -----------------------------
    # ActivityResource

    def CreateActivityResource(self, assignmentData: ActivityResourceBase):
        return ResourceRepository.CreateActivityResource(self.db, assignmentData)

    def UpdateActivityResource(self, assignmentId: str, updateData: ActivityResourceUpdate):
        return ResourceRepository.UpdateActivityResource(self.db, assignmentId, updateData)

    def SoftDeleteActivityResource(self, assignmentId: str):
        return ResourceRepository.SoftDeleteActivityResource(self.db, assignmentId)

    def GetActivityResourceById(self, assignmentId: str):
        return ResourceRepository.GetActivityResourceById(self.db, assignmentId)

    def GetAllActivityResourcesByTaskId(self, taskId: str):
        return ResourceRepository.GetAllActivityResourcesByTaskId(self.db, taskId)

    # -----------------------------
    # ResourcePlan

    def CreateResourcePlan(self, userId: UUID, planData: ResourcePlanBase):
        if not ProjectRepository.HasProjectAccess(self.db, planData.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not allowed to create a resource plan for this project.")
        return ResourceRepository.CreateResourcePlan(self.db, planData)

    def UpdateResourcePlan(self, userId: UUID, planId: str, updateData: ResourcePlanUpdate):
        plan = ResourceRepository.GetResourcePlanById(self.db, planId)
        if not plan:
            raise HTTPException(status_code=404, detail="Resource plan not found")

        if not ProjectRepository.HasProjectAccess(self.db, plan.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not allowed to update this resource plan.")

        return ResourceRepository.UpdateResourcePlan(self.db, planId, updateData)

    def SoftDeleteResourcePlan(self, userId: UUID, planId: str):
        plan = ResourceRepository.GetResourcePlanById(self.db, planId)
        if not plan:
            raise HTTPException(status_code=404, detail="Resource plan not found")

        if not ProjectRepository.HasProjectAccess(self.db, plan.ProjectId, str(userId)):
            raise HTTPException(status_code=403, detail="You are not allowed to delete this resource plan.")

        return ResourceRepository.SoftDeleteResourcePlan(self.db, planId)

    def GetResourcePlanById(self, planId: str):
        return ResourceRepository.GetResourcePlanById(self.db, planId)

    def GetAllResourcePlansByProjectId(self, projectId: str):
        return ResourceRepository.GetAllResourcePlansByProjectId(self.db, projectId)
