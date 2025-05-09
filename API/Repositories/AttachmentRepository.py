from sqlalchemy.orm import Session
from Models.Attachment import Attachment
from Schemas.AttachmentSchema import AttachmentCreateSchema
from Models.Attachment import Attachment, AttachmentEntityType
from typing import List, Optional


def AddAttachment(db: Session, attachmentData: AttachmentCreateSchema) -> Attachment:
    newAttachment = Attachment(
        FileName=attachmentData.FileName,
        FileType=attachmentData.FileType,
        FileSize=attachmentData.FileSize,
        FilePath=attachmentData.FilePath,
        EntityType=attachmentData.EntityType,
        EntityId=attachmentData.EntityId,
        OwnerId=attachmentData.OwnerId,
    )
    db.add(newAttachment)
    db.commit()
    db.refresh(newAttachment)
    return newAttachment


def SoftDeleteAttachment(db: Session, attachmentId: str) -> bool:
    attachment = db.query(Attachment).filter(Attachment.Id == attachmentId).first()
    if not attachment:
        return False

    attachment.IsDeleted = True
    db.commit()
    return True

def GetAttachmentById(db: Session, attachmentId: str) -> Optional[Attachment]:
    return db.query(Attachment).filter(
        Attachment.Id == attachmentId,
        Attachment.IsDeleted == False
    ).first()


def GetAttachmentsByEntity(db: Session, entityType: AttachmentEntityType, entityId: str) -> List[Attachment]:
    return db.query(Attachment).filter(
        Attachment.EntityType == entityType,
        Attachment.EntityId == entityId,
        Attachment.IsDeleted == False
    ).all()



def GetAttachmentsByEntityType(db: Session, entityType: AttachmentEntityType) -> List[Attachment]:
    return db.query(Attachment).filter(
        Attachment.EntityType == entityType,
        Attachment.IsDeleted == False
    ).all()

