import { api } from '@/lib/axios';

export interface ActivityLog {
  Id: string;
  ProjectId: string;
  UserId: string;
  Action: string;
  EntityType: string;
  EntityId: string;
  Timestamp: string;
  Details?: string;
}

/**
 * Get activity log for a project
 */
export async function getProjectActivityLog(projectId: string): Promise<ActivityLog[]> {
  const response = await api.get(`/projects/${projectId}/activity`);
  return response.data;
}