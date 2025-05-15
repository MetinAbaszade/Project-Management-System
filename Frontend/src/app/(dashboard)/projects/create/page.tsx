'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';
import { launchConfetti } from '@/lib/confetti';
import {
  createProject,
  checkServerConnection,
  ProjectCreateData,
} from '@/api/ProjectAPI';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverChecked, setServerChecked] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    TotalBudget: '',
    Deadline: '',
  });

  useEffect(() => {
    async function checkConnection() {
      try {
        const isConnected = await checkServerConnection();
        setServerOnline(isConnected);
        if (!isConnected) {
          toast.error('Cannot connect to the backend server. Please ensure it is running.');
        }
      } catch {
        setServerOnline(false);
        toast.error('Failed to connect to the backend server.');
      } finally {
        setServerChecked(true);
      }
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('You must be logged in to create a project');
      router.push('/login');
      return;
    }

    checkConnection();
  }, [router]);

  const handleSubmit = async () => {
    if (!serverOnline) {
      toast.error('Cannot connect to the server. Please ensure the backend is running.');
      return;
    }

    if (!form.Name.trim()) {
      toast.error('Project name is required');
      nameInputRef.current?.focus();
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Authentication required. Please log in.');
      router.push('/login');
      return;
    }

    // Simple token decode to get user ID
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const userId = decoded.sub || decoded.id || decoded.userId;
      
      if (!userId) {
        toast.error('Invalid token. Please log in again.');
        router.push('/login');
        return;
      }

      setLoading(true);

      const projectData: ProjectCreateData = {
        Name: form.Name,
        Description: form.Description || '',
        Budget: parseFloat(form.TotalBudget) || 0,
        StatusId: 'active',
        OwnerId: userId // Set user as owner directly
      };

      if (form.Deadline?.trim()) {
        const parsedDate = new Date(form.Deadline + 'T00:00:00Z');
        if (!isNaN(parsedDate.getTime())) {
          projectData.Deadline = parsedDate.toISOString();
        }
      }

      const project = await createProject(projectData);
      
      launchConfetti();
      toast.success('Project created successfully');
      router.push(`/projects/${project.Id}`);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      toast.error(error.message || 'Failed to create project. Please try again.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (!serverChecked) {
    return (
      <div className="min-h-screen bg-[#f8fdfb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking server connection...</p>
        </div>
      </div>
    );
  }

  if (!serverOnline) {
    return (
      <div className="min-h-screen bg-[#f8fdfb] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">
            Cannot connect to the backend server. Please ensure it is running at http://localhost:8000
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Projects
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#3d9140] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fdfb]">
      <div className="max-w-[800px] mx-auto px-6 pt-8">
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center text-[#4CAF50] hover:text-[#2E7D32] transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Projects</span>
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#4CAF50]">Create</span> New Project
          </h1>
          <p className="text-gray-600 max-w-[600px] mx-auto">
            Bring your vision to life with a new project workspace
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Project Name <span className="text-[#4CAF50]">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={form.Name}
                onChange={(e) => setForm({ ...form, Name: e.target.value })}
                placeholder="Enter project name..."
                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 focus:border-[#4CAF50] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">Description</label>
              <textarea
                value={form.Description}
                onChange={(e) => setForm({ ...form, Description: e.target.value })}
                placeholder="Describe your project's goals and scope..."
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 focus:border-[#4CAF50] transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Budget</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.TotalBudget}
                    onChange={(e) => setForm({ ...form, TotalBudget: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-12 pl-7 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 focus:border-[#4CAF50] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Deadline</label>
                <input
                  type="date"
                  value={form.Deadline}
                  onChange={(e) => setForm({ ...form, Deadline: e.target.value })}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/40 focus:border-[#4CAF50] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#4CAF50] to-[#2196F3] text-white font-medium rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Project...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Create Project</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}