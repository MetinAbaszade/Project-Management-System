'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Edit, Eye, Calendar, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isPast } from 'date-fns'

interface ProjectCardProps {
  project: {
    Id: string
    Name: string
    Description?: string
    Progress: number
    Deadline?: string
    CreatedAt: string
    OwnerId: string
  }
  onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  // Determine user's role in this project
  const isOwner = user?.Id === project.OwnerId
  
  // Format deadline date if it exists
  const deadline = project.Deadline ? new Date(project.Deadline) : null
  const isOverdue = deadline ? isPast(deadline) : false
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'p-5 h-full bg-white/5 border border-white/10 shadow-md backdrop-blur-lg flex flex-col justify-between gap-4',
          'dark:bg-white/10 dark:border-white/20'
        )}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold tracking-tight line-clamp-1">
              {project.Name}
            </h2>
            <Badge className={cn(
              isOwner ? "bg-primary" : "bg-muted"
            )}>
              {isOwner ? 'Owner' : 'Member'}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {project.Description || 'No description provided.'}
          </p>
          
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span className="font-medium">{project.Progress || 0}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${project.Progress || 0}%` }}
                />
              </div>
            </div>
            
            {/* Deadline */}
            {deadline && (
              <div className="flex items-center text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span className={cn(
                  "text-muted-foreground",
                  isOverdue && "text-red-500"
                )}>
                  Due: {format(deadline, 'MMM d, yyyy')}
                  {isOverdue && " (Overdue)"}
                </span>
              </div>
            )}
            
            {/* Created Date */}
            <div className="flex items-center text-xs">
              <BarChart2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                Created: {format(new Date(project.CreatedAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={onClick}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" /> View
          </Button>
          
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/projects/${project.Id}/edit`);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}