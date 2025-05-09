from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from Dependencies.db import GetDb
from Schemas.AttachmentSchema import AttachmentCreateSchema, AttachmentResponseSchema
from Models.Attachment import AttachmentEntityType
from Services import AttachmentService
from Dependencies.auth import GetCurrentUser

router = APIRouter(prefix="/attachments", tags=["Attachments"])
UPLOAD_DIR = "/home/mabaszada/public_html"

@router.post("/upload", response_model=AttachmentResponseSchema, status_code=status.HTTP_201_CREATED)
def UploadAttachment(
    file: UploadFile = File(...),
    entityType: AttachmentEntityType = Form(...),
    entityId: str = Form(...),
    projectId: str = Form(...),
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.FileUpload(
        db=db,
        file=file,
        entityType=entityType,
        entityId=entityId,
        projectId=projectId,
        currentUser=currentUser.Id
    )

@router.post("/", response_model=AttachmentResponseSchema, status_code=status.HTTP_201_CREATED)
def AddAttachment(
    attachment: AttachmentCreateSchema,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.AddAttachment(db, attachment, currentUser)


@router.delete("/{attachmentId}", status_code=status.HTTP_204_NO_CONTENT)
def DeleteAttachment(
    attachmentId: str,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    success = AttachmentService.DeleteAttachment(db, attachmentId, currentUser.Id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found.")


@router.get("/{attachmentId}", response_model=AttachmentResponseSchema)
def GetAttachmentById(
    attachmentId: str,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.GetAttachmentById(db, attachmentId)


@router.get("/entity/{projectId}/{entityType}/{entityId}", response_model=List[AttachmentResponseSchema])
def GetAttachmentsByEntity(
    projectId: str,
    entityType: AttachmentEntityType,
    entityId: str,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.GetAttachmentsByEntity(db, projectId, entityType, entityId)


@router.get("/type/{projectId}/{entityType}", response_model=List[AttachmentResponseSchema])
def GetAttachmentsByEntityType(
    projectId: str,
    entityType: AttachmentEntityType,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.GetAttachmentsByEntityType(db, projectId, entityType)

@router.get("/download/{attachmentId}")
def DownloadAttachment(
    attachmentId: str,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.DownloadAttachment(db, attachmentId)
