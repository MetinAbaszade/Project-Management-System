import { api } from '@/lib/axios';
import { v4 as uuidv4 } from 'uuid';

export interface WorkPackage {
  Name: string;
  Description: string;
  EstimatedDuration: number;
  EstimatedCost: number;
}

export interface ScopeManagementPlan {
  ScopeDefinitionMethod: string;
  WBSDevelopmentMethod: string;
  ScopeBaselineApproval: string;
  DeliverablesImpactHandling: string;
}

export interface RequirementManagementPlan {
  ReqPlanningApproach: string;
  ReqChangeControl: string;
  ReqPrioritization: string;
  ReqMetrics: string;
}

export interface RequirementDocumentation {
  StakeholderNeeds: string[];
  QuantifiedExpectations: string[];
  Traceability: string;
}

export interface ProjectScopeStatement {
  EndProductScope: string;
  Deliverables: string[];
  AcceptanceCriteria: string;
  Exclusions: string;
  OptionalSOW: string;
}

export interface WorkBreakdownStructure {
  WorkPackages: WorkPackage[];
  ScopeBaselineReference: string;
}

export interface ProjectScope {
  scopeManagementPlan: ScopeManagementPlan;
  requirementManagementPlan: RequirementManagementPlan;
  requirementDocumentation: RequirementDocumentation;
  projectScopeStatement: ProjectScopeStatement;
  workBreakdownStructure: WorkBreakdownStructure;
  ownerId?: string;
}

