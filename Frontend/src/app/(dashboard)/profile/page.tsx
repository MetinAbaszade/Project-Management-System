'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Camera, 
  Pencil, 
  Calendar, 
  Briefcase, 
  Mail, 
  CheckCircle,
  X, 
  Upload, 
  Trash2,
  Clock,
  BarChart,
  ArrowRight
} from 'lucide-react';

// Demo user data
const userData = {
  firstName: 'Mahammad',
  lastName: 'Mammadli',
  profession: 'Project Manager',
  email: 'mmammadli@constructor.university',
  joinDate: new Date(2023, 5, 15), // June 15, 2023
  stats: {
    completedTasks: 37,
    activeProjects: 8
  }
};

// Demo activities
const activities = [
  {
    id: 1,
    type: 'task',
    action: 'completed',
    title: 'Update design system',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    iconColor: 'text-emerald-500'
  },
  {
    id: 2,
    type: 'project',
    action: 'created',
    title: 'Website Redesign',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    iconColor: 'text-blue-500'
  },
  {
    id: 3,
    type: 'team',
    action: 'updated',
    title: 'Marketing Campaign',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    iconColor: 'text-purple-500'
  }
];

// Helper functions
const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// Activity Icon component
const ActivityIcon = ({ type, color }) => {
  if (type === 'task') return <CheckCircle className={`h-4 w-4 ${color}`} />;
  if (type === 'project') return <Calendar className={`h-4 w-4 ${color}`} />;
  return <User className={`h-4 w-4 ${color}`} />;
};

// Hook for handling click outside
const useClickOutside = (refs, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside all provided refs
      if (!refs || !handler) return;
      
      const clickedOutside = refs.every(ref => 
        ref.current && !ref.current.contains(event.target)
      );
      
      if (clickedOutside) {
        handler();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, handler]);
};

