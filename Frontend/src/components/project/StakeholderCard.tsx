'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Edit, Trash2, PercentSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StakeholderCardProps {
  stakeholder: {
    Id: string
    User: {
      FirstName: string
      LastName: string
      Email: string
      ProfileUrl?: string
    }
    Percentage: number
  }
  userRole: string
  onEdit?: () => void
  onDelete?: () => void
}

export function StakeholderCard({ 
  stakeholder, 
  userRole,
  onEdit,
  onDelete
}: StakeholderCardProps) {
  const canManage = userRole === 'Project Owner'
  const fullName = `${stakeholder.User.FirstName} ${stakeholder.User.LastName}`

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm backdrop-blur-md',
          'dark:bg-white/10 dark:border-white/20'
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={stakeholder.User.ProfileUrl}
              name={fullName}
              size="md"
            />
            
            <div>
              <h3 className="text-base font-semibold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">{stakeholder.User.Email}</p>
            </div>
          </div>
          
          <Badge className="bg-primary/20 text-primary flex items-center gap-1">
            <PercentSquare className="h-3 w-3" />
            {stakeholder.Percentage}%
          </Badge>
        </div>

        {canManage && (
          <div className="pt-2 flex justify-end gap-1 border-t border-white/10">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary"
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  )
}