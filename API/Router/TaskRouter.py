from fastapi import APIRouter, Depends
from typing import List, Union
from uuid import UUID
from Schemas.TaskSchema import TaskCreate, TaskUpdate, TaskResponse, TaskTreeResponse
from Services.TaskService import TaskService
from Dependencies.auth import GetCurrentUser
from Models import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse)
def Add(
    myData: TaskCreate,
    currentUser: User = Depends(GetCurrentUser),
    taskService: TaskService = Depends(TaskService)
):
    return taskService.Add(currentUser.Id, myData)

@router.get("/", response_model=List[TaskResponse])
def GetAll(taskService: TaskService = Depends(TaskService)):
    return taskService.GetAll()

@router.get("/{taskId}", response_model=TaskResponse)
def GetById(taskId: UUID, taskService: TaskService = Depends(TaskService)):
    return taskService.GetById(taskId)

@router.put("/{taskId}", response_model=TaskResponse)
def Update(
    taskId: UUID,
    myData: TaskUpdate,
    currentUser: User = Depends(GetCurrentUser),
    taskService: TaskService = Depends(TaskService)
):
    return taskService.Update(taskId, myData, currentUser.Id)

@router.delete("/{taskId}", response_model=dict)
def Remove(
    taskId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    taskService: TaskService = Depends(TaskService)
):
    return taskService.Remove(currentUser.Id, taskId)

@router.get("/{taskId}/subtasks", response_model=List[TaskResponse])
def GetSubtasks(
    taskId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    taskService: TaskService = Depends(TaskService)
):
    return taskService.GetSubtasks(taskId)

@router.get("/{taskId}/tree", response_model=TaskTreeResponse, summary="Get full task tree including all nested subtasks")
def GetTaskTree(
    taskId: UUID,
    currentUser: User = Depends(GetCurrentUser),
    taskService: TaskService = Depends(TaskService)
):
    return taskService.GetTaskTree(taskId)
