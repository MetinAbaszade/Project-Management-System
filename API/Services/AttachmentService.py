from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from Models.Attachment import Attachment, AttachmentEntityType
from Repositories import AttachmentRepository
from Repositories.ProjectRepository import HasProjectAccess
from Schemas.AttachmentSchema import AttachmentCreateSchema


def AddAttachment(db: Session, attachmentData: AttachmentCreateSchema, userId: str) -> Attachment:
    hasAccess = HasProjectAccess(db, attachmentData.ProjectId, userId)
    if not hasAccess:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to add attachments to this item."
        )

    return AttachmentRepository.AddAttachment(db, attachmentData)


def DeleteAttachment(db: Session, attachmentId: str, userId: str) -> bool:
    attachment: Attachment = db.query(Attachment).filter(Attachment.Id == attachmentId).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found."
        )

    hasAccess = HasProjectAccess(db, attachment.ProjectId, userId)

    if not hasAccess:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this attachment."
        )

    return AttachmentRepository.SoftDeleteAttachment(db, attachmentId)

def GetAttachmentById(db: Session, attachmentId: str) -> Attachment:
    attachment = AttachmentRepository.GetAttachmentById(db, attachmentId)
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found.")
    return attachment

def GetAttachmentsByEntity(db: Session, projectId:str, entityType: AttachmentEntityType, entityId: str) -> list[Attachment]:
    return AttachmentRepository.GetAttachmentsByEntity(db, projectId, entityType, entityId)

def GetAttachmentsByEntityType(db: Session, projectId:str, entityType: AttachmentEntityType) -> list[Attachment]:
    return AttachmentRepository.GetAttachmentsByEntityType(db, projectId, entityType)

def FileUpload(
    db: Session,
    file: UploadFile,
    entityType: AttachmentEntityType,
    entityId: str,
    projectId: str,
    currentUser: str
):
    if not HasProjectAccess(db, projectId, currentUser):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this project.")

    return AttachmentRepository.FileUpload(
        db=db,
        file=file,
        entityType=entityType,
        entityId=entityId,
        projectId=projectId,
        currentUser=currentUser
    )

def DownloadAttachment(db: Session, attachmentId: str):
    attachment = AttachmentRepository.GetAttachmentById(db, attachmentId)
    if not attachment or attachment.IsDeleted:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    url = AttachmentRepository.DownloadAttachment(attachment)
    return {"download_url": url}

