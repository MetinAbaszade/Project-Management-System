from sqlalchemy.orm import Session

from Db.session import SessionLocal
from Models.Task import Task
from Schemas.TaskSchema import TaskCreate, TaskUpdate
from uuid import UUID

class TaskRepository:
    #def __init__(self, db: Session):
        #self.db = db

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
            return None
        task.IsDeleted = True
        self.db.commit()
        return task
