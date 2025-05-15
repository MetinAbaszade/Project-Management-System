import { api } from '@/lib/axios';

export interface Notification {
  Id: string;
  ProjectId: string;
  UserId: string;
  Title: string;
  Message: string;
  Type: string;
  IsRead: boolean;
  CreatedAt: string;
}

/**
 * Get all notifications for a project
 */
export async function getNotificationsForProject(projectId: string): Promise<Notification[]> {
  const response = await api.get(`/projects/${projectId}/notifications`);
  return response.data;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await api.put(`/notifications/${notificationId}/read`);
}

/**
 * Get all notifications for the current user
 */
export async function getCurrentUserNotifications(): Promise<Notification[]> {
  const response = await api.get('/users/notifications');
  return response.data;
}