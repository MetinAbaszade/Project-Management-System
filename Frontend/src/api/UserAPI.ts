import { api } from '@/lib/axios';
import { useUserStore } from '@/stores/userStore';

export interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
}

export interface UserRegisterData {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
}

export interface UserLoginData {
  Email: string;
  Password: string;
}

export interface EmailVerificationData {
  Email: string;
  VerificationCode: string;
}

/**
 * Register a new user
 */
export async function registerUser(data: UserRegisterData): Promise<any> {
  const res = await api.post('/auth/register', data);
  return res.data;
}

/**
 * Login a user and store token
 */
export async function loginUser(data: UserLoginData): Promise<User> {
  try {
    console.log('[loginUser] sending:', data);
    
    const res = await api.post('/auth/login', data);
    console.log('[loginUser] response:', res.data);
    
    let token;
    
    // Handle different response formats
    if (typeof res.data === 'string') {
      // If the response is a string token directly
      token = res.data;
      console.log('[loginUser] string token:', token);
    } 
    else if (res.data && res.data.access_token) {
      // If response is an object with access_token
      token = res.data.access_token;
      console.log('[loginUser] access_token:', token);
    }
    else if (res.data && res.data.token) {
      // If response has a token field
      token = res.data.token;
      console.log('[loginUser] token field:', token);
    }
    else {
      console.error('Unexpected login response format:', res.data);
      throw new Error('Login failed: invalid token format');
    }
    
    if (!token) {
      throw new Error('Login failed: missing token');
    }
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Decode JWT to extract user information
    let userData: User;
    try {
      const tokenPayload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(tokenPayload));
      console.log('Decoded JWT payload:', decodedPayload);
      
      // Extract user information from JWT payload
      userData = {
        Id: decodedPayload.sub || decodedPayload.id || decodedPayload.userId || `user-${Date.now()}`,
        FirstName: decodedPayload.firstName || decodedPayload.first_name || '',
        LastName: decodedPayload.lastName || decodedPayload.last_name || '',
        Email: decodedPayload.email || data.Email,
        Role: decodedPayload.role || decodedPayload.roles || ''
      };
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      // Fallback to minimal user object if token can't be decoded
      userData = {
        Id: `user-${Date.now()}`,
        FirstName: '',
        LastName: '',
        Email: data.Email,
        Role: ''
      };
    }
    
    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update Zustand store if available
    try {
      useUserStore.getState().setUser(userData);
    } catch (error) {
      console.error('Failed to update user store:', error);
    }
    
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Get current user data from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) {
      return null;
    }
    return JSON.parse(userDataStr);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string | null {
  const userData = getCurrentUser();
  return userData?.Id || null;
}

/**
 * Logout a user
 */
export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  try {
    useUserStore.getState().logout();
  } catch (error) {
    console.error('Failed to update user store on logout:', error);
  }
}

/**
 * Delete current user's account
 */
export async function deleteAccount(): Promise<void> {
  const res = await api.delete('/auth/account');
  logout();
  return res.data;
}

/**
 * Send verification code to email
 */
export async function sendVerificationCode(
  recipientEmail: string
): Promise<{ Success: boolean; Message: string }> {
  const res = await api.post('/email/send-verification-code', null, {
    params: { recipientEmail },
  });
  return res.data;
}

/**
 * Check verification code
 */
export async function checkVerificationCode(
  data: EmailVerificationData
): Promise<{ Success: boolean; Message: string }> {
  const res = await api.post('/email/check-verification-code', data);
  return res.data;
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/projects`);
  return res.data;
}

/**
 * Get all teams for a user
 */
export async function getUserTeams(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/teams`);
  return res.data;
}

/**
 * Get all projects for the current user
 */
export async function getCurrentUserProjects(): Promise<any[]> {
  const res = await api.get('/users/projects');
  return res.data;
}

/**
 * Get all teams for the current user
 */
export async function getCurrentUserTeams(): Promise<any[]> {
  const res = await api.get('/users/teams');
  return res.data;
}

/**
 * Get tasks assigned to a user
 */
export async function getUserAssignedTasks(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/tasks/assigned`);
  return res.data;
}

/**
 * Get tasks created by a user
 */
export async function getUserCreatedTasks(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/tasks/created`);
  return res.data;
}

/**
 * Get tasks assigned to current user
 */
export async function getCurrentUserAssignedTasks(): Promise<any[]> {
  const res = await api.get('/users/tasks/assigned');
  return res.data;
}

/**
 * Get tasks created by current user
 */
export async function getCurrentUserCreatedTasks(): Promise<any[]> {
  const res = await api.get('/users/tasks/created');
  return res.data;
}