'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Users, Pencil, Trash2, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface TeamCardProps {
  team: {
    Id: string
    Name: string
    Description?: string
    ColorIndex?: number
    LeaderId?: string
    members?: any[]
  }
  userRole: string
  onManage?: () => void
  onDelete?: () => void
}

export function TeamCard({ team, userRole, onManage, onDelete }: TeamCardProps) {
  const { user } = useAuth()
  
  // Determine if user can manage this team
  const isOwner = userRole === 'Project Owner'
  const isLeader = team.LeaderId === user?.Id
  const canManage = isOwner || isLeader
  
  // Team color based on color index (or default)
  const teamColors = [
    'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
    'from-green-500/20 to-emerald-500/20 border-green-500/30',
    'from-red-500/20 to-rose-500/20 border-red-500/30',
    'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    'from-purple-500/20 to-violet-500/20 border-purple-500/30',
    'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
    'from-orange-500/20 to-amber-500/20 border-orange-500/30',
    'from-sky-500/20 to-blue-500/20 border-sky-500/30',
    'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30',
  ]
  
  const colorIndex = team.ColorIndex !== undefined ? team.ColorIndex % teamColors.length : 0
  const teamColorClass = teamColors[colorIndex]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'p-4 rounded-xl shadow-sm backdrop-blur-md border',
          'bg-gradient-to-br', teamColorClass
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold">{team.Name}</h3>
          </div>
          
          {isLeader && (
            <Badge className="bg-primary/70">Leader</Badge>
          )}
        </div>

        <p className="text-sm text-foreground/80 line-clamp-2 min-h-[40px]">
          {team.Description || 'No description provided.'}
        </p>

        <div className="mt-3">
          <div className="flex items-center text-xs text-foreground/70">
            <span>{team.members?.length || 0} Members</span>
          </div>
        </div>

        {canManage && (
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-white/20">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={onManage}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" /> Manage
            </Button>
            
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}