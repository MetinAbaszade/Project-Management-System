from typing import Optional

from fastapi import HTTPException, Depends
from uuid import UUID
from sqlalchemy.orm import Session

from Dependencies.db import GetDb
from Models import Task
from Schemas.TaskSchema import TaskCreate, TaskUpdate
from Repositories.TaskRepository import TaskRepository
from Services.TeamService import TeamService
from Services.UserService import UserService
from Services.ProjectService import ProjectService

class TaskService:
    def __init__(self,
                 db: Session = Depends(GetDb),
                 projectService: ProjectService = Depends(ProjectService),
                 userService: UserService = Depends(UserService),
                 teamService: TeamService = Depends(TeamService),
                 taskRepository: TaskRepository = Depends(TaskRepository)):
        self.db = db
        self.repo = taskRepository
        self.userService = userService
        self.projectService = projectService
        self.teamService = teamService

    def Add(self, userId: UUID, taskData: TaskCreate) -> Optional[Task]:
        # Check if project exists
        project = self.projectService.GetProjectById(taskData.ProjectId)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check if current user is the creator of the project
        if str(project.OwnerId) != str(userId):
            raise HTTPException(status_code=403, detail="Only the project owner can create tasks")

        if taskData.TeamId:
            # Check if team exists
            team = self.teamService.GetTeamById(taskData.TeamId)
            if not team:
                raise HTTPException(status_code=404, detail="Assigned team not found")

        elif taskData.UserId:
            if str(taskData.UserId) == str(userId):
                raise HTTPException(status_code=400, detail="You cannot assign a task to yourself")

            if not self.userService.GetUserById(taskData.UserId):
                raise HTTPException(status_code=404, detail="Assigned user not found")

            if not self.projectService.IsProjectMember(taskData.UserId, taskData.ProjectId):
                raise HTTPException(status_code=403, detail="Assigned user is not a member of the project")

        newTask = self.repo.Create(userId, taskData)
        return newTask

    def GetById(self, taskId: UUID):
        task = self.repo.GetById(taskId)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    def GetAll(self):
        return self.repo.GetAll()

    def Update(self, taskId: UUID, updateData: TaskUpdate, currentUserId: UUID):
        task = self.repo.GetById(taskId)
        print("Mayu")
        print(taskId)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if str(task.CreatedBy) != str(currentUserId):
            raise HTTPException(status_code=403, detail="Only the task creator can update this task")

        return self.repo.Update(taskId, updateData)

    def Remove(self, userId: UUID, taskId: UUID):
        task = self.repo.GetById(taskId)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if str(task.CreatedBy) != str(userId):
            raise HTTPException(status_code=403, detail="Only the task creator can delete this task")

        self.repo.SoftDelete(taskId)
        return {"message": "Task deleted successfully"}
