import { api } from '@/lib/axios';

export interface Resource {
  Id: string;
  Name: string;
  Type: string;
  Description: string;
  Unit: string;
  Total: number;
  Available: number;
}

export interface ResourceCreateData {
  Name: string;
  Type: string;
  Description?: string;
  Unit: string;
  Total: number;
  Available: number;
}

export interface ResourcePlan {
  Id: string;
  ProjectId: string;
  Notes: string;
  OwnerId: string;
}

export interface ResourcePlanCreateData {
  ProjectId: string;
  Notes?: string;
  OwnerId?: string;
}

/**
 * Get all resources for a project
 */
export async function getProjectResources(projectId: string): Promise<Resource[]> {
  const response = await api.get(`/resources/project/${projectId}`);
  return response.data;
}

/**
 * Get a resource by ID
 */
export async function getResourceById(resourceId: string): Promise<Resource> {
  const response = await api.get(`/resources/${resourceId}`);
  return response.data;
}

/**
 * Create a new resource
 */
export async function createResource(data: ResourceCreateData): Promise<Resource> {
  const response = await api.post('/resources/create', data);
  return response.data;
}

/**
 * Update a resource
 */
export async function updateResource(resourceId: string, data: ResourceCreateData): Promise<Resource> {
  const response = await api.put(`/resources/${resourceId}/update`, data);
  return response.data;
}

/**
 * Delete a resource
 */
export async function deleteResource(resourceId: string): Promise<string> {
  const response = await api.delete(`/resources/${resourceId}/delete`);
  return response.data;
}

/**
 * Get all resource plans for a project
 */
export async function getProjectResourcePlans(projectId: string): Promise<ResourcePlan[]> {
  const response = await api.get(`/resources/project/${projectId}/plans`);
  return response.data;
}

/**
 * Get a resource plan by ID
 */
export async function getResourcePlanById(planId: string): Promise<ResourcePlan> {
  const response = await api.get(`/resources/plan/${planId}`);
  return response.data;
}

/**
 * Create a new resource plan
 */
export async function createResourcePlan(data: ResourcePlanCreateData): Promise<ResourcePlan> {
  const response = await api.post('/resources/plan/create', data);
  return response.data;
}

/**
 * Update a resource plan
 */
export async function updateResourcePlan(planId: string, data: { Notes?: string }): Promise<ResourcePlan> {
  const response = await api.put(`/resources/plan/${planId}/update`, data);
  return response.data;
}

/**
 * Delete a resource plan
 */
export async function deleteResourcePlan(planId: string): Promise<string> {
  const response = await api.delete(`/resources/plan/${planId}/delete`);
  return response.data;
}

/**
 * Assign a resource to a task
 */
export async function assignResourceToTask(data: {
  TaskId: string;
  ResourceId: string;
  Quantity: number;
  EstimatedCost: number;
}): Promise<string> {
  const response = await api.post('/resources/assign', data);
  return response.data;
}

/**
 * Get all resources assigned to a task
 */
export async function getResourcesAssignedToTask(taskId: string): Promise<any[]> {
  const response = await api.get(`/resources/task/${taskId}/assignments`);
  return response.data;
}