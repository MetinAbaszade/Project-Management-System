import { api } from '@/lib/axios';

export interface Attachment {
  Id: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  EntityType: 'Scope' | 'Risk' | 'Resource' | 'Schedule' | 'Cost';
  EntityId: string;
  OwnerId: string;
  UploadedAt: string;
}

export interface AttachmentCreateData {
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  EntityType: 'Scope' | 'Risk' | 'Resource' | 'Schedule' | 'Cost';
  EntityId: string;
  OwnerId?: string;
  ProjectId: string;
}

/**
 * Upload an attachment
 */
export async function uploadAttachment(file: File, entityType: string, entityId: string, projectId: string): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);
  formData.append('projectId', projectId);
  
  const response = await api.post('/attachments/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

/**
 * Add an attachment
 */
export async function addAttachment(data: AttachmentCreateData): Promise<Attachment> {
  const response = await api.post('/attachments/', data);
  return response.data;
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  await api.delete(`/attachments/${attachmentId}`);
}

/**
 * Get an attachment by ID
 */
export async function getAttachmentById(attachmentId: string): Promise<Attachment> {
  const response = await api.get(`/attachments/${attachmentId}`);
  return response.data;
}

/**
 * Get all attachments for an entity
 */
export async function getAttachmentsByEntity(projectId: string, entityType: string, entityId: string): Promise<Attachment[]> {
  const response = await api.get(`/attachments/entity/${projectId}/${entityType}/${entityId}`);
  return response.data;
}

/**
 * Get all attachments by entity type
 */
export async function getAttachmentsByEntityType(projectId: string, entityType: string): Promise<Attachment[]> {
  const response = await api.get(`/attachments/type/${projectId}/${entityType}`);
  return response.data;
}

/**
 * Download an attachment
 */
export async function downloadAttachment(attachmentId: string): Promise<string> {
  const response = await api.get(`/attachments/download/${attachmentId}`);
  return response.data;
}