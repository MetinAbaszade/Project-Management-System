import { api } from '@/lib/axios';

export interface Team {
  Id: string;
  Name: string;
  Description: string;
  ColorIndex: number;
  ProjectId: string;
  CreatedAt: string;
  UpdatedAt: string;
  IsDeleted: boolean;
}

export interface TeamCreateData {
  Name: string;
  Description?: string;
  ColorIndex?: number;
  ProjectId: string;
}

export interface TeamUpdateData {
  Name?: string;
  Description?: string;
  ColorIndex?: number;
}

export interface TeamMemberData {
  TeamId: string;
  UserIdToBeAdded: string;
  Role?: string;
  IsLeader?: boolean;
}

export interface TeamMemberRemoveData {
  TeamId: string;
  UserIdToBeRemoved: string;
}

/**
 * Create a new team
 */
export async function createTeam(data: TeamCreateData): Promise<Team> {
  console.log('[TeamAPI] Creating team with data:', data);
  
  try {
    // Ensure all properties are included
    const validatedData = {
      Name: data.Name,
      Description: data.Description || "",
      ColorIndex: data.ColorIndex || 0,
      ProjectId: data.ProjectId
    };
    
    console.log('[TeamAPI] Sending validated data:', validatedData);
    
    const response = await api.post('/teams/', validatedData);
    console.log('[TeamAPI] Create team response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[TeamAPI] Create team error:', error);
    
    // Enhanced error logging with safe property access
    if (error?.response) {
      try {
        console.error('[TeamAPI] Error response details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: JSON.stringify(error.response?.data || {}),
          url: error.response?.config?.url
        });
      } catch (loggingError) {
        console.error('[TeamAPI] Error while logging response:', loggingError);
      }
    } else if (error?.request) {
      console.error('[TeamAPI] No response received:', error.request);
    } else {
      console.error('[TeamAPI] Request setup error:', error.message);
    }
    
    throw error;
  }
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const response = await api.get('/teams/');
    return response.data;
  } catch (error) {
    console.error('[TeamAPI] Error fetching teams:', error);
    return [];
  }
}

/**
 * Get a specific team by ID
 * FIXED: Based on API spec, the team_id is sent as a query parameter
 */
export async function getTeamById(teamId: string): Promise<Team> {
  console.log(`[TeamAPI] Fetching team with ID: ${teamId}`);
  
  try {
    // Use the correct endpoint format per the API spec
    // The endpoint is GET /teams/{team_id} with teamId as a query parameter
    const response = await api.get('/teams', {
      params: { teamId }
    });
    
    console.log('[TeamAPI] Team fetch successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('[TeamAPI] Error fetching team:', error);
    
    // Enhanced error logging
    if (error?.response) {
      try {
        console.error('[TeamAPI] Error response details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: JSON.stringify(error.response?.data || {}),
          url: error.response?.config?.url
        });
      } catch (loggingError) {
        console.error('[TeamAPI] Error while logging response:', loggingError);
      }
    }
    
    throw error;
  }
}

/**
 * Alternative implementation for getTeamById
 * This version treats teamId as a path parameter
 */
export async function getTeamByIdAlt(teamId: string): Promise<Team> {
  console.log(`[TeamAPI] Fetching team with ID (alt method): ${teamId}`);
  
  try {
    // Treat teamId as a path parameter
    const response = await api.get(`/teams/${teamId}`);
    
    console.log('[TeamAPI] Team fetch successful (alt method):', response.data);
    return response.data;
  } catch (error) {
    console.error('[TeamAPI] Error fetching team (alt method):', error);
    
    if (error?.response) {
      try {
        console.error('[TeamAPI] Error response details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: JSON.stringify(error.response?.data || {}),
          url: error.response?.config?.url
        });
      } catch (loggingError) {
        console.error('[TeamAPI] Error while logging response:', loggingError);
      }
    }
    
    throw error;
  }
}

/**
 * Update a team
 */
export async function updateTeam(teamId: string, data: TeamUpdateData): Promise<Team> {
  const response = await api.put(`/teams/${teamId}`, data);
  return response.data;
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId: string): Promise<void> {
  await api.delete(`/teams/${teamId}`, {
    params: { teamId }
  });
}

/**
 * Add a member to a team
 */
export async function addTeamMember(data: TeamMemberData): Promise<string> {
  const response = await api.post('/teams/members', data);
  return response.data;
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(data: TeamMemberRemoveData): Promise<string> {
  const response = await api.delete(`/teams/${data.TeamId}/members/${data.UserIdToBeRemoved}`, {
    data
  });
  return response.data;
}

/**
 * Get all tasks for a team
 */
export async function getTeamTasks(teamId: string): Promise<any[]> {
  try {
    const response = await api.get(`/teams/${teamId}/tasks`, {
      params: { teamId }
    });
    return response.data;
  } catch (error) {
    console.error('[TeamAPI] Error fetching team tasks:', error);
    return [];
  }
}

/**
 * Get all teams for a project
 */
export async function getProjectTeams(projectId: string): Promise<Team[]> {
  try {
    // Filter teams by project ID from getAllTeams since specific endpoint might not be available
    const allTeams = await getAllTeams();
    return allTeams.filter(team => team.ProjectId === projectId);
  } catch (error) {
    console.error('[TeamAPI] Error fetching project teams:', error);
    return [];
  }
}