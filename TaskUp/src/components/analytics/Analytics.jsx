import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, Filter, Calendar, Download } from 'lucide-react';

// Analytics Card Component
const AnalyticsCard = ({ title, value, change, changeType, icon }) => {
  const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <span className={`ml-2 text-sm font-medium ${changeColor} flex items-center`}>
                {changeType === 'positive' ? '↑' : '↓'} {change}
              </span>
            )}
          </div>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Chart Container Component
const ChartContainer = ({ title, children, filters }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        {filters && (
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center text-gray-600 dark:text-gray-300">
              <Filter size={14} className="mr-1.5" />
              Filter
              <ChevronDown size={14} className="ml-1" />
            </button>
            <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <Download size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [selectedProject, setSelectedProject] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Mock data loading
  useEffect(() => {
    setTimeout(() => {
      setAnalyticsData({
        taskCompletionRate: 78,
        taskCompletionChange: '12%',
        activeProjects: 5,
        activeProjectsChange: '2',
        onTimeCompletion: 82,
        onTimeCompletionChange: '5%',
        teamProductivity: 91,
        teamProductivityChange: '8%',
        
        taskStatusDistribution: [
          { name: 'Completed', value: 145 },
          { name: 'In Progress', value: 64 },
          { name: 'Not Started', value: 32 },
        ],
        
        projectProgress: [
          { name: 'Website Redesign', progress: 65 },
          { name: 'Mobile App Development', progress: 30 },
          { name: 'Marketing Campaign', progress: 85 },
          { name: 'Product Launch', progress: 40 },
          { name: 'Office Relocation', progress: 100 },
        ],
        
        teamPerformance: [
          { name: 'Design Team', tasksCompleted: 45, onTime: 38 },
          { name: 'Development Team', tasksCompleted: 68, onTime: 62 },
          { name: 'Marketing Team', tasksCompleted: 32, onTime: 28 },
        ],
        
        taskCompletionTrend: [
          { date: 'Apr 1', completed: 8 },
          { date: 'Apr 2', completed: 5 },
          { date: 'Apr 3', completed: 7 },
          { date: 'Apr 4', completed: 10 },
          { date: 'Apr 5', completed: 12 },
          { date: 'Apr 6', completed: 8 },
          { date: 'Apr 7', completed: 9 },
          { date: 'Apr 8', completed: 11 },
          { date: 'Apr 9', completed: 14 },
          { date: 'Apr 10', completed: 16 },
          { date: 'Apr 11', completed: 12 },
          { date: 'Apr 12', completed: 10 },
          { date: 'Apr 13', completed: 8 },
          { date: 'Apr 14', completed: 9 },
        ],
        
        projectByPriority: [
          { name: 'High', value: 24 },
          { name: 'Medium', value: 45 },
          { name: 'Low', value: 19 },
        ],
      });
      setIsLoading(false);
    }, 1500);
  }, []);
  
  // Pie chart colors
  const COLORS = ['#4f46e5', '#3b82f6', '#60a5fa', '#93c5fd'];
  const STATUS_COLORS = {
    'Completed': '#22c55e',
    'In Progress': '#3b82f6',
    'Not Started': '#9ca3af'
  };
  
  const PRIORITY_COLORS = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#22c55e'
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-medium">No analytics data available</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Try selecting a different project or date range
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Analytics</h1>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            >
              <option value="all">All Projects</option>
              <option value="website">Website Redesign</option>
              <option value="mobile">Mobile App Development</option>
              <option value="marketing">Marketing Campaign</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
              <ChevronDown size={16} />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">This year</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <AnalyticsCard
          title="Task Completion Rate"
          value={`${analyticsData.taskCompletionRate}%`}
          change={analyticsData.taskCompletionChange}
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <AnalyticsCard
          title="Active Projects"
          value={analyticsData.activeProjects}
          change={analyticsData.activeProjectsChange}
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <AnalyticsCard
          title="On-time Completion"
          value={`${analyticsData.onTimeCompletion}%`}
          change={analyticsData.onTimeCompletionChange}
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <AnalyticsCard
          title="Team Productivity"
          value={`${analyticsData.teamProductivity}%`}
          change={analyticsData.teamProductivityChange}
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Task Completion Trend */}
        <ChartContainer title="Task Completion Trend" filters>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.taskCompletionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
        
        {/* Project Progress */}
        <ChartContainer title="Project Progress" filters>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.projectProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                <Bar dataKey="progress" barSize={20} radius={[0, 4, 4, 0]}>
                  {analyticsData.projectProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.progress >= 80 ? '#22c55e' : entry.progress >= 40 ? '#3b82f6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
        
        {/* Task Status Distribution */}
        <ChartContainer title="Task Status Distribution" filters>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.taskStatusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {analyticsData.taskStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
        
        {/* Priority Distribution */}
        <ChartContainer title="Tasks by Priority" filters>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.projectByPriority}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {analyticsData.projectByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>
      
      {/* Team Performance */}
      <ChartContainer title="Team Performance" filters>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasksCompleted" name="Tasks Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="onTime" name="Completed On Time" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
};

export default Analytics;   