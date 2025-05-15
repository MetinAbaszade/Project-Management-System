 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProjects, getProjectById } from '@/api/ProjectAPI'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/lib/toast'
import { launchConfetti } from '@/lib/confetti'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const baseProjects = await getProjects()

        const projectsWithDetails = await Promise.all(
          baseProjects.map(async (p) => {
            try {
              const full = await getProjectById(p.Id)
              return { ...p, ...full }
            } catch (err) {
              console.warn(`Fallback to base project for ID ${p.Id}`, err)
              return p
            }
          })
        )

        setProjects(projectsWithDetails)
      } catch (error) {
        console.error('Failed to load projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleCreateProject = () => {
    router.push('/projects/create')
    launchConfetti()
  }

  const groupedProjects = projects.reduce((acc, project) => {
    const deadline = project.Deadline ? new Date(project.Deadline) : null
    let status = 'ongoing'

    if (deadline) {
      if (isPast(deadline) && project.Progress < 100) status = 'overdue'
      else if (isToday(deadline)) status = 'dueToday'
      else if (differenceInDays(deadline, new Date()) <= 7) status = 'dueSoon'
    }

    if (project.Progress >= 100) status = 'completed'
    acc[status] = [...(acc[status] || []), project]
    return acc
  }, {})

    return (
      <div className="min-h-full pb-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-500/30 opacity-50 blur-2xl -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 pt-12 pb-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Project Dashboard
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4"
              >
                Manage and track all your projects in one place
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <button
                  onClick={handleCreateProject}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full 
                            text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-primary shadow-lg shadow-primary/20 transition-all duration-200"
                >
                  <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Project
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Projects Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState onCreateProject={handleCreateProject} />
          ) : (
            <div className="space-y-12">
              {/* Overdue Projects Section */}
              {groupedProjects.overdue && groupedProjects.overdue.length > 0 && (
                <ProjectSection 
                  title="Attention Required" 
                  subtitle="These projects are past their deadline"
                  projects={groupedProjects.overdue}
                  currentUser={user}
                  router={router}
                  accentColor="bg-red-500"
                />
              )}
              
              {/* Due Today Section */}
              {groupedProjects.dueToday && groupedProjects.dueToday.length > 0 && (
                <ProjectSection 
                  title="Due Today" 
                  subtitle="Final push to complete these projects"
                  projects={groupedProjects.dueToday}
                  currentUser={user}
                  router={router}
                  accentColor="bg-amber-500"
                />
              )}
              
              {/* Upcoming Deadlines */}
              {groupedProjects.dueSoon && groupedProjects.dueSoon.length > 0 && (
                <ProjectSection 
                  title="Due This Week" 
                  subtitle="Projects with approaching deadlines"
                  projects={groupedProjects.dueSoon}
                  currentUser={user}
                  router={router}
                  accentColor="bg-blue-500"
                />
              )}
              
              {/* Active Projects */}
              {groupedProjects.ongoing && groupedProjects.ongoing.length > 0 && (
                <ProjectSection 
                  title="Active Projects" 
                  subtitle="Your ongoing work"
                  projects={groupedProjects.ongoing}
                  currentUser={user}
                  router={router}
                  accentColor="bg-primary"
                />
              )}
              
              {/* Completed Projects */}
              {groupedProjects.completed && groupedProjects.completed.length > 0 && (
                <ProjectSection 
                  title="Completed" 
                  subtitle="Successfully finished projects"
                  projects={groupedProjects.completed}
                  currentUser={user}
                  router={router}
                  accentColor="bg-green-500"
                />
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  function ProjectSection({ title, subtitle, projects, currentUser, router, accentColor }) {
    return (
      <div>
        <div className="flex items-center mb-4">
          <div className={`h-6 w-1 rounded-full ${accentColor} mr-3`}></div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <ProjectCard 
              key={project.Id} 
              project={project} 
              currentUser={currentUser}
              onClick={() => router.push(`/projects/${project.Id}`)}
            />
          ))}
        </div>
      </div>
    )
  }

function ProjectCard({ project, currentUser, onClick }) {
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
  
  // Simple role detection using token as backup
  const determineUserRole = () => {
    // Get user ID from either currentUser object or token
    const userId = currentUser?.Id || getUserIdFromToken();
    if (!userId) return { label: 'Viewer', color: '#6B7280' };
    
    // Check if user is the project owner
    if (userId === project.OwnerId) {
      return { label: 'Project Owner', color: '#8B5CF6' };
    }
    
    // Check if user is a team leader
    const isTeamLeader = Array.isArray(project.teams) && 
      project.teams.some(team => team.LeaderId === userId);
    
    if (isTeamLeader) {
      return { label: 'Team Leader', color: '#EC4899' };
    }
    
    // Check if user is a stakeholder
    const isStakeholder = Array.isArray(project.stakeholders) && 
      project.stakeholders.some(stake => stake.UserId === userId);
    
    if (isStakeholder) {
      return { label: 'Stakeholder', color: '#F59E0B' };
    }
    
    // Check if user is a member
    const isMember = Array.isArray(project.members) && 
      project.members.some(member => member.UserId === userId);
    
    if (isMember) {
      return { label: 'Member', color: '#3B82F6' };
    }
    
    // Default - viewer with access but no specific role
    return { label: 'Viewer', color: '#6B7280' };
  };
  
  const roleInfo = determineUserRole();
  const deadline = project.Deadline ? new Date(project.Deadline) : null;
  const isOverdue = deadline && isPast(deadline) && project.Progress < 100;
  const isDueToday = deadline && isToday(deadline);
  const progress = project.Progress || 0;
  
  // Deadline calculation
  let deadlineText = 'No deadline set';
  let deadlineStatus = '';
  
  if (deadline) {
    const daysLeft = differenceInDays(deadline, new Date());
    
    if (isOverdue) {
      deadlineText = `${Math.abs(daysLeft)} days overdue`;
      deadlineStatus = 'text-red-500';
    } else if (isDueToday) {
      deadlineText = 'Due today';
      deadlineStatus = 'text-amber-500 font-semibold';
    } else if (daysLeft <= 7) {
      deadlineText = `${daysLeft} days left`;
      deadlineStatus = 'text-amber-500';
    } else {
      deadlineText = format(deadline, 'MMM d, yyyy');
    }
  }
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <div 
        onClick={onClick}
        className="cursor-pointer h-full rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.07] to-white/[0.03] 
                  backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <div 
          className={`h-1.5 w-full ${isOverdue ? 'bg-red-500' : isDueToday ? 'bg-amber-500' : progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
        ></div>
        
        <div className="p-6">
          {/* Project Title and Role */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold tracking-tight">
              {project.Name}
            </h3>
            
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${roleInfo.color}20`, 
                color: roleInfo.color
              }}
            >
              {roleInfo.label}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground line-clamp-2 mb-6">
            {project.Description || 'No description provided'}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-1 mb-4">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium">{progress}% Complete</span>
              <span className={`text-xs ${deadlineStatus}`}>{deadlineText}</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-white/5">
              <div 
                style={{ width: `${progress}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  progress >= 100 ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-primary'
                }`}
              ></div>
            </div>
          </div>
          
          {/* Project Metadata */}
          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-muted-foreground">
            <div>
              {project.Frontend && (
                <span className="mr-3">{project.Frontend}</span>
              )}
              <span>Created {format(new Date(project.CreatedAt), 'MMM d')}</span>
            </div>
            
            <div className="flex items-center">
              {Array.isArray(project.teams) && project.teams.length > 0 && (
                <div className="flex items-center mr-3">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {project.teams.length}
                </div>
              )}
              
              {((Array.isArray(project.members) && project.members.length > 0) || 
                (Array.isArray(project.stakeholders) && project.stakeholders.length > 0)) && (
                <div className="flex items-center">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {(Array.isArray(project.members) ? project.members.length : 0) + 
                   (Array.isArray(project.stakeholders) ? project.stakeholders.length : 0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
  function SkeletonCard() {
    return (
      <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-xl h-64">
        <div className="h-1.5 w-full bg-white/10 animate-pulse"></div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-7 w-40 bg-white/10 animate-pulse rounded"></div>
            <div className="h-6 w-24 bg-white/10 animate-pulse rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 animate-pulse rounded"></div>
            <div className="h-4 w-2/3 bg-white/10 animate-pulse rounded"></div>
          </div>
          <div className="pt-4">
            <div className="h-4 w-full bg-white/10 animate-pulse rounded-full"></div>
          </div>
          <div className="pt-4 flex justify-between">
            <div className="h-4 w-20 bg-white/10 animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-white/10 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  function EmptyState({ onCreateProject }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl overflow-hidden bg-white/5 border border-white/10 p-12 text-center"
      >
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3">No projects yet</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Get started by creating your first project to track work, collaborate with your team, and meet your deadlines.
        </p>
        <button
          onClick={onCreateProject}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full 
                    text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-primary shadow-lg shadow-primary/20 transition-all duration-200"
        >
          <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Your First Project
        </button>
      </motion.div>
    );
  }