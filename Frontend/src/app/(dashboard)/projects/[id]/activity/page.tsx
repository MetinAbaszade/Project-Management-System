"use client";

import React, { useState } from 'react';
import { ClipboardList, Users, Calendar, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  
  const goBack = () => {
    router.push(`/projects/${projectId}`);
  };
  
  const tabs = [
    { id: 'all', name: 'All Activity', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'team', name: 'Team Activity', icon: <Users className="h-4 w-4" /> },
    { id: 'tasks', name: 'Task Activity', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'members', name: 'Member Activity', icon: <Users className="h-4 w-4" /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md max-w-6xl mx-auto">
      <div className="p-6 pb-0">
        <button 
          onClick={goBack}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 transition-colors duration-200 ease-in-out"
        >
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center mr-2 shadow-sm hover:bg-gray-100 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </div>
          <span>Back to Project</span>
        </button>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center transition-all duration-200 ease-in-out
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2 flex items-center justify-center w-6 h-6 bg-opacity-10 rounded-full">
                {tab.icon}
              </span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-1 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => {}} 
              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out flex-1 bg-white shadow-sm text-gray-700"
            >
              Latest
            </button>
            <button
              onClick={() => {}}
              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center transition-all duration-200 ease-in-out flex-1 text-gray-500 hover:bg-white hover:text-gray-700"
            >
              Oldest
            </button>
          </div>
        </div>
        
        {activeTab === 'all' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-blue-50 p-5 rounded-full mb-4 shadow-sm">
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No all activity yet</h3>
            <p className="text-gray-500 text-sm mb-4 text-center max-w-sm">
              Activity will appear here as you and your team make progress on this project
            </p>
          </div>
        )}
        
        {activeTab === 'team' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-blue-50 p-5 rounded-full mb-4 shadow-sm">
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No team activity yet</h3>
            <p className="text-gray-500 text-sm mb-4 text-center max-w-sm">
              Activity will appear here as you and your team make progress on this project
            </p>
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-blue-50 p-5 rounded-full mb-4 shadow-sm">
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No task activity yet</h3>
            <p className="text-gray-500 text-sm mb-4 text-center max-w-sm">
              Activity will appear here as you and your team make progress on this project
            </p>
          </div>
        )}
        
        {activeTab === 'members' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-blue-50 p-5 rounded-full mb-4 shadow-sm">
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No member activity yet</h3>
            <p className="text-gray-500 text-sm mb-4 text-center max-w-sm">
              Activity will appear here as you and your team make progress on this project
            </p>
          </div>
        )}
      </div>
    </div>
  );
}