// Frontend/src/components/project/ProjectMembers.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  getProjectMembers, 
  addProjectMember, 
  removeProjectMember 
} from '@/api/ProjectAPI';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Loader2, 
  Users, 
  UserMinus, 
  AlertCircle, 
  Search 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ProjectMembersProps {
  projectId: string;
  isOwner: boolean;
}

export function ProjectMembers({ projectId, isOwner }: ProjectMembersProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getProjectMembers(projectId);
      setMembers(data || []);
    } catch (error) {
      console.error('Failed to load project members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const handleSearchUsers = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setAvailableUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      // In a real app, this would call an API to search users
      // This is mock data - in a real app, you'd fetch from the server
      const mockUsers = [
        { Id: 'user1', FirstName: 'Jane', LastName: 'Doe', Email: 'jane@example.com' },
        { Id: 'user2', FirstName: 'John', LastName: 'Smith', Email: 'john@example.com' },
        { Id: 'user3', FirstName: 'Alex', LastName: 'Johnson', Email: 'alex@example.com' },
      ].filter(u => 
        u.FirstName.toLowerCase().includes(term.toLowerCase()) || 
        u.LastName.toLowerCase().includes(term.toLowerCase()) ||
        u.Email.toLowerCase().includes(term.toLowerCase())
      );
      
      // Add a delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAvailableUsers(mockUsers);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    
    try {
      await addProjectMember(projectId, selectedUserId);
      toast.success('Member added successfully');
      setShowAddDialog(false);
      setSelectedUserId(null);
      loadMembers();
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error('Failed to add team member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await removeProjectMember(projectId, memberId);
      toast.success('Member removed successfully');
      setMembers(prev => prev.filter(m => m.UserId !== memberId));
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove team member');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Members</h2>
        {isOwner && (
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <p className="text-lg font-medium">No team members yet</p>
          <p className="text-muted-foreground mb-6">
            {isOwner 
              ? 'Add team members to collaborate on this project' 
              : 'The project owner can add members to this project'}
          </p>
          {isOwner && (
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Your First Team Member
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {members.map((member, index) => (
            <motion.div
              key={member.UserId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-4">
                  {member.User?.FirstName?.charAt(0) || '?'}
                  {member.User?.LastName?.charAt(0) || ''}
                </div>
                <div>
                  <div className="font-medium">
                    {member.User?.FirstName} {member.User?.LastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.User?.Email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {member.UserId === user?.Id && (
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                    You
                  </span>
                )}
                
                {isOwner && member.UserId !== user?.Id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.UserId)}
                    disabled={removingId === member.UserId}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {removingId === member.UserId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Search for users to add to this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
            </div>

            <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : availableUsers.length > 0 ? (
                <div className="space-y-2">
                  {availableUsers.map(user => (
                    <div
                      key={user.Id}
                      onClick={() => setSelectedUserId(user.Id)}
                      className={cn(
                        "p-3 rounded-md cursor-pointer flex items-center",
                        selectedUserId === user.Id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                        {user.FirstName.charAt(0)}
                        {user.LastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.FirstName} {user.LastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.Email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No users found matching "{searchTerm}"</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Search for users to add to this project</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setSelectedUserId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId}
              >
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}