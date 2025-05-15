'use client'

import { useEffect, useState } from 'react'
import { getProjectTeams, getProjectMembers } from '@/api/ProjectAPI'
import { createTeam, deleteTeam, addTeamMember, removeTeamMember } from '@/api/TeamAPI'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog } from '@/components/ui/dialog'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { useAuth } from '@/contexts/AuthContext'
import { TeamCard } from './TeamCard'
import { motion } from 'framer-motion'
import { Users, Plus, Users2, UserPlus, Trash2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface ProjectTeamProps {
  projectId: string;
  userRole: string;
}

export function ProjectTeam({ projectId, userRole }: ProjectTeamProps) {
  const { user } = useAuth()
  const [teams, setTeams] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null)
  
  // Dialog states
  const [createTeamDialog, setCreateTeamDialog] = useState(false)
  const [addMemberDialog, setAddMemberDialog] = useState(false)
  const [deleteTeamDialog, setDeleteTeamDialog] = useState(false)
  
  // Form states
  const [newTeam, setNewTeam] = useState({ Name: '', Description: '', ColorIndex: 0 })
  const [selectedUserId, setSelectedUserId] = useState('')

  // Check if user can manage teams
  const canManageTeams = ['Project Owner', 'Team Leader'].includes(userRole)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [teamsData, membersData] = await Promise.all([
          getProjectTeams(projectId),
          getProjectMembers(projectId)
        ])
        
        setTeams(teamsData || [])
        setMembers(membersData || [])
        
        // For demo, we'll assume available users are just the project members
        // In a real app, you'd fetch from a user directory
        setAvailableUsers(membersData || [])
      } catch (error) {
        console.error('Failed to load team data:', error)
        toast.error('Failed to load teams information')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [projectId])

  const handleCreateTeam = async () => {
    if (!newTeam.Name.trim()) {
      toast.error('Team name is required')
      return
    }
    
    try {
      const team = await createTeam({
        Name: newTeam.Name,
        Description: newTeam.Description,
        ColorIndex: newTeam.ColorIndex,
        ProjectId: projectId
      })
      
      setTeams(prev => [...prev, team])
      setCreateTeamDialog(false)
      setNewTeam({ Name: '', Description: '', ColorIndex: 0 })
      toast.success('Team created successfully')
    } catch (error) {
      console.error('Failed to create team:', error)
      toast.error('Failed to create team')
    }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return
    
    try {
      await deleteTeam(selectedTeam.Id)
      setTeams(prev => prev.filter(t => t.Id !== selectedTeam.Id))
      setDeleteTeamDialog(false)
      setSelectedTeam(null)
      toast.success('Team deleted successfully')
    } catch (error) {
      console.error('Failed to delete team:', error)
      toast.error('Failed to delete team')
    }
  }

  const handleAddMember = async () => {
    if (!selectedTeam || !selectedUserId) return
    
    try {
      await addTeamMember({
        TeamId: selectedTeam.Id,
        UserIdToBeAdded: selectedUserId,
        Role: 'Member'
      })
      
      // Refresh teams data
      const teamsData = await getProjectTeams(projectId)
      setTeams(teamsData || [])
      
      setAddMemberDialog(false)
      setSelectedUserId('')
      toast.success('Member added to team')
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error('Failed to add member to team')
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await removeTeamMember({
        TeamId: teamId,
        UserIdToBeRemoved: userId
      })
      
      // Refresh teams data
      const teamsData = await getProjectTeams(projectId)
      setTeams(teamsData || [])
      
      toast.success('Member removed from team')
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member from team')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <GlassPanel className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Teams</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and organize project teams
            </p>
          </div>
          
          {canManageTeams && (
            <Button onClick={() => setCreateTeamDialog(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Team
            </Button>
          )}
        </div>
      </GlassPanel>

      {teams.length === 0 ? (
        <EmptyState 
          title="No Teams"
          description="This project has no teams yet. Create a team to organize your project members."
          icon={<Users className="h-12 w-12" />}
          action={canManageTeams && (
            <Button onClick={() => setCreateTeamDialog(true)}>
              Create Team
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard 
              key={team.Id} 
              team={team} 
              userRole={userRole}
              onManage={() => {
                setSelectedTeam(team)
                setAddMemberDialog(true)
              }}
              onDelete={() => {
                setSelectedTeam(team)
                setDeleteTeamDialog(true)
              }}
            />
          ))}
        </div>
      )}

      {/* Project Members List */}
      {members.length > 0 && (
        <GlassPanel className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Members</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div 
                key={member.UserId} 
                className="flex items-center p-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {member.User?.FirstName} {member.User?.LastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.User?.Email}
                  </div>
                </div>
                
                {member.Role && (
                  <Badge className={cn(
                    member.Role === 'Project Owner' ? 'bg-primary' : 'bg-muted'
                  )}>
                    {member.Role}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Create Team Dialog */}
      <Dialog
        open={createTeamDialog}
        onOpenChange={setCreateTeamDialog}
        title="Create New Team"
        description="Create a team to organize your project members"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              value={newTeam.Name}
              onChange={(e) => setNewTeam({ ...newTeam, Name: e.target.value })}
              placeholder="e.g. Design Team"
            />
          </div>
          
          <div>
            <Label htmlFor="team-description">Description</Label>
            <Input
              id="team-description"
              value={newTeam.Description}
              onChange={(e) => setNewTeam({ ...newTeam, Description: e.target.value })}
              placeholder="e.g. Team responsible for design tasks"
            />
          </div>
          
          <div>
            <Label htmlFor="team-color">Color Index</Label>
            <Input
              id="team-color"
              type="number"
              min="0"
              max="9"
              value={newTeam.ColorIndex}
              onChange={(e) => setNewTeam({ ...newTeam, ColorIndex: parseInt(e.target.value) || 0 })}
              placeholder="0-9"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setCreateTeamDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTeam}>
            Create Team
          </Button>
        </div>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberDialog}
        onOpenChange={setAddMemberDialog}
        title={`Add Member to ${selectedTeam?.Name}`}
        description="Add a project member to this team"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="member-select">Select Member</Label>
            <select
              id="member-select"
              className="w-full p-2 rounded-md border border-input bg-background"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select a member</option>
              {availableUsers.map((user) => (
                <option key={user.UserId} value={user.UserId}>
                  {user.User?.FirstName} {user.User?.LastName} ({user.User?.Email})
                </option>
              ))}
            </select>
          </div>
          
          {selectedTeam && (
            <div className="border rounded-md p-3 space-y-2">
              <h4 className="font-medium">Current Team Members</h4>
              {selectedTeam.members?.length > 0 ? (
                <div className="space-y-2">
                  {selectedTeam.members.map((member) => (
                    <div 
                      key={member.UserId} 
                      className="flex justify-between items-center p-2 bg-white/5 rounded-md"
                    >
                      <span>
                        {member.User?.FirstName} {member.User?.LastName}
                      </span>
                      
                      {canManageTeams && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(selectedTeam.Id, member.UserId)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members in this team</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setAddMemberDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddMember}
            disabled={!selectedUserId}
          >
            Add Member
          </Button>
        </div>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog
        open={deleteTeamDialog}
        onOpenChange={setDeleteTeamDialog}
        title={`Delete Team: ${selectedTeam?.Name}`}
        description="This action cannot be undone. This will permanently delete the team and remove all members from it."
      >
        <div className="space-y-4">
          <p className="text-sm text-red-500">
            Warning: All team members will be removed from this team, but they will remain as project members.
          </p>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setDeleteTeamDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteTeam}
          >
            Delete Team
          </Button>
        </div>
      </Dialog>
    </motion.div>
  )
}