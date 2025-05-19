// src/api/TaskTreeAPI.ts
import { api } from '@/lib/axios';

export interface TaskTree {
  Id: string;
  Title: string;
  Description?: string;
  Cost?: number;
  Status?: string;
  StatusColorHex?: string;
  Priority?: string;
  PriorityColorHex?: string;
  Deadline?: string;
  TeamId?: string;
  UserId?: string;
  ParentTaskId?: string;
  ProjectId: string;
  CreatedBy?: string;  // Added this field
  CreatedAt: string;
  UpdatedAt: string;
  Completed: boolean;
  IsDeleted: boolean;
  Progress: number;
  SubtaskCount: number;
  SubtaskCompleted: number;
  Subtasks: TaskTree[];
}

export async function getTaskTree(taskId: string): Promise<TaskTree> {
  try {
    const response = await api.get(`/tasks/${taskId}/tree`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task tree:', error);
    throw error;
  }
}

export async function markTaskComplete(taskId: string): Promise<TaskTree> {
  try {
    const response = await api.put(`/tasks/${taskId}`, { Status: 'Completed', Completed: true });
    return response.data;
  } catch (error) {
    console.error('Error marking task as complete:', error);
    throw error;
  }
}

export async function updateTaskInTree(taskId: string, data: any): Promise<TaskTree> {
  try {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function createSubtask(data: any): Promise<TaskTree> {
  try {
    const response = await api.post('/tasks/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating subtask:', error);
    throw error;
  }
}

export async function deleteTaskFromTree(taskId: string): Promise<any> {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// Helper function to check if current user is the creator of a task
export function isTaskCreator(task: TaskTree, userId: string | null): boolean {
  if (!userId || !task?.CreatedBy) return false;
  return task.CreatedBy === userId;
}

// Helper function to check if current user is assigned to a task
export function isTaskAssignee(task: TaskTree, userId: string | null): boolean {
  if (!userId || !task?.UserId) return false;
  return task.UserId === userId;
}