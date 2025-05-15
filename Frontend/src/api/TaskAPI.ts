// src/api/TaskAPI.ts - Fixed version
import { api } from '@/lib/axios';

export interface Task {
  Id: string;
  Title: string;
  Description: string;
  Cost: number;
  Status: string;
  StatusColorHex: string;
  Priority: string;
  PriorityColorHex: string;
  Deadline: string;
  TeamId: string;
  UserId: string;
  ParentTaskId: string;
  ProjectId: string;   
  CreatedBy: string; 
  CreatedAt: string;
  UpdatedAt: string;
  Completed: boolean;
  IsDeleted: boolean;
}

export interface TaskCreateData {
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
}

export interface TaskUpdateData {
  Title?: string;
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
}

// Added interface for Attachment
export interface Attachment {
  Id: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  EntityType?: string;
  EntityId?: string;
  OwnerId?: string;
  UploadedAt?: string;
  Url?: string;
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  try {
    const response = await api.get('/tasks/');
    return response.data;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    return [];
  }
}

/**
 * Create a new task
 */
export async function createTask(data: TaskCreateData): Promise<Task> {
  const response = await api.post('/tasks/', data);
  return response.data;
}

/**
 * Get a task by ID
 */
export async function getTaskById(taskId: string): Promise<Task> {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

/**
 * Update a task
 * Uses PUT /tasks/{taskId}
 */
export async function updateTask(taskId: string, data: TaskUpdateData): Promise<Task> {
  try {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Delete a task
 * Uses DELETE /tasks/{taskId}
 */
export async function deleteTask(taskId: string): Promise<any> {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Get all tasks for a specific user
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    const response = await api.get(`/users/${userId}/tasks/assigned`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return [];
  }
}

/**
 * Get tasks created by a specific user
 */
export async function getTasksCreatedByUser(userId: string): Promise<Task[]> {
  try {
    const response = await api.get(`/users/${userId}/tasks/created`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks created by user:', error);
    return [];
  }
}

/**
 * Get tasks assigned to the current user
 */
export async function getCurrentUserTasks(): Promise<Task[]> {
  try {
    const response = await api.get('/users/tasks/assigned');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return [];
  }
}

/**
 * Get tasks assigned to the current user (alias for getCurrentUserTasks)
 */
export async function getCurrentUserAssignedTasks(): Promise<Task[]> {
  return getCurrentUserTasks();
}

/**
 * Get tasks created by the current user
 */
export async function getTasksCreatedByCurrentUser(): Promise<Task[]> {
  try {
    const response = await api.get('/users/tasks/created');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks created by current user:', error);
    return [];
  }
}

/**
 * Mark a task as complete
 * Uses PUT /tasks/{taskId}/complete
 */
export async function markTaskComplete(taskId: string): Promise<Task> {
  try {
    const response = await api.put(`/tasks/${taskId}/complete`, {});
    return response.data;
  } catch (error) {
    console.error('Error marking task complete:', error);
    throw error;
  }
}

/**
 * Get tasks for a specific project
 */
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  try {
    // Try the direct endpoint first
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project tasks: ${error}`);
    
    try {
      // Fallback: get all tasks and filter by project ID
      const allTasks = await getAllTasks();
      return allTasks.filter((task: Task) => task.ProjectId === projectId);
    } catch (fallbackError) {
      console.error(`Fallback also failed: ${fallbackError}`);
      return [];
    }
  }
}

/**
 * Get attachments for a task
 * Both taskId and projectId are required
 */
export async function getTaskAttachments(taskId: string, projectId: string): Promise<Attachment[]> {
  if (!taskId || !projectId) {
    console.error('Missing taskId or projectId for getTaskAttachments');
    return [];
  }

  try {
    const response = await api.get(`/attachments/entity/${projectId}/Task/${taskId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) return [];
    console.error('Failed to fetch task attachments:', error);
    throw error;
  }
}

/**
 * Upload an attachment to a task
 * Both file, taskId and projectId are required
 */
export async function uploadTaskAttachment(
  file: File,
  taskId: string,
  projectId: string
): Promise<Attachment> {
  if (!file || !taskId || !projectId) {
    throw new Error('Missing required parameters for uploadTaskAttachment');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', 'Task'); // Use "Task" exactly as expected by backend
  formData.append('entityId', taskId);
  formData.append('projectId', projectId);

  try {
    const response = await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
}

/**
 * Delete an attachment from a task
 */
export async function deleteTaskAttachment(taskId: string, attachmentId: string): Promise<any> {
  try {
    const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
}

/**
 * Get all teams for a project
 */
export async function getProjectTeams(projectId: string): Promise<any[]> {
  try {
    const response = await api.get(`/projects/${projectId}/teams`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project teams:', error);
    return [];
  }
}

/**
 * Get all members for a project
 */
export async function getProjectMembers(projectId: string): Promise<any[]> {
  try {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project members:', error);
    return [];
  }
}