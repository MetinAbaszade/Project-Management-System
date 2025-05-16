// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/page.tsx

'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  ListTodo, 
  ClipboardList, 
  Paperclip,
  Pencil, 
  Trash2,
  UserPlus,
  UserMinus,
  Clock,
  AlertCircle,
  Info,
  Save
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// API functions
import { getTeamById, updateTeam, deleteTeam, addTeamMember, removeTeamMember } from '@/api/TeamAPI';
import { getTeamTasks } from '@/api/TaskAPI';
import { getProjectMembers } from '@/api/ProjectAPI';
import { getUserIdFromToken } from '@/lib/utils';

// Components
import MembersTab from './components/MembersTab';
import TasksTab from './components/TasksTab';
import ActivityTab from './components/ActivityTab';
import AttachmentsTab from './components/AttachmentsTab';
import EditTeamDialog from './components/EditTeamDialog';
import AddMemberDialog from './components/AddMemberDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type Tab = 'members' | 'tasks' | 'activity' | 'attachments';

export default function TeamDetailPage() {
  const { id: projectId, teamid: teamId } = useParams() as { id: string, teamid: string };
  const router = useRouter();
  
  // States
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [userRole, setUserRole] = useState({ 
    isOwner: false, 
    isTeamLeader: false
  });
  
  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  
  // Get user ID from token or authentication context
  const getCurrentUserId = () => {
    return getUserIdFromToken();
  };
  
  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        const userId = getCurrentUserId();
        
        // Fetch team data
        const teamData = await getTeamById(teamId);
        setTeam(teamData);
        
        // Fetch project members for add member functionality
        const projectMembersData = await getProjectMembers(projectId);
        setProjectMembers(projectMembersData);
        
        // Determine user role
        const isOwner = teamData.CreatedBy === userId || projectMembersData.some(
          m => m.UserId === userId && m.Role === 'Project Owner'
        );
        const isTeamLeader = teamData.Members?.some(
          m => m.UserId === userId && m.IsLeader
        );
        setUserRole({ isOwner, isTeamLeader });
        
        // Fetch team members and tasks
        const [tasksData] = await Promise.all([
          getTeamTasks(teamId)
        ]);
        
        // Set members (assuming team has Members array)
        setMembers(teamData.Members || []);
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
  
  // Handle team update
  const handleUpdateTeam = async (data: { Name: string; Description: string; ColorIndex: number }) => {
    try {
      const updatedTeam = await updateTeam(teamId, data);
      setTeam(updatedTeam);
      setShowEditDialog(false);
      toast.success('Team updated successfully');
    } catch (error) {
      console.error('Failed to update team:', error);
      toast.error('Could not update team');
    }
  };
  
  // Handle member addition
  const handleAddMember = async (userId: string, role: string, isLeader: boolean) => {
    try {
      await addTeamMember({
        TeamId: teamId,
        UserIdToBeAdded: userId,
        Role: role,
        IsLeader: isLeader
      });
      
      // Re-fetch team to get updated members
      const refreshedTeam = await getTeamById(teamId);
      setTeam(refreshedTeam);
      setMembers(refreshedTeam.Members || []);
      
      setShowAddMemberDialog(false);
      toast.success('Member added successfully');
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error('Could not add member');
    }
  };
  
  // Handle member removal
  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember({
        TeamId: teamId,
        UserIdToBeRemoved: userId
      });
      
      // Update members list
      const updatedMembers = members.filter(member => member.UserId !== userId);
      setMembers(updatedMembers);
      setMemberToRemove(null);
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Could not remove member');
    }
  };
  
  // Generate team color based on ColorIndex
  const getTeamColor = (colorIndex: number = 0) => {
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
  const getTeamInitials = (name: string = '') => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[1][0]).toUpperCase();
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button 
            onClick={() => router.push(`/projects/${projectId}/team`)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Teams
          </button>
        </div>
        
        {/* Action buttons - only shown to owners/leaders */}
        {(userRole.isOwner || userRole.isTeamLeader) && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowEditDialog(true)}
              className="flex items-center px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Team
            </button>
            
            {userRole.isOwner && (
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center px-3 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Team
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Team info card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-8 shadow-sm">
        <div className="p-6 flex items-start justify-between border-b border-border">
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-16 h-16 ${getTeamColor(team.ColorIndex)} rounded-lg flex items-center justify-center text-2xl font-bold`}>
              {getTeamInitials(team.Name)}
            </div>
            <div className="ml-5">
              <h2 className="text-xl font-semibold">{team.Name}</h2>
              <p className="text-muted-foreground mt-1">{team.Description || 'No description provided'}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('members')}
              className={cn(
                "px-4 py-3 flex items-center text-sm font-medium transition-colors",
                activeTab === 'members' 
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="w-4 h-4 mr-2" />
              Members
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={cn(
                "px-4 py-3 flex items-center text-sm font-medium transition-colors",
                activeTab === 'tasks' 
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListTodo className="w-4 h-4 mr-2" />
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                "px-4 py-3 flex items-center text-sm font-medium transition-colors",
                activeTab === 'activity' 
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Activity
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={cn(
                "px-4 py-3 flex items-center text-sm font-medium transition-colors",
                activeTab === 'attachments' 
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Attachments
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MembersTab 
                  members={members}
                  projectMembers={projectMembers}
                  userRole={userRole}
                  onAddMember={() => setShowAddMemberDialog(true)}
                  onRemoveMember={(userId) => setMemberToRemove(userId)}
                />
              </motion.div>
            )}
            
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TasksTab 
                  tasks={tasks}
                  projectId={projectId}
                  teamId={teamId}
                  canCreateTasks={userRole.isOwner || userRole.isTeamLeader}
                />
              </motion.div>
            )}
            
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ActivityTab teamId={teamId} />
              </motion.div>
            )}
            
            {activeTab === 'attachments' && (
              <motion.div
                key="attachments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AttachmentsTab teamId={teamId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Edit Team Dialog */}
      {showEditDialog && (
        <EditTeamDialog
          team={team}
          onClose={() => setShowEditDialog(false)}
          onSave={handleUpdateTeam}
        />
      )}
      
      {/* Add Member Dialog */}
      {showAddMemberDialog && (
        <AddMemberDialog
          projectMembers={projectMembers}
          members={members}
          onClose={() => setShowAddMemberDialog(false)}
          onAddMember={handleAddMember}
        />
      )}
      
      {/* Delete Team Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Team"
          message="Are you sure you want to delete this team? This action cannot be undone."
          confirmLabel="Delete Team"
          cancelLabel="Cancel"
          destructive
          onConfirm={handleDeleteTeam}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
      
      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <ConfirmDialog
          title="Remove Member"
          message="Are you sure you want to remove this member from the team?"
          confirmLabel="Remove Member"
          cancelLabel="Cancel"
          destructive
          onConfirm={() => handleRemoveMember(memberToRemove)}
          onCancel={() => setMemberToRemove(null)}
        />
      )}
    </div>
  );
}