'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database, Box, Plus, Settings, ArrowRight, BarChart,
  Cpu, Store, Clock, Activity, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResourcesTabProps {
  teamId: string;
  projectId: string;
}

export default function ResourcesTab({ teamId, projectId }: ResourcesTabProps) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  const handleAddResource = () => {
    router.push(`/projects/${projectId}/resource`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center text-foreground">
          <Database className="w-5 h-5 mr-2" />
          Team Resources
        </h3>

        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm transition-colors"
          onClick={handleAddResource}
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>

      {!showSettings ? (
        <motion.div
          className="bg-card border border-border rounded-xl p-8 text-center shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Database size={28} className="text-primary" />
            </div>

            <h3 className="text-xl font-semibold mb-2 text-foreground">
              No Resources Available
            </h3>

            <p className="text-muted-foreground mb-6">
              Resources help your team track and allocate materials, budgets, equipment, and other assets needed for tasks.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center justify-center gap-2"
                onClick={handleAddResource}
              >
                <Plus size={16} />
                Add First Resource
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition-colors flex items-center justify-center gap-2"
                onClick={() => setShowSettings(true)}
              >
                <Settings size={16} />
                Resource Settings
              </motion.button>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div
                className="flex items-center justify-center gap-2 text-sm text-primary cursor-pointer"
                onClick={() => router.push(`/projects/${projectId}/resource`)}
              >
                <Box size={14} />
                <span>Learn about team resource management</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center">
            <h3 className="font-medium flex items-center text-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Resource Management Settings
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-sm text-primary hover:underline"
            >
              Back to Resources
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Resource Types */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center text-foreground">
                <Box className="w-4 h-4 mr-2 text-primary" />
                Resource Types
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Hardware', desc: 'Equipment, computers, devices', icon: Cpu, bg: 'bg-blue-100', text: 'text-blue-600' },
                  { label: 'Budget', desc: 'Financial resources, costs', icon: Store, bg: 'bg-green-100', text: 'text-green-600' },
                  { label: 'Time', desc: 'Hours, capacity planning', icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600' },
                  { label: 'Personnel', desc: 'Team allocation, skills', icon: Shield, bg: 'bg-purple-100', text: 'text-purple-600' },
                ].map(({ label, desc, icon: Icon, bg, text }, i) => (
                  <div key={i} className="p-3 bg-muted/20 rounded-lg border border-border flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', bg)}>
                      <Icon className={cn('w-4 h-4', text)} />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Permissions */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-foreground">Resource Permissions</h4>
              <div className="space-y-2">
                {[
                  { id: 'teamleader-perm', label: 'Team Leaders can manage resources', checked: true },
                  { id: 'member-view-perm', label: 'Team Members can view resources', checked: true },
                  { id: 'member-edit-perm', label: 'Team Members can edit resources', checked: false },
                ].map(({ id, label, checked }) => (
                  <div key={id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                    <div className="flex items-center">
                      <input type="checkbox" id={id} className="mr-2 rounded border-border text-primary focus:ring-primary" defaultChecked={checked} />
                      <label htmlFor={id} className="text-foreground">{label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center text-foreground">
                <Activity className="w-4 h-4 mr-2 text-primary" />
                Resource Usage Statistics
              </h4>
              <div className="p-4 bg-muted/20 rounded-lg border border-border text-center">
                <BarChart className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">Enable resource tracking to view usage statistics</p>
                <button className="mt-3 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs hover:bg-primary/20 transition-colors">
                  Enable Tracking
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
