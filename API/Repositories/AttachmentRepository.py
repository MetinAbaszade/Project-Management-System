from sqlalchemy.orm import Session
from fastapi import UploadFile

from Models.Attachment import Attachment, AttachmentEntityType
from Schemas.AttachmentSchema import AttachmentCreateSchema
from typing import List, Optional
import paramiko
import os


def AddAttachment(db: Session, attachmentData: AttachmentCreateSchema) -> Attachment:
    newAttachment = Attachment(
        FileName=attachmentData.FileName,
        FileType=attachmentData.FileType,
        FileSize=attachmentData.FileSize,
        FilePath=attachmentData.FilePath,
        EntityType=attachmentData.EntityType,
        EntityId=attachmentData.EntityId,
        OwnerId=attachmentData.OwnerId,
        ProjectId=attachmentData.ProjectId  # ✅ Include this field
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


def GetAttachmentsByEntity(db: Session, projectId: str, entityType: AttachmentEntityType, entityId: str) -> List[Attachment]:
    return db.query(Attachment).filter(
        Attachment.ProjectId == projectId,
        Attachment.EntityType == entityType,
        Attachment.EntityId == entityId,
        Attachment.IsDeleted == False
    ).all()


def GetAttachmentsByEntityType(db: Session, projectId: str, entityType: AttachmentEntityType) -> List[Attachment]:
    return db.query(Attachment).filter(
        Attachment.ProjectId == projectId,
        Attachment.EntityType == entityType,
        Attachment.IsDeleted == False
    ).all()

def UploadToUniServer(localFilePath: str, remoteFileName: str):
    hostname = "clabsql.clamv.constructor.university"
    username = "mabaszada"
    remoteDir = "/home/mabaszada/public_html"
    
    # Optional: use SSH key or password
    password = "YU3TIV" 

    transport = paramiko.Transport((hostname, 22))
    transport.connect(username=username, password=password)

    sftp = paramiko.SFTPClient.from_transport(transport)
    remotePath = os.path.join(remoteDir, remoteFileName)
    
    sftp.put(localFilePath, remotePath)
    
    sftp.close()
    transport.close()

    return remotePath  

def FileUpload(
    db: Session,
    file: UploadFile,
    entityType: AttachmentEntityType,
    entityId: str,
    projectId: str,
    currentUser: str
):
    tempLocalPath = os.path.join("temp_uploads", file.filename)
    os.makedirs("temp_uploads", exist_ok=True)

    with open(tempLocalPath, "wb") as buffer:
        buffer.write(file.file.read())

    # Upload remotely
    remotePath = UploadToUniServer(tempLocalPath, file.filename)

    fileSize = os.path.getsize(tempLocalPath)
    os.remove(tempLocalPath)

    attachmentData = Attachment(
        FileName=file.filename,
        FileType=file.content_type,
        FileSize=fileSize,
        FilePath=remotePath.replace("/home/mabaszada/", "/"),
        EntityType=entityType,
        EntityId=entityId,
        OwnerId=currentUser,
        ProjectId=projectId
    )

    db.add(attachmentData)
    db.commit()
    db.refresh(attachmentData)
    return attachmentData

def DownloadAttachment(attachment: Attachment) -> dict:
    if attachment.FilePath.startswith("http://") or attachment.FilePath.startswith("https://"):
        baseUrl = attachment.FilePath
        return f"{baseUrl}"
    else:
        baseUrl = f"http://clabsql.clamv.constructor.university/~mabaszada/"
        fileName = os.path.basename(attachment.FilePath)
        return f"{baseUrl}/{fileName}"
