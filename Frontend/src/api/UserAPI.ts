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
    console.log('[loginUser] Attempting login with:', data.Email);
    
    // Make API call with the proper data format expected by the API
    const res = await api.post('/auth/login', data);
    
    // Check and extract token from response
    let token: string;
    
    if (typeof res.data === 'string' && res.data.length > 0) {
      // Response is directly the token string
      token = res.data;
    } else if (res.data && typeof res.data === 'object') {
      // If response is an object, look for token in common properties
      token = res.data.token || res.data.access_token || res.data.accessToken || '';
    } else {
      console.error('[loginUser] No valid token found in response:', res.data);
      throw new Error('Login failed: No token received from server');
    }
    
    console.log('[loginUser] Token received successfully');
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Try to extract user info from token if it's a JWT
    let userId = '';
    let userEmail = data.Email; // Default to the email we logged in with
    let firstName = '';
    let lastName = '';
    let role = '';
    
    if (token && token.split('.').length === 3) {
      try {
        // Extract payload from JWT
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        
        // Extract user info from standard JWT claims
        userId = payload.sub || payload.id || payload.userId || '';
        userEmail = payload.email || userEmail;
        firstName = payload.given_name || payload.firstName || '';
        lastName = payload.family_name || payload.lastName || '';
        role = payload.role || '';
        
        console.log('[loginUser] Extracted user info from token:', { userId, userEmail });
      } catch (err) {
        console.warn('[loginUser] Could not parse JWT token:', err);
      }
    }
    
    // If we couldn't extract an ID, generate one based on the email
    // This ensures we have something for permission checks
    if (!userId) {
      // Create a consistent ID based on email that will be the same on each login
      userId = userEmail;
      console.log('[loginUser] Generated userId from email:', userId);
    }
    
    // Create user data object
    const userData: User = {
      Id: userId,
      FirstName: firstName,
      LastName: lastName,
      Email: userEmail,
      Role: role
    };
    
    // Store user data in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('[loginUser] User data stored successfully');
    
    // Update Zustand store
    try {
      useUserStore.getState().setUser(userData);
    } catch (error) {
      console.error('Failed to update user store:', error);
    }
    
    return userData;
  } catch (error: any) {
    // Enhanced error logging
    console.error('[loginUser] Login failed:', error);
    
    if (error.response) {
      console.error('[loginUser] Server responded with:', {
        status: error.response.status,
        data: error.response.data
      });
      
      // Handle specific status codes
      if (error.response.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response.status === 422) {
        const detail = error.response.data?.detail;
        if (detail && Array.isArray(detail) && detail.length > 0) {
          throw new Error(`Validation error: ${detail[0].msg}`);
        }
        throw new Error('Invalid input data');
      } else if (error.response.status === 403) {
        throw new Error('Account locked or email not verified');
      } else if (error.response.status === 429) {
        throw new Error('Too many login attempts. Please try again later');
      }
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Unable to connect to the server. Please check your internet connection');
    }
    
    // Default error
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
    
    const userData = JSON.parse(userDataStr);
    
    // Ensure user has all required fields
    return {
      Id: userData.Id || '',
      FirstName: userData.FirstName || '',
      LastName: userData.LastName || '',
      Email: userData.Email || localStorage.getItem('userEmail') || '',
      Role: userData.Role || ''
    };
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

/**
 * Helper function to get authentication headers for API requests
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('No authentication token found for API request');
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Check if token is expired
 */
export function checkTokenExpiration(): boolean {
  const token = localStorage.getItem('authToken');
  
  if (!token) return false;
  
  try {
    // Handle our locally-generated tokens specially
    if (token.startsWith('user_')) {
      // Don't invalidate locally-generated tokens
      return true;
    }
    
    // For JWT tokens, we need to verify expiration
    if (token.split('.').length === 3) {
      try {
        // Parse JWT payload
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        
        // Check if token has expiration claim
        if (decodedPayload.exp) {
          // exp is in seconds since epoch, Date.now() is in milliseconds
          const isExpired = decodedPayload.exp < Date.now() / 1000;
          
          if (isExpired) {
            // Token expired, handle logout
            logout();
            return false;
          }
          
          return true;
        }
      } catch (jwtError) {
        console.warn('Error parsing JWT token:', jwtError);
        // Continue anyway - we'll treat this as valid
      }
    }
    
    // If we can't determine expiration, assume it's valid
    return true;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
}

/**
 * Checks if current user is the owner/creator of an entity based on multiple possible matches
 * This helps deal with inconsistent ID formats between client and server
 */
export function isCurrentUserOwner(
  ownerId: string | undefined | null,
  ownerEmail?: string | undefined | null,
): boolean {
  try {
    // Get current user info
    const userData = getCurrentUser();
    if (!userData) return false;
    
    const userId = userData.Id;
    const userEmail = userData.Email;
    
    // Try to match based on various possible combinations
    if (ownerId) {
      // Direct ID match
      if (userId && userId === ownerId) return true;
      
      // Email matches owner ID (happens if server uses email as ID)
      if (userEmail && userEmail === ownerId) return true;
    }
    
    // Email-based matching
    if (ownerEmail && userEmail && ownerEmail === userEmail) return true;
    
    // No match found
    return false;
  } catch (error) {
    console.error('Error in isCurrentUserOwner:', error);
    return false;
  }
}

/**
 * Helper specifically for checking if the current user created a task
 * Can be used instead of comparing IDs directly
 */
export function isTaskCreator(task: any): boolean {
  if (!task) return false;
  
  return isCurrentUserOwner(
    task.CreatedBy, 
    task.CreatorEmail || task.UserEmail
  );
}

/**
 * Helper for checking if current user is assigned to a task
 */
export function isTaskAssignee(task: any): boolean {
  if (!task) return false;
  
  return isCurrentUserOwner(
    task.UserId,
    task.UserEmail 
  );
}