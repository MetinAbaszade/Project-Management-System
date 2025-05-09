from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
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
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    fileLocation = os.path.join(UPLOAD_DIR, file.filename)

    # Save file to server
    with open(fileLocation, "wb") as buffer:
        buffer.write(file.file.read())

    # Now merge uploaded file info into AttachmentCreateSchema
    attachment = AttachmentCreateSchema(
        FileName=file.filename,
        FileType=file.content_type,
        FileSize=None,  # add size later with os.path.getsize(fileLocation)
        FilePath=f"/public_html/{file.filename}",
        EntityType=entityType,
        EntityId=entityId,
        OwnerId=currentUser
    )

    return AttachmentService.AddAttachmentService(db, attachment, currentUser)


@router.post("/", response_model=AttachmentResponseSchema, status_code=status.HTTP_201_CREATED)
def AddAttachment(
    attachment: AttachmentCreateSchema,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.AddAttachmentService(db, attachment, currentUser)


@router.delete("/{attachmentId}", status_code=status.HTTP_204_NO_CONTENT)
def DeleteAttachment(
    attachmentId: str,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    success = AttachmentService.DeleteAttachmentService(db, attachmentId, currentUser)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found.")


@router.get("/{attachmentId}", response_model=AttachmentResponseSchema)
def GetAttachmentById(
    attachmentId: str,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.GetAttachmentByIdService(db, attachmentId)


@router.get("/entity/{entityType}/{entityId}", response_model=List[AttachmentResponseSchema])
def GetAttachmentsByEntity(
    entityType: AttachmentEntityType,
    entityId: str,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.GetAttachmentsByEntityService(db, entityType, entityId)


@router.get("/type/{entityType}", response_model=List[AttachmentResponseSchema])
def GetAttachmentsByEntityType(
    entityType: AttachmentEntityType,
    db: Session = Depends(GetDb),
    currentUser: str = Depends(GetCurrentUser)
):
    return AttachmentService.GetAttachmentsByEntityTypeService(db, entityType)

