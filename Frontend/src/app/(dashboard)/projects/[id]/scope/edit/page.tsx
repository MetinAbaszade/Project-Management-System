'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ScopeEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  // Just redirect to the main scope page with edit mode
  useEffect(() => {
    router.replace(`/projects/${id}/scope?mode=edit`);
  }, [id, router]);
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
      <span className="ml-3 text-muted-foreground">Redirecting to scope editor...</span>
    </div>
  );
}