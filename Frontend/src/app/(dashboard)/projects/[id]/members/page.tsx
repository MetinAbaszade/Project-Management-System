// Frontend/src/app/(dashboard)/projects/[id]/members/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/api/ProjectAPI';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectMembers } from '@/components/project/ProjectMembers';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function ProjectMembersPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await getProjectById(id as string);
        setProject(data);
        setIsOwner(user?.Id === data.OwnerId);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id, user]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/projects/${id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        <h1 className="text-2xl font-semibold">{project.Name}: Members</h1>
      </div>

      <div className="bg-card backdrop-blur-md rounded-xl p-6 shadow-sm border border-border">
        <ProjectMembers projectId={id as string} isOwner={isOwner} />
      </div>
    </motion.div>
  );
}