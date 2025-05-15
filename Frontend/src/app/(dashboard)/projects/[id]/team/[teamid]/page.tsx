"use client"
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Clock, 
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { toast } from '@/lib/toast';

// Mock API functions - replace with your actual API functions
import { getTeamById, updateTeam, deleteTeam, addTeamMember, removeTeamMember } from '@/api/TeamAPI';
import { getTeamTasks, assignTaskToTeam } from '@/api/TaskAPI';
import { getProjectMembers } from '@/api/ProjectAPI';

export default function TeamDetailPage() {
  const { id: projectId, teamid: teamId } = useParams();
  const router = useRouter();
  
  // States
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState({ 
    isOwner: false, 
    isTeamLeader: false
  });
  
  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  
  // Determine user role from JWT token or some other auth method
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || decoded.id || decoded.userId;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };
  
  // Fetch team data and other related info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        const userId = getUserIdFromToken();
        
        // Fetch team, members and tasks in parallel
        const [teamData, projectMembersData] = await Promise.all([
          getTeamById(teamId),
          getProjectMembers(projectId)
        ]);
        
        setTeam(teamData);
        setProjectMembers(projectMembersData);
        
        // Determine user role
        const isOwner = teamData.ProjectOwnerId === userId;
        const isTeamLeader = teamData.LeaderId === userId;
        setUserRole({ isOwner, isTeamLeader });
        
        // Get team members and tasks
        const [membersData, tasksData] = await Promise.all([
          // Assume team has members array or fetch them if not
          teamData.members || [], 
          getTeamTasks(teamId)
        ]);
        
        setMembers(membersData);
        setTasks(tasksData || []);
      } catch (error) {
        console.error('Failed to load team data:', error);
        toast.error('Could not load team details');
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId && projectId) {
      fetchData();
    }
  }, [teamId, projectId]);
  
  // Handle team deletion
  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(teamId);
      toast.success('Team deleted successfully');
      router.push(`/projects/${projectId}/team`);
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Could not delete team');
    }
  };
  
  // Handle member addition
  const handleAddMember = async (userId, role, isLeader) => {
    try {
      await addTeamMember({
        TeamId: teamId,
        UserIdToBeAdded: userId,
        Role: role,
        IsLeader: isLeader
      });
      
      // Update members list
      const updatedMembers = [...members, {
        UserId: userId,
        Role: role,
        IsLeader: isLeader,
        // Add other member details as needed
      }];
      
      setMembers(updatedMembers);
      setShowAddMemberModal(false);
      toast.success('Member added successfully');
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error('Could not add member');
    }
  };
  
  // Handle member removal
  const handleRemoveMember = async (userId) => {
    try {
      await removeTeamMember({
        TeamId: teamId,
        UserIdToBeRemoved: userId
      });
      
      // Update members list
      const updatedMembers = members.filter(member => member.UserId !== userId);
      setMembers(updatedMembers);
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Could not remove member');
    }
  };
  
  // Handle task assignment
  const handleAssignTask = async (taskId) => {
    try {
      await assignTaskToTeam(taskId, teamId);
      
      // Update tasks list - in real app, fetch the updated task and add it
      toast.success('Task assigned successfully');
      setShowAssignTaskModal(false);
    } catch (error) {
      console.error('Failed to assign task:', error);
      toast.error('Could not assign task');
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading team details...</p>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Team Not Found</h2>
        <p className="text-muted-foreground mb-6">The team you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => router.push(`/projects/${projectId}/team`)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Teams
        </button>
      </div>
    );
  }
  
  // Team color generation based on colorIndex
  const getTeamColor = (colorIndex) => {
    const colors = [
      'bg-rose-500 text-white',
      'bg-orange-500 text-white',
      'bg-amber-500 text-white',
      'bg-green-500 text-white',
      'bg-sky-500 text-white',
      'bg-blue-500 text-white',
      'bg-violet-500 text-white',
      'bg-fuchsia-500 text-white'
    ];
    
    return colors[colorIndex % colors.length] || colors[0];
  };

  // Get team initials from name
  const getTeamInitials = (name) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const roleLabels = {
    'Project Owner': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Team Leader': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Member': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.push(`/projects/${projectId}/team`)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Teams
        </button>
        <h1 className="text-2xl font-bold">Team Details</h1>
      </div>
      
      {/* Team info card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-8 shadow-sm">
        <div className="p-6 flex items-start justify-between border-b border-border">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-16 h-16 ${getTeamColor(team.ColorIndex || 0)} rounded-lg flex items-center justify-center text-2xl font-bold`}>
              {getTeamInitials(team.Name)}
            </div>
            <div className="ml-5">
              <h2 className="text-xl font-semibold">{team.Name}</h2>
              <p className="text-muted-foreground mt-1">{team.Description || 'No description provided'}</p>
            </div>
          </div>
          
          {/* Action buttons - only shown to owners/leaders */}
          {(userRole.isOwner || userRole.isTeamLeader) && (
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`/projects/${projectId}/team/${teamId}/edit`)}
                className="flex items-center px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Team
              </button>
              
              <button 
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </button>
              
              {userRole.isOwner && (
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center px-3 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Team
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Team members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team Members
              </h3>
              
              {(userRole.isOwner || userRole.isTeamLeader) && (
                <button 
                  onClick={() => setShowAddMemberModal(true)}
                  className="text-sm text-primary hover:text-primary/90 transition-colors"
                >
                  + Add Member
                </button>
              )}
            </div>
            
            {members.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Users className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No members in this team yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.UserId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                        {member.User?.FirstName?.[0] || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{member.User?.FirstName} {member.User?.LastName}</div>
                        <div className="text-xs text-muted-foreground">{member.User?.Email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        member.UserId === team.ProjectOwnerId ? roleLabels['Project Owner'] :
                        member.IsLeader ? roleLabels['Team Leader'] : roleLabels['Member']
                      }`}>
                        {member.UserId === team.ProjectOwnerId ? 'Project Owner' :
                         member.IsLeader ? 'Team Leader' : 'Member'}
                      </span>
                      
                      {(userRole.isOwner || userRole.isTeamLeader) && 
                       member.UserId !== team.ProjectOwnerId && (
                        <button 
                          onClick={() => handleRemoveMember(member.UserId)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Team tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Team Tasks
              </h3>
              
              {(userRole.isOwner || userRole.isTeamLeader) && (
                <button 
                  onClick={() => setShowAssignTaskModal(true)}
                  className="text-sm text-primary hover:text-primary/90 transition-colors"
                >
                  + Assign Task
                </button>
              )}
            </div>
            
            {tasks.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-muted-foreground">No tasks assigned to this team yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.Id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{task.Title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.Status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        task.Status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {task.Status || 'Not Started'}
                      </span>
                    </div>
                    
                    {task.Description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.Description}</p>
                    )}
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      {task.Deadline && (
                        <div className="flex items-center mr-4">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.Deadline).toLocaleDateString()}
                        </div>
                      )}
                      
                      {task.UserId && (
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          Assigned to {task.UserId === getUserIdFromToken() ? 'you' : 'a team member'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Team statistics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="text-muted-foreground mb-2 text-sm">Total Members</div>
          <div className="text-2xl font-bold mb-1">{members.length}</div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            {members.filter(m => m.IsLeader).length} leaders, {members.length - members.filter(m => m.IsLeader).length} members
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="text-muted-foreground mb-2 text-sm">Active Tasks</div>
          <div className="text-2xl font-bold mb-1">{tasks.filter(t => !t.Completed).length}</div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            {tasks.filter(t => t.Status === 'In Progress').length} in progress
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="text-muted-foreground mb-2 text-sm">Completed Tasks</div>
          <div className="text-2xl font-bold mb-1">{tasks.filter(t => t.Completed).length}</div>
          <div className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 mr-1" />
            {tasks.filter(t => t.Completed).length > 0 ? `${Math.round((tasks.filter(t => t.Completed).length / tasks.length) * 100)}% completion rate` : 'No completed tasks'}
          </div>
        </div>
      </div>
      
      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select User</label>
                <select className="w-full p-2 rounded-md border border-input bg-background">
                  <option value="">Select a user...</option>
                  {projectMembers
                    .filter(m => !members.some(member => member.UserId === m.UserId))
                    .map(member => (
                      <option key={member.UserId} value={member.UserId}>
                        {member.User?.FirstName} {member.User?.LastName}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Developer, Designer, etc." 
                  className="w-full p-2 rounded-md border border-input bg-background"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="is-leader" 
                  className="mr-2"
                />
                <label htmlFor="is-leader" className="text-sm">Make team leader</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // In real app, get values from form inputs
                  handleAddMember('user123', 'Developer', false);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Team Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Team</h3>
            <p className="text-muted-foreground mb-4">Are you sure you want to delete this team? This action cannot be undone.</p>
            
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTeam}
                className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md text-sm transition-colors"
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Assign Task Modal */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Assign Task to Team</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input 
                  type="text" 
                  placeholder="Enter task title" 
                  className="w-full p-2 rounded-md border border-input bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  placeholder="Enter task description" 
                  className="w-full p-2 rounded-md border border-input bg-background min-h-[100px]"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input 
                  type="date" 
                  className="w-full p-2 rounded-md border border-input bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select className="w-full p-2 rounded-md border border-input bg-background">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowAssignTaskModal(false)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // In real app, get values from form inputs
                  handleAssignTask('task123');
                }}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm transition-colors"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}