// src/lib/utils.ts
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for conditionally joining classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to check if a date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Utility to check if a date is in the past
export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

// Utility to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Utility to truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Get random ID (for local storage items)
export function getRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Helper for drag and drop operations
export const DragDropUtils = {
  // Reorder items in the same list
  reorder: (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  },
  
  // Move item from one list to another
  move: (source: any[], destination: any[], droppableSource: any, droppableDestination: any) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    
    destClone.splice(droppableDestination.index, 0, removed);
    
    const result: any = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    
    return result;
  }
};

// Get status badge color
export function getStatusBadgeStyle(status: string, completed?: boolean): string {
  if (completed) {
    return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
  }
  
  switch (status) {
    case 'In Progress':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Not Started':
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

// Get priority badge color
export function getPriorityBadgeStyle(priority: string): string {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'LOW':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

// Check if user is owner of a project
export function isProjectOwner(projectOwnerId?: string, userId?: string): boolean {
  if (!projectOwnerId || !userId) return false;
  return projectOwnerId === userId;
}

// Check if a user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('authToken');
}

// Get user ID from token
export function getUserIdFromToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || decoded.id || decoded.userId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}