// Simple animation components for React if framer-motion is not available
const MotionDiv = ({ 
  children, 
  initial = {}, 
  animate = {}, 
  whileHover = {}, 
  whileTap = {}, 
  transition = {}, 
  className = '', 
  onClick = () => {},
  ...rest 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const initialStyle = {
    opacity: initial.opacity !== undefined ? initial.opacity : 1,
    transform: `translateY(${initial.y || 0}px) scale(${initial.scale || 1})`,
    ...rest.style
  };
  
  const animateStyle = {
    opacity: animate.opacity !== undefined ? animate.opacity : 1,
    transform: `translateY(${animate.y || 0}px) scale(${animate.scale || 1})`,
    transition: `all ${transition.duration || 0.3}s ${transition.ease || 'ease'}`,
  };
  
  const hoverStyle = isHovered ? {
    transform: `translateY(${whileHover.y || 0}px) scale(${whileHover.scale || 1})`,
    boxShadow: whileHover.boxShadow || '',
    backgroundColor: whileHover.backgroundColor || '',
  } : {};
  
  const tapStyle = isPressed ? {
    transform: `translateY(${whileTap.y || 0}px) scale(${whileTap.scale || 1})`,
  } : {};
  
  const combinedStyle = {
    ...initialStyle,
    ...animateStyle,
    ...hoverStyle,
    ...tapStyle,
  };
  
  return (
    <div 
      className={className} 
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

// Simple version of AnimatePresence for showing/hiding elements
const AnimPresence = ({ children }) => {
  return children;
};

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [editMode, setEditMode] = useState({
    name: false,
    profession: false
  });
  const [formData, setFormData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    profession: userData.profession
  });
  
  // Refs for click outside detection
  const fileInputRef = useRef(null);
  const profileImageRef = useRef(null);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useClickOutside([profileImageRef, menuRef], () => {
    if (showImageUpload) setShowImageUpload(false);
  });

  const handleProfilePictureChange = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result);
      setShowImageUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (field) => {
    setEditMode(prev => ({ ...prev, [field]: false }));
  };

  const handleRemoveProfilePicture = () => {
    setProfileImage(null);
    setShowImageUpload(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6 bg-slate-50 min-h-screen">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h1 className="text-2xl font-bold text-blue-600">
          Your Profile
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your personal information
        </p>
      </MotionDiv>
      
      {/* Profile Card */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -5, 
          boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.15)",
        }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-6 mb-5 shadow-lg relative overflow-hidden"
      >
        {/* Background decorations */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-pink-50 blur-xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-50 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center">
            {/* Profile Image with online indicator */}
            <div className="relative" ref={profileImageRef}>
              <MotionDiv 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                
                {/* Edit overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  onClick={() => setShowImageUpload(true)}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </MotionDiv>
              
              {/* Online indicator */}
              <div className="absolute right-0 bottom-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-lg">
                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50"></div>
              </div>
            </div>
            
            {/* User Name */}
            {editMode.name ? (
              <div 
                className="flex flex-col gap-2 w-full mt-4 transition-all duration-300"
              >
                <div className="flex justify-center gap-2">
                  <input
                    className="w-32 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 text-center"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="First"
                  />
                  <input
                    className="w-32 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 text-center"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Last"
                  />
                </div>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-50 transition-all transform hover:scale-110 active:scale-95"
                    onClick={() => setEditMode({...editMode, name: false})}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-all transform hover:scale-110 active:scale-95"
                    onClick={() => handleSave('name')}
                  >
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center justify-center mt-4 transition-all duration-300"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {formData.firstName} {formData.lastName}
                </h2>
                <button
                  className="ml-2 p-1 rounded-full text-blue-500 hover:bg-blue-50 transition-all transform hover:scale-120 active:scale-90"
                  onClick={() => setEditMode({...editMode, name: true})}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            {/* Profession */}
            {editMode.profession ? (
              <div 
                className="mt-2 transition-all duration-300"
              >
                <input
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 text-center text-sm"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                  placeholder="Your profession"
                />
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-50 transition-all transform hover:scale-110 active:scale-95"
                    onClick={() => setEditMode({...editMode, profession: false})}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-all transform hover:scale-110 active:scale-95"
                    onClick={() => handleSave('profession')}
                  >
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center justify-center mt-1 transition-all duration-300"
              >
                <p className="text-gray-500 text-sm">
                  <Briefcase className="h-3.5 w-3.5 inline mr-1.5 text-blue-500" />
                  {formData.profession}
                </p>
                <button
                  className="ml-2 p-1 rounded-full text-blue-500 hover:bg-blue-50 transition-all transform hover:scale-120 active:scale-90"
                  onClick={() => setEditMode({...editMode, profession: true})}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Stats Row with Fixed Member Since Card */}
            <div className="w-full flex justify-center gap-4 mt-5">
              <MotionDiv 
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  boxShadow: "0 8px 20px -5px rgba(59, 130, 246, 0.3)",
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-blue-50 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-lg font-semibold text-blue-600">{userData.stats.completedTasks}</div>
                <div className="text-xs text-blue-500">Tasks</div>
              </MotionDiv>
              
              <MotionDiv 
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  boxShadow: "0 8px 20px -5px rgba(99, 102, 241, 0.3)",
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-indigo-50 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-lg font-semibold text-indigo-600">{userData.stats.activeProjects}</div>
                <div className="text-xs text-indigo-500">Projects</div>
              </MotionDiv>
              
              {/* Fixed Member Since Card with Date */}
              <MotionDiv 
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  boxShadow: "0 8px 20px -5px rgba(168, 85, 247, 0.3)",
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-purple-50 text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex flex-col items-center justify-center">
                  <Calendar className="h-4 w-4 text-purple-600 mb-1" />
                  <div className="text-xs text-purple-500">Member since</div>
                  <div className="text-xs mt-1 font-medium text-purple-600">
                    {formatDate(userData.joinDate)}
                  </div>
                </div>
              </MotionDiv>
            </div>
            
            {/* Profile Image Update Menu - Properly positioned */}
            {showImageUpload && (
              <div
                ref={menuRef}
                className="absolute top-36 left-1/2 transform -translate-x-1/2 z-50 w-48 rounded-xl bg-white shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 opacity-100 scale-100"
                style={{ marginTop: "10px" }}
              >
                <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800">Update Picture</h3>
                </div>
                
                <div className="p-3 space-y-2">
                  <button
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all text-sm font-medium text-blue-700 transform hover:scale-102 active:scale-98"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span>Upload Image</span>
                  </button>
                  
                  {profileImage && (
                    <button
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-red-50 hover:bg-red-100 transition-all text-sm font-medium text-red-700 transform hover:scale-102 active:scale-98"
                      onClick={handleRemoveProfilePicture}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                  
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </MotionDiv>
      
      {/* Email Section */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -5, 
          boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.15)",
        }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl p-5 mb-5 shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
      >
        <h3 className="text-sm font-medium mb-3 flex items-center text-gray-700">
          <Mail className="h-4 w-4 mr-2 text-blue-500" />
          Email Address
        </h3>
        
        <div className="bg-gray-50 rounded-2xl p-3 flex items-center">
          <div className="text-sm text-gray-700">{userData.email}</div>
        </div>
        <p className="text-xs mt-1.5 text-gray-500 ml-1">Your email address cannot be changed</p>
      </MotionDiv>
      
      {/* Recent Activity */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          y: -5, 
          boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.15)",
        }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl p-5 shadow-md relative transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center text-gray-700">
            <BarChart className="h-4 w-4 mr-2 text-blue-500" />
            Recent Activity
          </h3>
          <button
            className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1.5 overflow-hidden group shadow-sm transition-all duration-300 transform hover:scale-105 hover:bg-blue-100 hover:shadow-md active:scale-95"
            onClick={() => console.log('View all clicked')}
          >
            <span>View All</span>
            <div className="transform group-hover:translate-x-1 transition-transform">
              <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        </div>
        
        <div className="space-y-1.5">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className="p-3 rounded-2xl flex items-start gap-3 transition-all duration-300 transform hover:translate-x-1 hover:bg-gray-50 hover:shadow-md"
              style={{
                opacity: 1,
                animationDelay: `${index * 100}ms`,
                animationDuration: '300ms',
                animationName: 'fadeInUp',
                animationFillMode: 'forwards'
              }}
            >
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
                <ActivityIcon type={activity.type} color={activity.iconColor} />
              </div>
              <div className="flex-1">
                <p className="text-sm leading-snug text-gray-700">
                  {activity.action === 'completed' && 'Completed task '}
                  {activity.action === 'created' && 'Created new project '}
                  {activity.action === 'updated' && 'Added new team member to '}
                  <span className="font-medium">"{activity.title}"</span>
                </p>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(activity.date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MotionDiv>
      
      {/* App version */}
      <div 
        className="text-center mt-8 text-xs text-gray-400"
        style={{
          opacity: 0,
          animation: 'fadeIn 600ms forwards',
          animationDelay: '600ms'
        }}
      >
        <p>TaskUp v2.4.1</p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}