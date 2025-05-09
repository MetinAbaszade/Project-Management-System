from fastapi import APIRouter, Depends, status
from uuid import UUID

from Models import User
from Services.ResourceService import ResourceService
from Dependencies.auth import GetCurrentUser
from Schemas.ResourceSchema import (
    ResourceBase, ResourceUpdate,
    ActivityResourceBase, ActivityResourceUpdate,
    ResourcePlanBase, ResourcePlanUpdate
)

router = APIRouter(prefix="/resources", tags=["Resources"])


# -----------------------------
# Resource Endpoints

@router.post("/create", status_code=status.HTTP_201_CREATED)
def CreateResource(
    resourceData: ResourceBase,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.CreateResource(currentUser.Id, resourceData)


@router.put("/{resourceId}/update")
def UpdateResource(
    resourceId: str,
    updateData: ResourceUpdate,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.UpdateResource(currentUser.Id, resourceId, updateData)


@router.delete("/{resourceId}/delete", status_code=status.HTTP_200_OK)
def SoftDeleteResource(
    resourceId: str,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.SoftDeleteResource(currentUser.Id, resourceId)


@router.get("/project/{projectId}")
def GetAllResourcesByProject(
    projectId: str,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.GetAllResourcesByProjectId(projectId)


@router.get("/{resourceId}")
def GetResourceById(
    resourceId: str,
    service: ResourceService = Depends(ResourceService)
):
    return service.GetResourceById(resourceId)


# -----------------------------
# ActivityResource Endpoints

@router.post("/assign", status_code=status.HTTP_201_CREATED)
def AssignResourceToTask(
    assignmentData: ActivityResourceBase,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.CreateActivityResource(assignmentData)


@router.put("/assignments/{assignmentId}/update")
def UpdateActivityResource(
    assignmentId: str,
    updateData: ActivityResourceUpdate,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.UpdateActivityResource(assignmentId, updateData)


@router.delete("/assignments/{assignmentId}/delete", status_code=status.HTTP_200_OK)
def SoftDeleteActivityResource(
    assignmentId: str,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.SoftDeleteActivityResource(assignmentId)


@router.get("/assignments/{assignmentId}")
def GetActivityResourceById(
    assignmentId: str,
    service: ResourceService = Depends(ResourceService)
):
    return service.GetActivityResourceById(assignmentId)


@router.get("/task/{taskId}/assignments")
def GetAllResourcesAssignedToTask(
    taskId: str,
    service: ResourceService = Depends(ResourceService)
):
    return service.GetAllActivityResourcesByTaskId(taskId)


# -----------------------------
# ResourcePlan Endpoints
# -----------------------------

@router.post("/plan/create", status_code=status.HTTP_201_CREATED)
def CreateResourcePlan(
    planData: ResourcePlanBase,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.CreateResourcePlan(currentUser.Id, planData)


@router.put("/plan/{planId}/update")
def UpdateResourcePlan(
    planId: str,
    updateData: ResourcePlanUpdate,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.UpdateResourcePlan(currentUser.Id, planId, updateData)


@router.delete("/plan/{planId}/delete", status_code=status.HTTP_200_OK)
def SoftDeleteResourcePlan(
    planId: str,
    currentUser: User = Depends(GetCurrentUser),
    service: ResourceService = Depends(ResourceService)
):
    return service.SoftDeleteResourcePlan(currentUser.Id, planId)


@router.get("/plan/{planId}")
def GetResourcePlanById(
    planId: str,
    service: ResourceService = Depends(ResourceService)
):
    return service.GetResourcePlanById(planId)


@router.get("/project/{projectId}/plans")
def GetAllResourcePlansForProject(
    projectId: str,
    service: ResourceService = Depends(ResourceService)
):
    return service.GetAllResourcePlansByProjectId(projectId)