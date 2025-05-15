import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

// Create context
const DataContext = createContext();

// Data provider component
export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current user first
        const userResponse = await apiService.getCurrentUser();
        setCurrentUser(userResponse.data);
        
        // Fetch all other data in parallel
        const [usersResponse, teamsResponse, projectsResponse, tasksResponse, notificationsResponse] = 
          await Promise.all([
            apiService.getUsers(),
            apiService.getTeams(),
            apiService.getProjects(),
            apiService.getTasks(),
            apiService.getNotifications(userResponse.data.id)
          ]);
        
        setUsers(usersResponse.data);
        setTeams(teamsResponse.data);
        setProjects(projectsResponse.data);
        setTasks(tasksResponse.data);
        setNotifications(notificationsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Individual data fetching functions
  const fetchUser = async (userId) => {
    try {
      const response = await apiService.getUser(userId);
      return response.data;
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      throw err;
    }
  };

  const fetchTeam = async (teamId) => {
    try {
      const response = await apiService.getTeam(teamId);
      return response.data;
    } catch (err) {
      console.error(`Error fetching team ${teamId}:`, err);
      throw err;
    }
  };

  const fetchProject = async (projectId) => {
    try {
      const response = await apiService.getProject(projectId);
      return response.data;
    } catch (err) {
      console.error(`Error fetching project ${projectId}:`, err);
      throw err;
    }
  };

  const fetchTask = async (taskId) => {
    try {
      const response = await apiService.getTask(taskId);
      return response.data;
    } catch (err) {
      console.error(`Error fetching task ${taskId}:`, err);
      throw err;
    }
  };

  // Provide context value
  const contextValue = {
    users,
    teams,
    projects,
    tasks,
    notifications,
    currentUser,
    loading,
    error,
    fetchUser,
    fetchTeam,
    fetchProject,
    fetchTask
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};