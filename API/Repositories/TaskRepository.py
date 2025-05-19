from sqlalchemy.orm import Session
from Db.session import SessionLocal
from Models.Task import Task
from Schemas.TaskSchema import TaskCreate, TaskUpdate
from uuid import UUID

class TaskRepository:
    def __init__(self):
        self.db: Session = SessionLocal()

    def Create(self, userId: UUID, taskData: TaskCreate):
        task = Task(**taskData.dict(), CreatedBy=str(userId))
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def GetById(self, taskId: UUID):
        return self.db.query(Task).filter(Task.Id == str(taskId), Task.IsDeleted == False).first()

    def GetAll(self):
        return self.db.query(Task).filter(Task.IsDeleted == False).all()

    def Update(self, taskId: UUID, updateData: TaskUpdate):
        task = self.GetById(taskId)
        if not task:
            return None
        for key, value in updateData.dict(exclude_unset=True).items():
            setattr(task, key, value)
        self.db.commit()
        self.db.refresh(task)
        return task

    def SoftDelete(self, taskId: UUID):
        task = self.GetById(taskId)
        if not task:
            return

        def mark_deleted(t: Task):
            t.IsDeleted = True
            for sub in t.Subtasks:
                if not sub.IsDeleted:
                    mark_deleted(sub)

        mark_deleted(task)
        self.db.commit()

    def GetSubtasks(self, parentTaskId: UUID):
        return self.db.query(Task).filter(
            Task.ParentTaskId == str(parentTaskId),
            Task.IsDeleted == False
        ).all()

    def GetTaskTree(self, rootTaskId: UUID):
        root = self.GetById(rootTaskId)
        if not root:
            return None

        def build_tree(task: Task):
            children = [sub for sub in task.Subtasks if not sub.IsDeleted]
            subtree = [build_tree(sub) for sub in children]

            completed = sum(1 for s in children if s.Completed)
            total = len(children)
            progress = round((completed / total) * 100, 2) if total > 0 else 0

            return {
                "Id": task.Id,
                "Title": task.Title,
                "Description": task.Description,
                "Status": task.Status,
                "StatusColorHex": task.StatusColorHex,
                "Priority": task.Priority,
                "PriorityColorHex": task.PriorityColorHex,
                "Cost": task.Cost,
                "Deadline": task.Deadline,
                "CreatedAt": task.CreatedAt,
                "UpdatedAt": task.UpdatedAt,
                "Completed": task.Completed,
                "IsDeleted": task.IsDeleted,
                "ParentTaskId": task.ParentTaskId,
                "UserId": task.UserId,
                "TeamId": task.TeamId,
                "ProjectId": task.ProjectId,
                "CreatedBy": task.CreatedBy,
                "Progress": progress,
                "SubtaskCount": total,
                "SubtaskCompleted": completed,
                "Subtasks": subtree
            }

        return build_tree(root)
