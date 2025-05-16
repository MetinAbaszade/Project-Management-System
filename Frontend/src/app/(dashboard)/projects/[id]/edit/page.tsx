// Frontend/src/app/(dashboard)/projects/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById, updateProject } from '@/api/ProjectAPI';
import { toast } from '@/lib/toast';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    Deadline: null as string | null,
    Budget: 0
  });

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await getProjectById(id as string);
        setProject(data);
        setFormData({
          Name: data.Name || '',
          Description: data.Description || '',
          Deadline: data.Deadline || null,
          Budget: data.TotalBudget || 0
        });
      } catch (error) {
        console.error('Failed to fetch project:', error);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Budget' ? parseFloat(value) || 0 : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      Deadline: e.target.value || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        Name: formData.Name,
        Description: formData.Description,
        Deadline: formData.Deadline,
        Budget: formData.Budget
      };

      await updateProject(id as string, updateData);
      toast.success('Project updated successfully');
      router.push(`/projects/${id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Edit Project</h1>
      </div>

      <div className="bg-card backdrop-blur-md rounded-xl p-6 shadow-sm border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              rows={5}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline</label>
              <div className="relative">
                <Input
                  type="date"
                  name="Deadline"
                  value={formData.Deadline ? formData.Deadline.substring(0, 10) : ''}
                  onChange={handleDateChange}
                  className="w-full pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget</label>
              <Input
                name="Budget"
                type="number"
                value={formData.Budget}
                onChange={handleChange}
                min={0}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={cn("gap-2", saving ? "opacity-70" : "")}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}