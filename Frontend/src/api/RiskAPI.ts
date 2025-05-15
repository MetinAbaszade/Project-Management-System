// src/api/RiskAPI.ts

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

// Mock data for development fallback
const mockRisks: Record<string, Risk[]> = {};

// Helper function to create fake risk IDs for fallback
const createFakeRiskId = () => `risk-${Math.random().toString(36).substring(2, 11)}`;

// Generate mock data for a project if it doesn't exist (for fallback)
const generateMockRisks = (projectId: string, count = 5): Risk[] => {
  if (mockRisks[projectId]) return mockRisks[projectId];
  
  const categories = ['Technical', 'Schedule', 'Cost', 'Resource', 'Quality', 'Stakeholder'];
  const statuses = ['Identified', 'Analyzing', 'Monitoring', 'Mitigating', 'Resolved'];
  
  const risks: Risk[] = [];
  
  for (let i = 0; i < count; i++) {
    const probability = Math.round(Math.random() * 100) / 100; // 0-1
    const impact = Math.floor(Math.random() * 10) + 1; // 1-10
    const severity = probability * impact;
    
    risks.push({
      Id: createFakeRiskId(),
      ProjectId: projectId,
      Name: `Risk ${i + 1}: ${['Data Loss', 'Budget Overrun', 'Scope Creep', 'Resource Shortage', 'Technology Failure'][i % 5]}`,
      Description: `This is a mock risk description for testing purposes. This risk might impact project delivery if not addressed properly.`,
      Category: categories[Math.floor(Math.random() * categories.length)],
      Probability: probability,
      Impact: impact,
      Severity: severity,
      OwnerId: localStorage.getItem('userId') || 'user-123',
      Status: statuses[Math.floor(Math.random() * statuses.length)],
      IdentifiedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      IsDeleted: false
    });
  }
  
  mockRisks[projectId] = risks;
  return risks;
};

// Mock analyses data for fallback
const mockAnalyses: Record<string, any[]> = {};

// Generate mock analyses for a risk (for fallback)
const generateMockAnalyses = (riskId: string, count = 2): any[] => {
  if (mockAnalyses[riskId]) return mockAnalyses[riskId];
  
  const analysisTypes = ['Qualitative', 'Quantitative', 'SWOT', 'Decision Tree', 'Monte Carlo'];
  
  const analyses = [];
  
  for (let i = 0; i < count; i++) {
    analyses.push({
      Id: `analysis-${Math.random().toString(36).substring(2, 11)}`,
      RiskId: riskId,
      AnalysisType: analysisTypes[Math.floor(Math.random() * analysisTypes.length)],
      MatrixScore: ['A3', 'B2', 'C4', 'D1'][Math.floor(Math.random() * 4)],
      ExpectedValue: Math.floor(Math.random() * 50000) + 5000,
      OwnerId: localStorage.getItem('userId') || 'user-123',
      AnalysisDate: new Date().toISOString(),
      IsDeleted: false
    });
  }
  
  mockAnalyses[riskId] = analyses;
  return analyses;
};

// Mock response plans data for fallback
const mockResponsePlans: Record<string, any[]> = {};

// Generate mock response plans for a risk (for fallback)
const generateMockResponsePlans = (riskId: string, count = 2): any[] => {
  if (mockResponsePlans[riskId]) return mockResponsePlans[riskId];
  
  const strategies = ['Avoid', 'Mitigate', 'Transfer', 'Accept', 'Exploit'];
  const statuses = ['Not Started', 'In Progress', 'Completed'];
  
  const plans = [];
  
  for (let i = 0; i < count; i++) {
    plans.push({
      Id: `response-${Math.random().toString(36).substring(2, 11)}`,
      RiskId: riskId,
      Strategy: strategies[Math.floor(Math.random() * strategies.length)],
      Description: `This is a mock response plan description for testing the risk management module.`,
      PlannedActions: `1. Identify key stakeholders\n2. Develop mitigation strategy\n3. Implement controls\n4. Monitor effectiveness`,
      Status: statuses[Math.floor(Math.random() * statuses.length)],
      OwnerId: localStorage.getItem('userId') || 'user-123',
      CreatedAt: new Date().toISOString(),
      IsDeleted: false
    });
  }
  
  mockResponsePlans[riskId] = plans;
  return plans;
};

/**
 * Get all risks for a project
 */
