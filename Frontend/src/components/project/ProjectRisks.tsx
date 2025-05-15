'use client'

import { useEffect, useState } from 'react'
import {
  getProjectRisks,
  createRisk,
  updateRisk,
  deleteRisk,
  Risk,
} from '@/api/RiskAPI'
import { useUser } from '@/hooks/useUser'
import { useProjectRole } from '@/hooks/useProjectRole'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dropdown } from '@/components/ui/dropdown'
import { Dialog } from '@/components/ui/dialog'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'
import { AlarmClock, Edit, Plus, Shield, ShieldAlert, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RiskFormData {
  Name: string;
  Description: string;
  Category: string;
  Probability: number;
  Impact: number;
  Severity: number;
  Status: string;
}

export function ProjectRisks({ projectId }: { projectId: string }) {
  const { user } = useUser()
  const [project, setProject] = useState(null)
  const { isOwner, isTeamLeader } = useProjectRole(project)
  
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [formProcessing, setFormProcessing] = useState(false)
  
  // Form state
  const emptyForm: RiskFormData = {
    Name: '',
    Description: '',
    Category: 'Technical',
    Probability: 3,
    Impact: 3,
    Severity: 9,
    Status: 'Open',
  }
  
  const [formData, setFormData] = useState<RiskFormData>(emptyForm)
  
  // Load risks on component mount
  useEffect(() => {
    async function loadRisks() {
      setLoading(true)
      try {
        const data = await getProjectRisks(projectId)
        setRisks(data)
      } catch (error) {
        console.error('Failed to load risks:', error)
        toast.error('Failed to load project risks')
      } finally {
        setLoading(false)
      }
    }
    
    loadRisks()
  }, [projectId])
  
  // Calculate severity when probability or impact changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      Severity: prev.Probability * prev.Impact
    }))
  }, [formData.Probability, formData.Impact])
  
  const handleInputChange = (field: keyof RiskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleCreateRisk = async () => {
    if (!formData.Name) {
      toast.error('Risk name is required')
      return
    }
    
    setFormProcessing(true)
    try {
      const newRisk = await createRisk({
        ProjectId: projectId,
        Name: formData.Name,
        Description: formData.Description,
        Category: formData.Category,
        Probability: formData.Probability,
        Impact: formData.Impact,
        Severity: formData.Severity,
        Status: formData.Status,
      })
      
      setRisks(prev => [...prev, newRisk])
      setCreateDialogOpen(false)
      setFormData(emptyForm)
      toast.success('Risk created successfully')
    } catch (error) {
      console.error('Failed to create risk:', error)
      toast.error('Failed to create risk')
    } finally {
      setFormProcessing(false)
    }
  }
  
  const handleUpdateRisk = async () => {
    if (!selectedRisk || !formData.Name) {
      toast.error('Risk name is required')
      return
    }
    
    setFormProcessing(true)
    try {
      const updatedRisk = await updateRisk(selectedRisk.Id, {
        Name: formData.Name,
        Description: formData.Description,
        Category: formData.Category,
        Probability: formData.Probability,
        Impact: formData.Impact,
        Severity: formData.Severity,
        Status: formData.Status,
      })
      
      setRisks(prev => 
        prev.map(risk => 
          risk.Id === selectedRisk.Id ? { ...risk, ...updatedRisk } : risk
        )
      )
      
      setEditDialogOpen(false)
      setSelectedRisk(null)
      toast.success('Risk updated successfully')
    } catch (error) {
      console.error('Failed to update risk:', error)
      toast.error('Failed to update risk')
    } finally {
      setFormProcessing(false)
    }
  }
  
  const handleDeleteRisk = async (riskId: string) => {
    if (!confirm('Are you sure you want to delete this risk?')) return
    
    try {
      await deleteRisk(riskId, projectId)
      setRisks(prev => prev.filter(risk => risk.Id !== riskId))
      toast.success('Risk deleted successfully')
    } catch (error) {
      console.error('Failed to delete risk:', error)
      toast.error('Failed to delete risk')
    }
  }
  
  const editRisk = (risk: Risk) => {
    setSelectedRisk(risk)
    setFormData({
      Name: risk.Name,
      Description: risk.Description || '',
      Category: risk.Category,
      Probability: risk.Probability,
      Impact: risk.Impact,
      Severity: risk.Severity,
      Status: risk.Status,
    })
    setEditDialogOpen(true)
  }
  
  // Helper for color coding
  const getSeverityColor = (severity: number) => {
    if (severity >= 15) return 'text-red-500'
    if (severity >= 8) return 'text-orange-500'
    if (severity >= 4) return 'text-yellow-500'
    return 'text-green-500'
  }
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/20 text-blue-500'
      case 'Mitigated': return 'bg-green-500/20 text-green-500'
      case 'Closed': return 'bg-gray-500/20 text-gray-500'
      case 'Active': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }
  
  // Options for dropdowns
  const categoryOptions = [
    { label: 'Technical', value: 'Technical' },
    { label: 'Schedule', value: 'Schedule' },
    { label: 'Cost', value: 'Cost' },
    { label: 'Resource', value: 'Resource' },
    { label: 'External', value: 'External' },
  ]
  
  const probabilityOptions = [
    { label: '1 - Very Low', value: 1 },
    { label: '2 - Low', value: 2 },
    { label: '3 - Medium', value: 3 },
    { label: '4 - High', value: 4 },
    { label: '5 - Very High', value: 5 },
  ]
  
  const impactOptions = [
    { label: '1 - Minimal', value: 1 },
    { label: '2 - Minor', value: 2 },
    { label: '3 - Moderate', value: 3 },
    { label: '4 - Major', value: 4 },
    { label: '5 - Critical', value: 5 },
  ]
  
  const statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Active', value: 'Active' },
    { label: 'Mitigated', value: 'Mitigated' },
    { label: 'Closed', value: 'Closed' },
  ]
  
  if (loading) {
    return (
      <GlassPanel className="p-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </GlassPanel>
    )
  }
  
  const canManageRisks = isOwner || isTeamLeader
  
  return (
    <GlassPanel className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Project Risks</h2>
        
        {canManageRisks && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Risk
          </Button>
        )}
      </div>
      
      {risks.length === 0 ? (
        <EmptyState
          title="No risks identified"
          description="Track potential risks to your project to stay ahead of problems."
          icon={<ShieldAlert className="h-12 w-12" />}
          action={
            canManageRisks && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Risk
              </Button>
            )
          }
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {risks.map((risk, index) => (
            <motion.div
              key={risk.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{risk.Name}</h3>
                    <div className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      getStatusBadgeClass(risk.Status)
                    )}>
                      {risk.Status}
                    </div>
                  </div>
                  
                  {risk.Description && (
                    <p className="text-sm text-muted-foreground">{risk.Description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      <span>{risk.Category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Probability: </span>
                      <span>{risk.Probability}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impact: </span>
                      <span>{risk.Impact}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Severity: </span>
                      <span className={getSeverityColor(risk.Severity)}>
                        {risk.Severity}/25
                      </span>
                    </div>
                  </div>
                </div>
                
                {canManageRisks && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => editRisk(risk)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteRisk(risk.Id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Create Risk Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Add New Risk"
        description="Identify a potential risk to the project."
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Risk Name *</label>
            <Input
              value={formData.Name}
              onChange={(e) => handleInputChange('Name', e.target.value)}
              placeholder="E.g., API Integration Delay"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              placeholder="Describe the risk in detail..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Dropdown
                value={formData.Category}
                onChange={(value) => handleInputChange('Category', value)}
                items={categoryOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {formData.Category}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <Dropdown
                value={formData.Status}
                onChange={(value) => handleInputChange('Status', value)}
                items={statusOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {formData.Status}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Probability (1-5)</label>
              <Dropdown
                value={formData.Probability}
                onChange={(value) => handleInputChange('Probability', value)}
                items={probabilityOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {`${formData.Probability} - ${probabilityOptions.find(o => o.value === formData.Probability)?.label.split(' - ')[1]}`}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Impact (1-5)</label>
              <Dropdown
                value={formData.Impact}
                onChange={(value) => handleInputChange('Impact', value)}
                items={impactOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {`${formData.Impact} - ${impactOptions.find(o => o.value === formData.Impact)?.label.split(' - ')[1]}`}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Severity Score (auto-calculated)</label>
            <div className={cn(
              "h-10 flex items-center px-3 rounded-md border",
              "bg-muted/50 font-medium",
              getSeverityColor(formData.Severity)
            )}>
              {formData.Severity}/25
            </div>
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
            onClick={handleCreateRisk}
            disabled={formProcessing || !formData.Name}
          >
            {formProcessing ? 'Creating...' : 'Create Risk'}
          </Button>
        </div>
      </Dialog>
      
      {/* Edit Risk Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Risk"
        description="Update the risk details."
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Risk Name *</label>
            <Input
              value={formData.Name}
              onChange={(e) => handleInputChange('Name', e.target.value)}
              placeholder="E.g., API Integration Delay"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              placeholder="Describe the risk in detail..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Dropdown
                value={formData.Category}
                onChange={(value) => handleInputChange('Category', value)}
                items={categoryOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {formData.Category}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <Dropdown
                value={formData.Status}
                onChange={(value) => handleInputChange('Status', value)}
                items={statusOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {formData.Status}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Probability (1-5)</label>
              <Dropdown
                value={formData.Probability}
                onChange={(value) => handleInputChange('Probability', value)}
                items={probabilityOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {`${formData.Probability} - ${probabilityOptions.find(o => o.value === formData.Probability)?.label.split(' - ')[1]}`}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Impact (1-5)</label>
              <Dropdown
                value={formData.Impact}
                onChange={(value) => handleInputChange('Impact', value)}
                items={impactOptions}
                trigger={
                  <Button variant="outline" className="w-full justify-between">
                    {`${formData.Impact} - ${impactOptions.find(o => o.value === formData.Impact)?.label.split(' - ')[1]}`}
                    <span className="opacity-50">▼</span>
                  </Button>
                }
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Severity Score (auto-calculated)</label>
            <div className={cn(
              "h-10 flex items-center px-3 rounded-md border",
              "bg-muted/50 font-medium",
              getSeverityColor(formData.Severity)
            )}>
              {formData.Severity}/25
            </div>
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
            onClick={handleUpdateRisk}
            disabled={formProcessing || !formData.Name}
          >
            {formProcessing ? 'Updating...' : 'Update Risk'}
          </Button>
        </div>
      </Dialog>
    </GlassPanel>
  )
}