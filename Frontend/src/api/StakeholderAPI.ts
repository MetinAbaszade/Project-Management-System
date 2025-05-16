// Path: Frontend/src/api/StakeholderAPI.ts

import { api } from '@/lib/axios';

export interface Stakeholder {
  Id: string;
  ProjectId: string;
  UserId: string;
  Percentage: number;
  CreatedAt: string;
  UpdatedAt: string;
  User?: {
    Id: string;
    FirstName: string;
    LastName: string;
    Email: string;
    ProfilePicture?: string;
  };
}

export interface StakeholderCreateData {
  ProjectId: string;
  UserId: string;
  Percentage: number;
}

export interface StakeholderUpdateData {
  Percentage: number;
}

/**
 * Get all stakeholders for a project
 */
export async function getProjectStakeholders(projectId: string): Promise<Stakeholder[]> {
  const response = await api.get(`/stakeholders/project/${projectId}`);
  return response.data;
}

/**
 * Get a stakeholder by ID
 */
export async function getStakeholderById(stakeholderId: string): Promise<Stakeholder> {
  const response = await api.get(`/stakeholders/${stakeholderId}`);
  return response.data;
}

/**
 * Create a new stakeholder
 */
export async function createStakeholder(data: StakeholderCreateData): Promise<Stakeholder> {
  const response = await api.post('/stakeholders/', data);
  return response.data;
}

/**
 * Update a stakeholder
 */
export async function updateStakeholder(stakeholderId: string, data: StakeholderUpdateData): Promise<Stakeholder> {
  const response = await api.put(`/stakeholders/${stakeholderId}`, data);
  return response.data;
}

/**
 * Delete a stakeholder
 */
export async function deleteStakeholder(stakeholderId: string): Promise<string> {
  const response = await api.delete(`/stakeholders/${stakeholderId}`);
  return response.data;
}

/**
 * Get current user detailed data
 */
export async function getCurrentUserDetails(): Promise<any> {
  try {
    const response = await api.get('/users/get-user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Search for users
 */
export async function searchUsers(query: string): Promise<any[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}