export async function getProjectRisks(projectId: string): Promise<Risk[]> {
  try {
    // Attempt to fetch from the real API
    const response = await api.get(`/risks/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data instead:', error);
    
    // Return mock data as fallback
    return generateMockRisks(projectId);
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
    console.warn('API not available, using mock data:', error);
    
    // Find the risk in our mock data
    for (const projectId in mockRisks) {
      const risk = mockRisks[projectId].find(r => r.Id === riskId);
      if (risk) return risk;
    }
    
    // If not found, create a new mock risk
    const mockRisk: Risk = {
      Id: riskId,
      ProjectId: 'unknown',
      Name: 'Mock Risk',
      Description: 'This is a mock risk for development purposes.',
      Category: 'Technical',
      Probability: 0.5,
      Impact: 5,
      Severity: 2.5,
      OwnerId: localStorage.getItem('userId') || 'user-123',
      Status: 'Identified',
      IdentifiedDate: new Date().toISOString(),
      IsDeleted: false
    };
    
    return mockRisk;
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
    console.warn('API not available, using mock data:', error);
    
    // Create a mock risk
    const riskId = createFakeRiskId();
    const risk: Risk = {
      Id: riskId,
      ProjectId: data.ProjectId,
      Name: data.Name,
      Description: data.Description || '',
      Category: data.Category,
      Probability: data.Probability,
      Impact: data.Impact,
      Severity: data.Severity,
      OwnerId: data.OwnerId || (localStorage.getItem('userId') || 'user-123'),
      Status: data.Status || 'Identified',
      IdentifiedDate: new Date().toISOString(),
      IsDeleted: false
    };
    
    // Add to mock data
    if (!mockRisks[data.ProjectId]) {
      mockRisks[data.ProjectId] = [];
    }
    mockRisks[data.ProjectId].push(risk);
    
    return riskId;
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
    console.warn('API not available, updating mock data:', error);
    
    // Find and update the risk in our mock data
    for (const projectId in mockRisks) {
      const riskIndex = mockRisks[projectId].findIndex(r => r.Id === riskId);
      if (riskIndex >= 0) {
        mockRisks[projectId][riskIndex] = {
          ...mockRisks[projectId][riskIndex],
          ...data
        };
        return riskId;
      }
    }
    
    throw new Error('Risk not found in mock data');
  }
}

/**
 * Delete a risk
 */
export async function deleteRisk(riskId: string, projectId: string): Promise<string> {
  try {
    const response = await api.delete(`/risks/${riskId}/delete?projectId=${projectId}`);
    return response.data;
  } catch (error) {
    console.warn('API not available, updating mock data:', error);
    
    // Remove from mock data
    if (mockRisks[projectId]) {
      mockRisks[projectId] = mockRisks[projectId].filter(r => r.Id !== riskId);
    }
    
    // Also clean up analyses and response plans
    delete mockAnalyses[riskId];
    delete mockResponsePlans[riskId];
    
    return riskId;
  }
}

/**
 * Get all risk analyses for a risk
 */
export async function getRiskAnalyses(riskId: string): Promise<any[]> {
  try {
    const response = await api.get(`/risks/${riskId}/analyses`);
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    return generateMockAnalyses(riskId);
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
    console.warn('API not available, using mock data:', error);
    
    const analysisId = `analysis-${Math.random().toString(36).substring(2, 11)}`;
    const analysis = {
      Id: analysisId,
      ...data,
      AnalysisDate: new Date().toISOString(),
      IsDeleted: false
    };
    
    if (!mockAnalyses[data.RiskId]) {
      mockAnalyses[data.RiskId] = [];
    }
    
    mockAnalyses[data.RiskId].push(analysis);
    return analysisId;
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
    console.warn('API not available, updating mock data:', error);
    
    // Find and update in mock data
    for (const riskId in mockAnalyses) {
      const index = mockAnalyses[riskId].findIndex(a => a.Id === analysisId);
      if (index >= 0) {
        mockAnalyses[riskId][index] = {
          ...mockAnalyses[riskId][index],
          ...data
        };
        return analysisId;
      }
    }
    
    throw new Error('Analysis not found in mock data');
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
    console.warn('API not available, updating mock data:', error);
    
    // Remove from mock data
    for (const riskId in mockAnalyses) {
      mockAnalyses[riskId] = mockAnalyses[riskId].filter(a => a.Id !== analysisId);
    }
    
    return analysisId;
  }
}

/**
 * Get all risk response plans for a risk
 */
export async function getRiskResponsePlans(riskId: string): Promise<any[]> {
  try {
    const response = await api.get(`/risks/${riskId}/responses`);
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    return generateMockResponsePlans(riskId);
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
    console.warn('API not available, using mock data:', error);
    
    const responseId = `response-${Math.random().toString(36).substring(2, 11)}`;
    const responsePlan = {
      Id: responseId,
      ...data,
      CreatedAt: new Date().toISOString(),
      IsDeleted: false
    };
    
    if (!mockResponsePlans[data.RiskId]) {
      mockResponsePlans[data.RiskId] = [];
    }
    
    mockResponsePlans[data.RiskId].push(responsePlan);
    return responseId;
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
    console.warn('API not available, updating mock data:', error);
    
    // Find and update in mock data
    for (const riskId in mockResponsePlans) {
      const index = mockResponsePlans[riskId].findIndex(r => r.Id === responseId);
      if (index >= 0) {
        mockResponsePlans[riskId][index] = {
          ...mockResponsePlans[riskId][index],
          ...data
        };
        return responseId;
      }
    }
    
    throw new Error('Response plan not found in mock data');
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
    console.warn('API not available, updating mock data:', error);
    
    // Remove from mock data
    for (const riskId in mockResponsePlans) {
      mockResponsePlans[riskId] = mockResponsePlans[riskId].filter(r => r.Id !== responseId);
    }
    
    return responseId;
  }
}