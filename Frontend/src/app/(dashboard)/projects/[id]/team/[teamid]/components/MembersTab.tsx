// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/MembersTab.tsx

import { useState } from 'react';
import { User, UserPlus, UserMinus, Shield, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MembersTabProps {
  members: any[];
  projectMembers: any[];
  userRole: { isOwner: boolean; isTeamLeader: boolean };
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
}

export default function MembersTab({ 
  members, 
  projectMembers, 
  userRole, 
  onAddMember, 
  onRemoveMember 
}: MembersTabProps) {
  
  const roleLabels = {
    'Project Owner': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Team Leader': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Member': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <User className="w-5 h-5 mr-2" />
          Team Members
        </h3>
        
        {(userRole.isOwner || userRole.isTeamLeader) && (
          <button 
            onClick={onAddMember}
            className="flex items-center text-sm px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </button>
        )}
      </div>
      
      {members.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <User className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-muted-foreground">No members in this team yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.UserId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                  {member.User?.FirstName?.[0] || member.FirstName?.[0] || 'U'}
                </div>
                <div className="ml-3">
                  <div className="font-medium">
                    {member.User?.FirstName || member.FirstName} {member.User?.LastName || member.LastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member.User?.Email || member.Email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full flex items-center",
                  member.Role === 'Project Owner' ? roleLabels['Project Owner'] :
                  member.IsLeader ? roleLabels['Team Leader'] : roleLabels['Member']
                )}>
                  {member.Role === 'Project Owner' ? 
                    <><Crown className="h-3 w-3 mr-1" /> Project Owner</> :
                   member.IsLeader ? 
                    <><Shield className="h-3 w-3 mr-1" /> Team Leader</> : 
                    'Member'}
                </span>
                
                {(userRole.isOwner || userRole.isTeamLeader) && 
                 member.Role !== 'Project Owner' && !member.IsLeader && (
                  <button 
                    onClick={() => onRemoveMember(member.UserId)}
                    className="p-1.5 text-muted-foreground hover:text-destructive bg-muted/70 rounded-full hover:bg-destructive/10 transition-colors"
                    title="Remove Member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}