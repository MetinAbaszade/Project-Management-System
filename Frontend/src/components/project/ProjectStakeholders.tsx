'use client'

import { useEffect, useState } from 'react'
import {
  getProjectStakeholders,
  createStakeholder,
  updateStakeholder,
  deleteStakeholder,
  Stakeholder
} from '@/api/StakeholderAPI'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { toast } from '@/lib/toast'
import { Edit, Plus, Trash2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { StakeholderCard } from './StakeholderCard'
import { api } from '@/lib/axios'

export function ProjectStakeholders({ projectId }: { projectId: string }) {
  const { user } = useUser()
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null)
  const [formProcessing, setFormProcessing] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    UserId: '',
    Percentage: 0,
  })
  
  // For stakeholder user search
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  
  // Determine if user is project owner
  const isOwner = user?.Id === stakeholders[0]?.ProjectOwnerId || user?.Role === 'project_owner'
  
  // Load stakeholders on component mount
  useEffect(() => {
    async function loadStakeholders() {
      setLoading(true)
      try {
        const data = await getProjectStakeholders(projectId)
        setStakeholders(data)
      } catch (error) {
        console.error('Failed to load stakeholders:', error)
        toast.error('Failed to load project stakeholders')
      } finally {
        setLoading(false)
      }
    }
    
    loadStakeholders()
  }, [projectId])
  
  // Real search users function
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setSearching(true)
    try {
      const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`)
      setSearchResults(response.data)
    } catch (error) {
      console.error('Failed to search users:', error)
      toast.error('Failed to search users')
    } finally {
      setSearching(false)
    }
  }
  
  // Handle user search input
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchUsers(userSearchQuery)
    }, 300)
    
    return () => clearTimeout(delaySearch)
  }, [userSearchQuery])
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSelectUser = (userId: string) => {
    setFormData(prev => ({ ...prev, UserId: userId }))
    setUserSearchQuery('')
    setSearchResults([])
  }
  
  const handleCreateStakeholder = async () => {
    if (!formData.UserId) {
      toast.error('Please select a user')
      return
    }
    
    setFormProcessing(true)
    try {
      const newStakeholder = await createStakeholder({
        ProjectId: projectId,
        UserId: formData.UserId,
        Percentage: formData.Percentage,
      })
      
      setStakeholders(prev => [...prev, newStakeholder])
      setCreateDialogOpen(false)
      setFormData({ UserId: '', Percentage: 0 })
      toast.success('Stakeholder added successfully')
    } catch (error) {
      console.error('Failed to add stakeholder:', error)
      toast.error('Failed to add stakeholder')
    } finally {
      setFormProcessing(false)
    }
  }
  
  const handleUpdateStakeholder = async () => {
    if (!selectedStakeholder) return
    
    setFormProcessing(true)
    try {
      const updatedStakeholder = await updateStakeholder(
        selectedStakeholder.Id, 
        { Percentage: formData.Percentage }
      )
      
      setStakeholders(prev => 
        prev.map(s => 
          s.Id === selectedStakeholder.Id ? { ...s, ...updatedStakeholder } : s
        )
      )
      
      setEditDialogOpen(false)
      setSelectedStakeholder(null)
      toast.success('Stakeholder updated successfully')
    } catch (error) {
      console.error('Failed to update stakeholder:', error)
      toast.error('Failed to update stakeholder')
    } finally {
      setFormProcessing(false)
    }
  }
  
  const handleDeleteStakeholder = async (stakeholderId: string) => {
    if (!confirm('Are you sure you want to remove this stakeholder?')) return
    
    try {
      await deleteStakeholder(stakeholderId)
      setStakeholders(prev => prev.filter(s => s.Id !== stakeholderId))
      toast.success('Stakeholder removed successfully')
    } catch (error) {
      console.error('Failed to remove stakeholder:', error)
      toast.error('Failed to remove stakeholder')
    }
  }
  
  const editStakeholder = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder)
    setFormData({
      UserId: stakeholder.UserId,
      Percentage: stakeholder.Percentage,
    })
    setEditDialogOpen(true)
  }
  
  // Helper to get user name from search results
  const getUserName = (userId: string): string => {
    const user = searchResults.find(u => u.Id === userId)
    if (!user) return 'Selected User'
    return `${user.FirstName} ${user.LastName}`
  }
  
  if (loading) {
    return (
      <GlassPanel className="p-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </GlassPanel>
    )
  }
  
  return (
    <GlassPanel className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Project Stakeholders</h2>
        
        {isOwner && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Stakeholder
          </Button>
        )}
      </div>
      
      {stakeholders.length === 0 ? (
        <EmptyState
          title="No stakeholders yet"
          description="Add stakeholders to track their interests and involvement in the project."
          icon={<Users className="h-12 w-12" />}
          action={
            isOwner && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                Add Stakeholder
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stakeholders.map((stakeholder) => (
            <StakeholderCard
              key={stakeholder.Id}
              stakeholder={stakeholder}
              userRole={isOwner ? 'Project Owner' : 'Member'}
              onEdit={() => editStakeholder(stakeholder)}
              onDelete={() => handleDeleteStakeholder(stakeholder.Id)}
            />
          ))}
        </div>
      )}
      
      {/* Create Stakeholder Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Add Stakeholder"
        description="Add a new stakeholder to the project."
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Search User</label>
            <Input
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search by name or email"
            />
            
            {searching && (
              <div className="text-sm text-muted-foreground mt-1">Searching...</div>
            )}
            
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-md divide-y max-h-40 overflow-y-auto">
                {searchResults.map(user => (
                  <div
                    key={user.Id}
                    className="p-2 flex items-center gap-2 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleSelectUser(user.Id)}
                  >
                    <Avatar name={`${user.FirstName} ${user.LastName}`} size="sm" />
                    <div>
                      <div className="text-sm font-medium">{user.FirstName} {user.LastName}</div>
                      <div className="text-xs text-muted-foreground">{user.Email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {formData.UserId && (
              <div className="mt-2 p-2 border rounded-md bg-white/5">
                <div className="text-sm">Selected User: <span className="font-medium">{getUserName(formData.UserId)}</span></div>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium">Stake Percentage (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.Percentage}
              onChange={(e) => handleInputChange('Percentage', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCreateDialogOpen(false)}
            disabled={formProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateStakeholder}
            disabled={formProcessing || !formData.UserId}
          >
            {formProcessing ? 'Adding...' : 'Add Stakeholder'}
          </Button>
        </div>
      </Dialog>
      
      {/* Edit Stakeholder Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Stakeholder"
        description="Update stake percentage."
      >
        <div className="space-y-4">
          {selectedStakeholder && (
            <div className="p-2 border rounded-md bg-white/5">
              <div className="text-sm">
                Stakeholder: <span className="font-medium">
                  {selectedStakeholder.User?.FirstName} {selectedStakeholder.User?.LastName}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedStakeholder.User?.Email}
              </div>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium">Stake Percentage (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.Percentage}
              onChange={(e) => handleInputChange('Percentage', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(false)}
            disabled={formProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStakeholder}
            disabled={formProcessing}
          >
            {formProcessing ? 'Updating...' : 'Update Stakeholder'}
          </Button>
        </div>
      </Dialog>
    </GlassPanel>
  )
}