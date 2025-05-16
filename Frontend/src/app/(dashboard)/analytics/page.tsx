"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, ShoppingCart, Eye, Activity, BarChart2, Calendar, Clock, ChevronDown, Search } from 'lucide-react';

// Hardcoded data for analytics
const overviewData = [
  { name: 'Users', value: 2874, change: 12.5, icon: Users, color: 'bg-blue-500' },
  { name: 'Revenue', value: 18945, change: -3.2, icon: DollarSign, color: 'bg-green-500' },
  { name: 'Orders', value: 567, change: 8.7, icon: ShoppingCart, color: 'bg-purple-500' },
  { name: 'Page Views', value: 12984, change: 24.3, icon: Eye, color: 'bg-orange-500' }
];

const trafficData = [
  { name: 'Jan', direct: 4000, organic: 2400, social: 1800 },
  { name: 'Feb', direct: 3000, organic: 1800, social: 2200 },
  { name: 'Mar', direct: 2000, organic: 3600, social: 2800 },
  { name: 'Apr', direct: 2780, organic: 3908, social: 1908 },
  { name: 'May', direct: 1890, organic: 4800, social: 2400 },
  { name: 'Jun', direct: 2390, organic: 3800, social: 3200 },
  { name: 'Jul', direct: 3490, organic: 4300, social: 2100 },
];

const deviceData = [
  { name: 'Mobile', value: 60 },
  { name: 'Desktop', value: 30 },
  { name: 'Tablet', value: 10 },
];

const deviceColors = ['#1e88e5', '#42a5f5', '#90caf9'];

const conversionData = [
  { name: 'Mon', conversion: 67 },
  { name: 'Tue', conversion: 72 },
  { name: 'Wed', conversion: 86 },
  { name: 'Thu', conversion: 78 },
  { name: 'Fri', conversion: 82 },
  { name: 'Sat', conversion: 91 },
  { name: 'Sun', conversion: 85 },
];

const recentActivityData = [
  { id: 1, user: 'Emma Johnson', action: 'Purchased Premium Plan', time: '10 min ago', avatar: '/api/placeholder/32/32' },
  { id: 2, user: 'Liam Wilson', action: 'Signed up for newsletter', time: '42 min ago', avatar: '/api/placeholder/32/32' },
  { id: 3, user: 'Olivia Smith', action: 'Completed checkout', time: '1 hour ago', avatar: '/api/placeholder/32/32' },
  { id: 4, user: 'Noah Davis', action: 'Added items to cart', time: '2 hours ago', avatar: '/api/placeholder/32/32' },
  { id: 5, user: 'Ava Thompson', action: 'Viewed product details', time: '3 hours ago', avatar: '/api/placeholder/32/32' },
];

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const incrementTime = (duration / end) * 1.1;
    
    // Don't run if value is zero
    if (start === end) return;
    
    // Timer to increment counter
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    // Cleanup
    return () => {
      clearInterval(timer);
    };
  }, [value, duration]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// iOS-like segmented control
const SegmentedControl = ({ options, selectedOption, onChange }) => {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
      {options.map((option) => (
        <button
          key={option}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            selectedOption === option 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

// Card component with iOS-like design
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

// Main Analytics Dashboard component
const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30 Days');
  const [mounted, setMounted] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setTimeout(() => {
      setChartVisible(true);
    }, 400);
  }, []);
  
  // Animation classes
  const fadeInUp = "transition-all duration-500 transform";
  const initialState = "opacity-0 translate-y-4";
  const animatedState = "opacity-100 translate-y-0";
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className={`${fadeInUp} ${mounted ? animatedState : initialState} flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6`}>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor and analyze your business performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search analytics..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <button className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
              <Calendar className="h-4 w-4" />
              {timeRange}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {overviewData.map((item, index) => (
          <Card 
            key={item.name}
            className={`${fadeInUp} ${mounted ? animatedState : initialState}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`${item.color} rounded-lg p-2.5 text-white`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className={`text-xs font-medium flex items-center rounded-full px-2 py-0.5 ${
                  item.change > 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                }`}>
                  {item.change > 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(item.change)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500 text-sm">{item.name}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {item.name === 'Revenue' ? '$' : ''}
                  <AnimatedCounter value={item.value} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Traffic Sources Chart */}
        <Card 
          className={`${fadeInUp} ${mounted ? animatedState : initialState}`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Traffic Sources</h2>
                <p className="text-sm text-gray-500">Visitor acquisition channels</p>
              </div>
              <SegmentedControl 
                options={['7 Days', '30 Days', '90 Days']} 
                selectedOption={timeRange}
                onChange={setTimeRange}
              />
            </div>
            
            <div className={`transition-all duration-1000 ${chartVisible ? 'opacity-100' : 'opacity-0'}`} style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e88e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1e88e5" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#43a047" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#43a047" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorSocial" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9e9e9e" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9e9e9e" />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      border: 'none' 
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="direct" stroke="#1e88e5" fillOpacity={1} fill="url(#colorDirect)" />
                  <Area type="monotone" dataKey="organic" stroke="#43a047" fillOpacity={1} fill="url(#colorOrganic)" />
                  <Area type="monotone" dataKey="social" stroke="#9c27b0" fillOpacity={1} fill="url(#colorSocial)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
        
        {/* Device Distribution & Conversion Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          <Card 
            className={`${fadeInUp} ${mounted ? animatedState : initialState}`} 
            style={{ transitionDelay: '500ms' }}
          >
            <div className="p-5 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Device Distribution</h2>
              <p className="text-sm text-gray-500 mb-4">User device breakdown</p>
              
              <div className={`transition-all duration-1000 ${chartVisible ? 'opacity-100' : 'opacity-0'}`} style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                        border: 'none' 
                      }} 
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
          
          <Card 
            className={`${fadeInUp} ${mounted ? animatedState : initialState}`}
            style={{ transitionDelay: '600ms' }}
          >
            <div className="p-5 h-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Conversion Rate</h2>
              <p className="text-sm text-gray-500 mb-4">Weekly performance</p>
              
              <div className={`transition-all duration-1000 ${chartVisible ? 'opacity-100' : 'opacity-0'}`} style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9e9e9e" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9e9e9e" />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Conversion Rate']}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                        border: 'none' 
                      }} 
                    />
                    <Bar 
                      dataKey="conversion" 
                      fill="#3f51b5" 
                      radius={[4, 4, 0, 0]} 
                      barSize={24} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <Card 
        className={`${fadeInUp} ${mounted ? animatedState : initialState}`}
        style={{ transitionDelay: '700ms' }}
      >
        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentActivityData.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`flex items-center gap-3 pb-4 ${
                  index !== recentActivityData.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">
              View All Activity
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;