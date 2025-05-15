import { useMemo } from 'react';
import { useUser } from './useUser';

export function useProjectRole(project: any) {
  const { user } = useUser();
  
  return useMemo(() => {
    if (!project || !user) {
      return {
        role: 'guest',
        isOwner: false,
        isTeamLeader: false,
        isStakeholder: false,
        isMember: false,
        canEditProject: false,
        canCreateTask: false,
        canManageTeam: false,
      };
    }
    
    // Determine basic roles
    const isOwner = project.OwnerId === user.Id;
    const isTeamLeader = project.teams?.some(team => team.LeaderId === user.Id);
    const isStakeholder = project.stakeholders?.some(s => s.UserId === user.Id);
    const isMember = project.members?.some(m => m.UserId === user.Id);
    
    // Determine role string
    let role = 'guest';
    if (isOwner) role = 'Project Owner';
    else if (isTeamLeader) role = 'Team Leader';
    else if (isStakeholder) role = 'Stakeholder';
    else if (isMember) role = 'Member';
    
    // Determine permissions
    const canEditProject = isOwner;
    const canCreateTask = isOwner || isTeamLeader;
    const canManageTeam = isOwner || isTeamLeader;
    
    return {
      role,
      isOwner,
      isTeamLeader,
      isStakeholder,
      isMember,
      canEditProject,
      canCreateTask,
      canManageTeam,
    };
  }, [project, user]);
}