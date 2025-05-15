
export function isProjectOwner(user: any, project: any): boolean {
  return user?.Id === project?.OwnerId
}

export function isTeamLeader(user: any, team: any): boolean {
  return user?.Id === team?.LeaderId
}

export function canEditProject(user: any, project: any): boolean {
  return isProjectOwner(user, project)
}

export function canCreateTask(user: any, project: any): boolean {
  return isProjectOwner(user, project)
}

export function canCompleteTask(user: any, task: any): boolean {
  return user?.Id === task?.UserId || user?.Id === task?.CreatedBy
}

export function isStakeholder(user: any, projectStakeholders: any[]): boolean {
  return projectStakeholders?.some(stake => stake.UserId === user?.Id)
}

export function isProjectMember(user: any, projectMembers: any[]): boolean {
  return projectMembers?.some(member => member.UserId === user?.Id)
}
