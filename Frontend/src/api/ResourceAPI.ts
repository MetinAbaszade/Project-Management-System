// src/api/ResourceAPI.ts
import { api } from '@/lib/axios';

export interface Resource {
  Id: string;
  Name: string;
  Type: string;
  ProjectId: string;
  Description?: string;
  Unit?: string;
  Total: number;
  Available: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  IsDeleted?: boolean;
}

export interface ResourceCreateData {
  Name: string;
  Type: string;
  ProjectId: string;
  Description?: string;
  Unit?: string;
  Total: number;
  Available: number;
}

export interface ResourceUpdateData {
  Name?: string;
  Type?: string;
  Description?: string;
  Unit?: string;
  Total?: number;
  Available?: number;
}

export interface ResourceAssignment {
  Id: string;
  TaskId: string;
  ResourceId: string;
  Quantity: number;
  EstimatedCost: number;
  AssignedAt?: string;
  IsDeleted?: boolean;
}

export interface ResourceAssignmentCreateData {
  TaskId: string;
  ResourceId: string;
  Quantity: number;
  EstimatedCost: number;
}

export interface ResourceAssignmentUpdateData {
  Quantity?: number;
  EstimatedCost?: number;
}

export interface ResourcePlan {
  Id: string;
  ProjectId: string;
  Notes?: string;
  OwnerId: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  IsDeleted?: boolean;
}

export interface ResourcePlanCreateData {
  ProjectId: string;
  Notes?: string;
  OwnerId: string;
}

export interface ResourcePlanUpdateData {
  Notes?: string;
}

/**
 * Create a new resource
 */
export async function createResource(data: ResourceCreateData): Promise<Resource> {
  try {
    const response = await api.post('/resources/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

/**
 * Update an existing resource
 */
export async function updateResource(resourceId: string, data: ResourceUpdateData): Promise<Resource> {
  try {
    const response = await api.put(`/resources/${resourceId}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
}

/**
 * Delete a resource (soft delete)
 */
export async function deleteResource(resourceId: string): Promise<any> {
  try {
    const response = await api.delete(`/resources/${resourceId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
}

/**
 * Get all resources for a project
 */
export async function getProjectResources(projectId: string): Promise<Resource[]> {
  try {
    const response = await api.get(`/resources/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project resources:', error);
    return [];
  }
}

/**
 * Get a resource by ID
 */
export async function getResourceById(resourceId: string): Promise<Resource> {
  try {
    const response = await api.get(`/resources/${resourceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw error;
  }
}

/**
 * Assign resource to a task
 */
export async function assignResourceToTask(data: ResourceAssignmentCreateData): Promise<ResourceAssignment> {
  try {
    const response = await api.post('/resources/assign', data);
    return response.data;
  } catch (error) {
    console.error('Error assigning resource to task:', error);
    throw error;
  }
}

/**
 * Update a resource assignment
 */
export async function updateResourceAssignment(
  assignmentId: string, 
  data: ResourceAssignmentUpdateData
): Promise<ResourceAssignment> {
  try {
    const response = await api.put(`/resources/assignments/${assignmentId}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating resource assignment:', error);
    throw error;
  }
}

/**
 * Delete a resource assignment (soft delete)
 */
export async function deleteResourceAssignment(assignmentId: string): Promise<any> {
  try {
    const response = await api.delete(`/resources/assignments/${assignmentId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resource assignment:', error);
    throw error;
  }
}

/**
 * Get a resource assignment by ID
 */
export async function getResourceAssignmentById(assignmentId: string): Promise<ResourceAssignment> {
  try {
    const response = await api.get(`/resources/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resource assignment:', error);
    throw error;
  }
}

/**
 * Get all resources assigned to a task
 */
export async function getTaskResourceAssignments(taskId: string): Promise<ResourceAssignment[]> {
  try {
    const response = await api.get(`/resources/task/${taskId}/assignments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task resource assignments:', error);
    return [];
  }
}

/**
 * Create a resource plan
 */
export async function createResourcePlan(data: ResourcePlanCreateData): Promise<ResourcePlan> {
  try {
    const response = await api.post('/resources/plan/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating resource plan:', error);
    throw error;
  }
}

/**
 * Update a resource plan
 */
export async function updateResourcePlan(planId: string, data: ResourcePlanUpdateData): Promise<ResourcePlan> {
  try {
    const response = await api.put(`/resources/plan/${planId}/update`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating resource plan:', error);
    throw error;
  }
}

/**
 * Delete a resource plan (soft delete)
 */
export async function deleteResourcePlan(planId: string): Promise<any> {
  try {
    const response = await api.delete(`/resources/plan/${planId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resource plan:', error);
    throw error;
  }
}

/**
 * Get a resource plan by ID
 */
export async function getResourcePlanById(planId: string): Promise<ResourcePlan> {
  try {
    const response = await api.get(`/resources/plan/${planId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resource plan:', error);
    throw error;
  }
}

/**
 * Get all resource plans for a project
 */
export async function getProjectResourcePlans(projectId: string): Promise<ResourcePlan[]> {
  try {
    const response = await api.get(`/resources/project/${projectId}/plans`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project resource plans:', error);
    return [];
  }
}