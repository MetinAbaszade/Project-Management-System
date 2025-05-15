const API_BASE_URL = 'http://localhost:8000';

export interface Project {
  Id: string;
  Name: string;
  Description: string;
  Deadline: string | null;
  TotalBudget: number;
  Progress?: number;
  CreatedAt: string;
  UpdatedAt?: string;
  IsDeleted: boolean;
  OwnerId: string;
  teams?: any[];
  members?: any[];
  stakeholders?: any[];
}

export interface ProjectCreateData {
  Name: string;
  Description?: string;
  Deadline?: string | null;
  StatusId: string;
  Budget: number;
  IsDeleted?: boolean;
}

export interface ProjectUpdateData {
  Name?: string;
  Description?: string;
  Deadline?: string | null;
  Budget?: number;
  Progress?: number;
  StatusId?: string;
  IsDeleted?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export async function checkServerConnection(): Promise<boolean> {
  try {
    await fetch(`${API_BASE_URL}/`, { method: 'HEAD', mode: 'cors' });
    return true;
  } catch (error) {
    console.error('Backend server connection error:', error);
    return false;
  }
}

export async function getProjects(): Promise<Project[]> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/users/projects`, { method: 'GET', headers });

  if (!response.ok) throw new Error(`Failed to fetch projects: ${response.status}`);
  return response.json();
}

export async function getProjectById(projectId: string): Promise<Project> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, { method: 'GET', headers });

  if (!response.ok) throw new Error(`Failed to fetch project: ${response.status}`);
  return response.json();
}

export async function createProject(data: ProjectCreateData): Promise<Project> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    let errorMessage = `Server error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function updateProject(projectId: string, data: ProjectUpdateData): Promise<Project> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error(`Failed to update project: ${response.status}`);
  return response.json();
}

export async function deleteProject(projectId: string): Promise<string> {
  const headers = {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/delete`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ IsDeleted: true }),  
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete project: ${response.status} - ${errorText}`);
  }

  return response.json(); 
}




export async function getProjectMembers(projectId: string): Promise<any[]> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
    method: 'GET',
    headers
  });

  if (!response.ok) throw new Error(`Failed to fetch project members: ${response.status}`);
  return response.json();
}

export async function addProjectMember(projectId: string, memberId: string): Promise<any> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/add-member?memberId=${memberId}`, {
    method: 'POST',
    headers
  });

  if (!response.ok) throw new Error(`Failed to add project member: ${response.status}`);
  return response.json();
}

export async function removeProjectMember(projectId: string, memberId: string): Promise<any> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/remove-member/${memberId}`, {
    method: 'DELETE',
    headers
  });

  if (!response.ok) throw new Error(`Failed to remove project member: ${response.status}`);
  return response.json();
}

export async function getProjectTeams(projectId: string): Promise<any[]> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/teams`, {
    method: 'GET',
    headers
  });

  if (!response.ok) throw new Error(`Failed to fetch project teams: ${response.status}`);
  return response.json();
}

export async function getProjectTasks(projectId: string): Promise<any[]> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
    method: 'GET',
    headers
  });

  if (!response.ok) throw new Error(`Failed to fetch project tasks: ${response.status}`);
  return response.json();
}
