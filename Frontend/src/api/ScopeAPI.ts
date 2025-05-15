import { api } from '@/lib/axios';

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

/**
 * Add project scope
 * Implements POST /scope/add/{projectId}
 */
export async function addProjectScope(projectId: string, data: ProjectScope): Promise<string> {
  try {
    const response = await api.post(`/scope/add/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding project scope:', error);
    throw error;
  }
}

/**
 * Edit project scope
 * Implements PUT /scope/edit/{projectId}
 */
export async function editProjectScope(projectId: string, data: ProjectScope): Promise<string> {
  try {
    const response = await api.put(`/scope/edit/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing project scope:', error);
    throw error;
  }
}

/**
 * Get project scope
 * Implements GET /scope/{projectId}
 */
export async function getProjectScope(projectId: string): Promise<ProjectScope> {
  try {
    const response = await api.get(`/scope/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting project scope:', error);
    throw error;
  }
}