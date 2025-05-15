import { useMemo } from 'react';

type ProjectWithRoles = {
  OwnerId?: string;
  teams?: { LeaderId?: string }[];
  stakeholders?: { UserId?: string }[];
  members?: { UserId?: string }[];
};

type UserProjectRole = {
  role: 'Project Owner' | 'Team Leader' | 'Stakeholder' | 'Member' | 'Viewer';
  isOwner: boolean;
  isTeamLeader: boolean;
  isStakeholder: boolean;
  isMember: boolean;
};

export function useUserProjectRole({ 
  project, 
  userId 
}: { 
  project: ProjectWithRoles | null;
  userId?: string;
}): UserProjectRole {
  
  return useMemo(() => {
    // Default state - no permissions
    const defaultRole: UserProjectRole = {
      role: 'Viewer',
      isOwner: false,
      isTeamLeader: false, 
      isStakeholder: false,
      isMember: false
    };
    
    // If project or userId is null, return default
    if (!project || !userId) {
      return defaultRole;
    }
    
    // Check if user is project owner
    if (project.OwnerId === userId) {
      return {
        role: 'Project Owner',
        isOwner: true,
        isTeamLeader: false,
        isStakeholder: false,
        isMember: false
      };
    }
    
    // Check if user is a team leader
    const isTeamLead = project.teams?.some(team => team.LeaderId === userId) || false;
    if (isTeamLead) {
      return {
        role: 'Team Leader',
        isOwner: false,
        isTeamLeader: true,
        isStakeholder: false,
        isMember: false
      };
    }
    
    // Check if user is a stakeholder
    const isStake = project.stakeholders?.some(s => s.UserId === userId) || false;
    if (isStake) {
      return {
        role: 'Stakeholder',
        isOwner: false,
        isTeamLeader: false,
        isStakeholder: true,
        isMember: false
      };
    }
    
    // Check if user is a team member
    const isMem = project.members?.some(m => m.UserId === userId) || false;
    if (isMem) {
      return {
        role: 'Member',
        isOwner: false,
        isTeamLeader: false,
        isStakeholder: false,
        isMember: true
      };
    }
    
    // Default fallback
    return defaultRole;
  }, [project, userId]);
}