// Scope Management Plan
export async function addScopeManagementPlan(projectId: string, data: ScopeManagementPlan): Promise<string> {
  try {
    const response = await api.post(`/scope/add/scope-management/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding scope management plan:', error);
    throw error;
  }
}

export async function editScopeManagementPlan(projectId: string, data: ScopeManagementPlan): Promise<string> {
  try {
    const response = await api.put(`/scope/edit/scope-management/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing scope management plan:', error);
    throw error;
  }
}

export async function getScopeManagementPlan(projectId: string): Promise<ScopeManagementPlan> {
  try {
    const response = await api.get(`/scope/plan/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting scope management plan:', error);
    throw error;
  }
}

// Requirement Management Plan
export async function addRequirementManagementPlan(projectId: string, data: RequirementManagementPlan): Promise<string> {
  try {
    const response = await api.post(`/scope/add/requirement-management/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding requirement management plan:', error);
    throw error;
  }
}

export async function editRequirementManagementPlan(projectId: string, data: RequirementManagementPlan): Promise<string> {
  try {
    const response = await api.put(`/scope/edit/requirement-management/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing requirement management plan:', error);
    throw error;
  }
}

export async function getRequirementManagementPlan(projectId: string): Promise<RequirementManagementPlan> {
  try {
    const response = await api.get(`/scope/requirements/plan/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting requirement management plan:', error);
    throw error;
  }
}

// Requirement Documentation
export async function addRequirementDocumentation(projectId: string, data: RequirementDocumentation): Promise<string> {
  try {
    const response = await api.post(`/scope/add/requirement-document/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding requirement documentation:', error);
    throw error;
  }
}

export async function editRequirementDocumentation(projectId: string, data: RequirementDocumentation): Promise<string> {
  try {
    const response = await api.put(`/scope/edit/requirement-document/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing requirement documentation:', error);
    throw error;
  }
}

export async function getRequirementDocumentation(projectId: string): Promise<RequirementDocumentation> {
  try {
    const response = await api.get(`/scope/requirements/doc/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting requirement documentation:', error);
    throw error;
  }
}

// Project Scope Statement
export async function addProjectScopeStatement(projectId: string, data: ProjectScopeStatement): Promise<string> {
  try {
    const response = await api.post(`/scope/add/scope-statement/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding project scope statement:', error);
    throw error;
  }
}

export async function editProjectScopeStatement(projectId: string, data: ProjectScopeStatement): Promise<string> {
  try {
    const response = await api.put(`/scope/edit/scope-statement/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing project scope statement:', error);
    throw error;
  }
}

export async function getProjectScopeStatement(projectId: string): Promise<ProjectScopeStatement> {
  try {
    const response = await api.get(`/scope/statement/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting project scope statement:', error);
    throw error;
  }
}

// Work Breakdown Structure
export async function addWorkBreakdownStructure(projectId: string, data: WorkBreakdownStructure): Promise<string> {
  try {
    const response = await api.post(`/scope/add/wbs/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding work breakdown structure:', error);
    throw error;
  }
}

export async function editWorkBreakdownStructure(projectId: string, data: WorkBreakdownStructure): Promise<string> {
  try {
    const response = await api.put(`/scope/edit/wbs/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing work breakdown structure:', error);
    throw error;
  }
}

export async function getWorkBreakdownStructure(projectId: string): Promise<WorkBreakdownStructure> {
  try {
    const response = await api.get(`/scope/wbs/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting work breakdown structure:', error);
    throw error;
  }
}

// Aggregated Project Scope operations
export async function getProjectScope(projectId: string): Promise<ProjectScope> {
  try {
    // Fetch all scope components in parallel
    const [
      scopeManagementPlan,
      requirementManagementPlan,
      requirementDocumentation,
      projectScopeStatement,
      workBreakdownStructure
    ] = await Promise.all([
      getScopeManagementPlan(projectId).catch(() => ({
        ScopeDefinitionMethod: '',
        WBSDevelopmentMethod: '',
        ScopeBaselineApproval: '',
        DeliverablesImpactHandling: ''
      })),
      getRequirementManagementPlan(projectId).catch(() => ({
        ReqPlanningApproach: '',
        ReqChangeControl: '',
        ReqPrioritization: '',
        ReqMetrics: ''
      })),
      getRequirementDocumentation(projectId).catch(() => ({
        StakeholderNeeds: [''],
        QuantifiedExpectations: [''],
        Traceability: ''
      })),
      getProjectScopeStatement(projectId).catch(() => ({
        EndProductScope: '',
        Deliverables: [''],
        AcceptanceCriteria: '',
        Exclusions: '',
        OptionalSOW: ''
      })),
      getWorkBreakdownStructure(projectId).catch(() => ({
        WorkPackages: [],
        ScopeBaselineReference: ''
      }))
    ]);

    // Combine into single scope object
    return {
      scopeManagementPlan,
      requirementManagementPlan,
      requirementDocumentation,
      projectScopeStatement,
      workBreakdownStructure
    };
  } catch (error) {
    console.error('Error getting project scope:', error);
    throw error;
  }
}

export async function addProjectScope(projectId: string, data: ProjectScope): Promise<void> {
  try {
    // Add each component sequentially
    await addScopeManagementPlan(projectId, data.scopeManagementPlan);
    await addRequirementManagementPlan(projectId, data.requirementManagementPlan);
    await addRequirementDocumentation(projectId, data.requirementDocumentation);
    await addProjectScopeStatement(projectId, data.projectScopeStatement);
    await addWorkBreakdownStructure(projectId, data.workBreakdownStructure);
    return;
  } catch (error) {
    console.error('Error adding project scope:', error);
    throw error;
  }
}

export async function editProjectScope(projectId: string, data: ProjectScope): Promise<void> {
  try {
    // Edit each component sequentially
    await editScopeManagementPlan(projectId, data.scopeManagementPlan);
    await editRequirementManagementPlan(projectId, data.requirementManagementPlan);
    await editRequirementDocumentation(projectId, data.requirementDocumentation);
    await editProjectScopeStatement(projectId, data.projectScopeStatement);
    await editWorkBreakdownStructure(projectId, data.workBreakdownStructure);
    return;
  } catch (error) {
    console.error('Error editing project scope:', error);
    throw error;
  }
}

export async function deleteProjectScope(projectId: string): Promise<void> {
  // This would be a backend endpoint to delete the scope
  // For now, we'll just return a resolved promise since it's not in the API
  return Promise.resolve();
}

// Local Storage Attachment Management
export interface Attachment {
  Id: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  EntityType: string;
  EntityId: string;
  OwnerId: string;
  UploadedAt: string;
  FileData?: string; // Base64 data for local storage
}

// Store attachments in localStorage
export const getAttachmentsByEntity = (
  entityId: string,
  entityType: string,
  ownerId: string
): Attachment[] => {
  try {
    const storageKey = `attachments_${entityType}_${entityId}`;
    const storedAttachments = localStorage.getItem(storageKey);
    return storedAttachments ? JSON.parse(storedAttachments) : [];
  } catch (error) {
    console.error('Error fetching attachments from localStorage:', error);
    return [];
  }
};

export const uploadAttachment = async (
  file: File,
  entityType: string,
  entityId: string,
  ownerId: string
): Promise<Attachment> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileData = e.target?.result as string;
          
          const newAttachment: Attachment = {
            Id: uuidv4(),
            FileName: file.name,
            FileType: file.type,
            FileSize: file.size,
            FilePath: URL.createObjectURL(file), // Create a temporary URL
            EntityType: entityType,
            EntityId: entityId,
            OwnerId: ownerId,
            UploadedAt: new Date().toISOString(),
            FileData: fileData
          };
          
          // Save to localStorage
          const storageKey = `attachments_${entityType}_${entityId}`;
          const existingAttachments = getAttachmentsByEntity(entityId, entityType, ownerId);
          const updatedAttachments = [...existingAttachments, newAttachment];
          localStorage.setItem(storageKey, JSON.stringify(updatedAttachments));
          
          resolve(newAttachment);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteAttachment = async (
  attachmentId: string,
  entityType: string,
  entityId: string
): Promise<void> => {
  try {
    const storageKey = `attachments_${entityType}_${entityId}`;
    const existingAttachments = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedAttachments = existingAttachments.filter(
      (attachment: Attachment) => attachment.Id !== attachmentId
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedAttachments));
    return Promise.resolve();
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return Promise.reject(error);
  }
};