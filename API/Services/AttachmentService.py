from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from Models.Attachment import Attachment, AttachmentEntityType
from Repositories import AttachmentRepository
from Repositories.ProjectRepository import HasProjectAccess
from Schemas.AttachmentSchema import AttachmentCreateSchema


def AddAttachmentService(db: Session, attachmentData: AttachmentCreateSchema, userId: str) -> Attachment:
    hasAccess = HasProjectAccess(db, userId, attachmentData.EntityType, attachmentData.EntityId)
    if not hasAccess:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to add attachments to this item."
        )

    return AttachmentRepository.AddAttachment(db, attachmentData)


def DeleteAttachmentService(db: Session, attachmentId: str, userId: str) -> bool:
    attachment = db.query(Attachment).filter(Attachment.Id == attachmentId).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found."
        )

    hasAccess = HasProjectAccess(db, userId, attachment.EntityType, attachment.EntityId)
    if not hasAccess:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this attachment."
        )

    return AttachmentRepository.SoftDeleteAttachment(db, attachmentId)

def GetAttachmentByIdService(db: Session, attachmentId: str) -> Attachment:
    attachment = AttachmentRepository.GetAttachmentById(db, attachmentId)
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found.")
    return attachment

def GetAttachmentsByEntityService(db: Session, entityType: AttachmentEntityType, entityId: str) -> list[Attachment]:
    return AttachmentRepository.GetAttachmentsByEntity(db, entityType, entityId)

def GetAttachmentsByEntityTypeService(db: Session, entityType: AttachmentEntityType) -> list[Attachment]:
    return AttachmentRepository.GetAttachmentsByEntityType(db, entityType)

