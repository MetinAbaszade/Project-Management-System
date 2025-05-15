'use client'

import { useEffect, useState } from 'react'
import {
  getProjectResources,
  createResource,
  deleteResource,
  Resource,
  ResourceCreateData,
} from '@/api/ResourceAPI'
import { useSession } from 'next-auth/react'
import { useUserProjectRole } from '@/hooks/useProjectRole'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'

export function ResourceTable({ projectId }: { projectId: string }) {
  const { data: session } = useSession()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [newRes, setNewRes] = useState<Omit<ResourceCreateData, 'ProjectId'>>({
    Name: '',
    Type: '',
    Unit: '',
    Total: 0,
    Available: 0,
  })
  const [project, setProject] = useState<any>(null)

  const role = useUserProjectRole(project, session?.user?.id)

  useEffect(() => {
    const load = async () => {
      const data = await getProjectResources(projectId)
      setResources(data)
      setLoading(false)
    }
    load()
  }, [projectId])

  const handleAdd = async () => {
    const payload: ResourceCreateData = {
      ...newRes,
      Description: '',
    }

    try {
      const created = await createResource(payload)
      setResources(prev => [...prev, created])
      setNewRes({ Name: '', Type: '', Unit: '', Total: 0, Available: 0 })
    } catch (e) {
      console.error('Failed to create resource:', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id)
      setResources(prev => prev.filter(r => r.Id !== id))
    } catch (e) {
      console.error('Failed to delete resource:', e)
    }
  }

  if (loading) return <div className="text-muted-foreground text-sm mt-4">Loading resources...</div>

  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
        <span>Name</span>
        <span>Type</span>
        <span>Unit</span>
        <span>Total</span>
        <span>Available</span>
        <span />
      </div>

      {resources.map((res) => (
        <div
          key={res.Id}
          className="grid grid-cols-6 items-center gap-4 border-b py-2 text-sm"
        >
          <span>{res.Name}</span>
          <span>{res.Type}</span>
          <span>{res.Unit}</span>
          <span>{res.Total}</span>
          <span>{res.Available}</span>
          {role.isOwner && (
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(res.Id)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ))}

      {role.isOwner && (
        <div className="grid grid-cols-6 items-center gap-4 pt-2">
          <Input
            placeholder="Name"
            value={newRes.Name}
            onChange={(e) => setNewRes({ ...newRes, Name: e.target.value })}
          />
          <Input
            placeholder="Type"
            value={newRes.Type}
            onChange={(e) => setNewRes({ ...newRes, Type: e.target.value })}
          />
          <Input
            placeholder="Unit"
            value={newRes.Unit}
            onChange={(e) => setNewRes({ ...newRes, Unit: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Total"
            value={newRes.Total}
            onChange={(e) => setNewRes({ ...newRes, Total: Number(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Available"
            value={newRes.Available}
            onChange={(e) => setNewRes({ ...newRes, Available: Number(e.target.value) })}
          />
          <Button onClick={handleAdd} disabled={!newRes.Name || !newRes.Type || !newRes.Unit}>
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>
      )}
    </div>
  )
}
