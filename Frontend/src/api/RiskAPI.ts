// Frontend/src/api/RiskAPI.ts
import { api } from '@/lib/axios';

export interface Risk {
  Id: string;
  ProjectId: string;
  Name: string;
  Description: string;
  Category: string;
  Probability: number;
  Impact: number;
  Severity: number;
  OwnerId: string;
  Status: string;
  IdentifiedDate: string;
  IsDeleted: boolean;
}

export interface RiskCreateData {
  ProjectId: string;
  Name: string;
  Description?: string;
  Category: string;
  Probability: number;
  Impact: number;
  Severity: number;
  OwnerId?: string;
  Status?: string;
}

export interface RiskUpdateData {
  Name?: string;
  Description?: string;
  Category?: string;
  Probability?: number;
  Impact?: number;
  Severity?: number;
  Status?: string;
}

export interface RiskAnalysisCreateData {
  RiskId: string;
  AnalysisType: string;
  MatrixScore: string;
  ExpectedValue: number;
  OwnerId?: string;
}

export interface RiskResponsePlanCreateData {
  RiskId: string;
  Strategy: string;
  Description?: string;
  OwnerId?: string;
  PlannedActions: string;
  Status?: string;
}

/**
 * Get all risks for a project
 */
export async function getProjectRisks(projectId: string): Promise<Risk[]> {
  try {
    // Make sure the URL path matches exactly what's in your API
    const response = await api.get(`/risks/project/${projectId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching project risks:', error);
    throw error;
  }
}
/**
 * Get a risk by ID
 */
export async function getRiskById(riskId: string): Promise<Risk> {
  try {
    const response = await api.get(`/risks/${riskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching risk by ID:', error);
    throw error;
  }
}

/**
 * Create a new risk
 */
export async function createRisk(data: RiskCreateData): Promise<string> {
  try {
    const response = await api.post('/risks/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating risk:', error);
    throw error;
  }
}

/**
 * Update a risk
 */
export async function updateRisk(riskId: string, data: RiskUpdateData): Promise<string> {
  try {
    const response = await api.put(`/risks/${riskId}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating risk:', error);
    throw error;
  }
}

/**
 * Delete a risk
 */
export async function deleteRisk(riskId: string, projectId: string): Promise<string> {
  try {
    // Note: The API expects projectId as a query parameter
    const response = await api.delete(`/risks/${riskId}/delete?projectId=${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting risk:', error);
    throw error;
  }
}

/**
 * Get all risk analyses for a risk
 */
export async function getRiskAnalyses(riskId: string): Promise<any[]> {
  try {
    const response = await api.get(`/risks/${riskId}/analyses`);
    // Ensure we're working with the response data
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching risk analyses:', error);
    throw error;
  }
}

/**
 * Get a risk analysis by ID
 */
export async function getRiskAnalysisById(analysisId: string): Promise<any> {
  try {
    const response = await api.get(`/risks/analysis/${analysisId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching risk analysis by ID:', error);
    throw error;
  }
}

/**
 * Create a new risk analysis
 */
export async function createRiskAnalysis(data: RiskAnalysisCreateData): Promise<string> {
  try {
    const response = await api.post('/risks/analysis/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating risk analysis:', error);
    throw error;
  }
}

/**
 * Update a risk analysis
 */
export async function updateRiskAnalysis(
  analysisId: string,
  data: { MatrixScore?: string; ExpectedValue?: number }
): Promise<string> {
  try {
    const response = await api.put(`/risks/analysis/${analysisId}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating risk analysis:', error);
    throw error;
  }
}

/**
 * Delete a risk analysis
 */
export async function deleteRiskAnalysis(analysisId: string): Promise<string> {
  try {
    const response = await api.delete(`/risks/analysis/${analysisId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting risk analysis:', error);
    throw error;
  }
}

/**
 * Get all risk response plans for a risk
 */
export async function getRiskResponsePlans(riskId: string): Promise<any[]> {
  try {
    const response = await api.get(`/risks/${riskId}/responses`);
    // Ensure we're working with the response data
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching risk response plans:', error);
    throw error;
  }
}

/**
 * Get a risk response plan by ID
 */
export async function getRiskResponsePlanById(responseId: string): Promise<any> {
  try {
    const response = await api.get(`/risks/response/${responseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching risk response plan by ID:', error);
    throw error;
  }
}

/**
 * Create a new risk response plan
 */
export async function createRiskResponsePlan(data: RiskResponsePlanCreateData): Promise<string> {
  try {
    const response = await api.post('/risks/response/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating risk response plan:', error);
    throw error;
  }
}

/**
 * Update a risk response plan
 */
export async function updateRiskResponsePlan(
  responseId: string, 
  data: { 
    Strategy?: string; 
    Description?: string; 
    PlannedActions?: string; 
    Status?: string 
  }
): Promise<string> {
  try {
    const response = await api.put(`/risks/response/${responseId}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating risk response plan:', error);
    throw error;
  }
}

/**
 * Delete a risk response plan
 */
export async function deleteRiskResponsePlan(responseId: string): Promise<string> {
  try {
    const response = await api.delete(`/risks/response/${responseId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting risk response plan:', error);
    throw error;
  }
}