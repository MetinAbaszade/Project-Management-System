// src/components/projects/ProjectCreationFlow.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Upload, Check, Info, Search, PlusCircle, 
  Calendar, Trash2, AlignLeft, ChevronRight
} from 'lucide-react';
import { dataService } from '../../services/SeedDataService';
import { useAuth } from '../../context/AuthContext';

// User search for member invitation
const UserSearch = ({ onInvite }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState('editor');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const users = await dataService.getUsers(searchQuery);
      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = (user) => {
    onInvite({
      userId: user.id,
      role: selectedRole,
      permission: selectedRole === 'admin' ? 'admin' : 'editor',
      joinedAt: new Date().toISOString()
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div>
      <div className="flex mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            className="ios-input pr-10"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {searching ? (
              <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            ) : (
              <Search className="h-5 w-5 text-gray-400 cursor-pointer" onClick={handleSearch} />
            )}
          </div>
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="ios-select ml-3 w-36"
        >
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      
      {searchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
          {searchResults.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="ios-avatar w-8 h-8 text-sm">
                  {user.firstName[0]}
                </div>
                <div className="ml-3">
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => handleInvite(user)}
                className="ios-button ios-button-secondary py-1.5 ml-2"
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// File upload component
const AttachmentUploader = ({ onAddAttachment, onRemoveAttachment, attachments = [] }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, you'd upload this file to a server
    // For now, we'll create a mock attachment
    const newAttachment = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.name.split('.').pop(),
      uploadedBy: '1', // Current user ID
      uploadedAt: new Date().toISOString(),
      url: '#'
    };
    
    onAddAttachment(newAttachment);
    
    // Reset the file input
    e.target.value = '';
  };

  return (
    <div>
      <div className="mt-2 mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="ios-button ios-button-secondary w-full py-4 flex-col h-24"
        >
          <Upload className="h-6 w-6 mb-2" />
          <span>Click to upload or drag and drop</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            PDF, Word, Excel, PowerPoint, Images
          </span>
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      
      {attachments.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium">Attached Files</h3>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            {attachments.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 mr-3">
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{file.size}</div>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveAttachment(file.id)}
                  className="text-gray-500 hover:text-red-500 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main project creation component
const ProjectCreationFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Form state
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    scope: {
      included: '',
      excluded: '',
      startDate: '',
      endDate: ''
    },
    attachments: [],
    members: [],
    owner: user?.id || '1' // Default to first user if not logged in
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects
      const [parent, child] = name.split('.');
      setProjectData({
        ...projectData,
        [parent]: {
          ...projectData[parent],
          [child]: value
        }
      });
    } else {
      setProjectData({
        ...projectData,
        [name]: value
      });
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!projectData.name.trim()) {
        newErrors.name = 'Project name is required';
      } else if (projectData.name.length < 3) {
        newErrors.name = 'Project name must be at least 3 characters';
      }
      
      if (!projectData.description.trim()) {
        newErrors.description = 'Project description is required';
      }
    }
    
    if (currentStep === 2) {
      if (!projectData.scope.startDate) {
        newErrors['scope.startDate'] = 'Start date is required';
      }
      
      if (!projectData.scope.endDate) {
        newErrors['scope.endDate'] = 'End date is required';
      } else if (
        projectData.scope.startDate &&
        new Date(projectData.scope.endDate) <= new Date(projectData.scope.startDate)
      ) {
        newErrors['scope.endDate'] = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Handle attachments
  const handleAddAttachment = (attachment) => {
    setProjectData({
      ...projectData,
      attachments: [...projectData.attachments, attachment]
    });
  };
  
  const handleRemoveAttachment = (id) => {
    setProjectData({
      ...projectData,
      attachments: projectData.attachments.filter(attachment => attachment.id !== id)
    });
  };
  
  // Handle members
  const handleAddMember = (member) => {
    // Check if member is already added
    if (projectData.members.some(m => m.userId === member.userId)) {
      return;
    }
    
    setProjectData({
      ...projectData,
      members: [...projectData.members, member]
    });
  };
  
  const handleRemoveMember = (userId) => {
    setProjectData({
      ...projectData,
      members: projectData.members.filter(member => member.userId !== userId)
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // Add the current user as project owner with admin permissions
      if (!projectData.members.some(m => m.userId === projectData.owner)) {
        projectData.members.unshift({
          userId: projectData.owner,
          role: 'Project Manager',
          permission: 'admin',
          joinedAt: new Date().toISOString()
        });
      }
      
      const newProject = await dataService.createProject(projectData);
      
      // Redirect to the new project page
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({
        ...errors,
        submit: 'Failed to create project. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Dynamic content based on step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="ios-animate-slide-up">
            <h2 className="ios-section-header mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="ios-label">Project Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={projectData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className={`ios-input ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="ios-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={projectData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows={4}
                  className={`ios-input ${errors.description ? 'ring-2 ring-red-500' : ''}`}
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="ios-animate-slide-up">
            <h2 className="ios-section-header mb-6">Project Scope & Attachments</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scope.startDate" className="ios-label">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="scope.startDate"
                      name="scope.startDate"
                      value={projectData.scope.startDate}
                      onChange={handleChange}
                      className={`ios-input pl-10 ${errors['scope.startDate'] ? 'ring-2 ring-red-500' : ''}`}
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {errors['scope.startDate'] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors['scope.startDate']}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="scope.endDate" className="ios-label">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="scope.endDate"
                      name="scope.endDate"
                      value={projectData.scope.endDate}
                      onChange={handleChange}
                      className={`ios-input pl-10 ${errors['scope.endDate'] ? 'ring-2 ring-red-500' : ''}`}
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {errors['scope.endDate'] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors['scope.endDate']}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="scope.included" className="ios-label">Included in Scope</label>
                <div className="relative">
                  <textarea
                    id="scope.included"
                    name="scope.included"
                    value={projectData.scope.included}
                    onChange={handleChange}
                    placeholder="List items included in the project scope (use '-' for bullet points)"
                    rows={3}
                    className="ios-input pl-10"
                  ></textarea>
                  <AlignLeft className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Example: "- Design all user interfaces - Implement user authentication"
                </p>
              </div>
              
              <div>
                <label htmlFor="scope.excluded" className="ios-label">Excluded from Scope</label>
                <div className="relative">
                  <textarea
                    id="scope.excluded"
                    name="scope.excluded"
                    value={projectData.scope.excluded}
                    onChange={handleChange}
                    placeholder="List items excluded from the project scope (use '-' for bullet points)"
                    rows={3}
                    className="ios-input pl-10"
                  ></textarea>
                  <AlignLeft className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="ios-label">Attachments</label>
                <AttachmentUploader
                  onAddAttachment={handleAddAttachment}
                  onRemoveAttachment={handleRemoveAttachment}
                  attachments={projectData.attachments}
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="ios-animate-slide-up">
            <h2 className="ios-section-header mb-6">Invite Team Members</h2>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">You will be added as the project owner</p>
                <p className="mt-1">Invite additional team members to collaborate on this project.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <UserSearch onInvite={handleAddMember} />
            </div>
            
            {projectData.members.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Invited Members ({projectData.members.length})</h3>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {projectData.members.map(member => (
                    <div key={member.userId} className="flex items-center justify-between p-3">
                      <div className="flex items-center">
                        <div className="ios-avatar w-8 h-8 text-sm">
                          {member.userId === projectData.owner ? 'You' : member.userId.substring(0, 1)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{member.userId === projectData.owner ? 'You' : `User ${member.userId}`}</div>
                          <div className="flex items-center">
                            <span className="text-xs ios-badge ios-badge-blue mr-2">{member.role}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{member.permission}</span>
                          </div>
                        </div>
                      </div>
                      {member.userId !== projectData.owner && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-gray-500 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="text-sm font-medium mb-2">Project Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <div className="text-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="font-medium">{projectData.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Timeline:</span>
                    <span className="font-medium">
                      {projectData.scope.startDate} to {projectData.scope.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Team members:</span>
                    <span className="font-medium">{projectData.members.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Attachments:</span>
                    <span className="font-medium">{projectData.attachments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Create New Project</h1>
        <div className="w-7"></div> {/* Empty div for spacing */}
      </div>
      
      {/* Progress Steps */}
      <div className="ios-card p-4 mb-6">
        <div className="flex items-center">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <React.Fragment key={index}>
              <div className="ios-progress-step">
                <div className={`ios-progress-step-circle ${
                  index + 1 < currentStep ? 'completed' : 
                  index + 1 > currentStep ? 'inactive' : ''
                }`}>
                  {index + 1 < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </div>
              
              {index < totalSteps - 1 && (
                <div className={`ios-progress-step-line ${
                  index + 1 < currentStep ? '' : 'inactive'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className={currentStep >= 1 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>Basic Info</div>
          <div className={currentStep >= 2 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>Scope & Files</div>
          <div className={currentStep >= 3 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>Team</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ios-card p-6 mb-6">
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center">
            <Info className="h-5 w-5 mr-2" />
            {errors.submit}
          </div>
        )}
        
        {renderStepContent()}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePreviousStep}
            className="ios-button ios-button-secondary"
          >
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ios-button ios-button-secondary"
          >
            Cancel
          </button>
        )}
        
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="ios-button ios-button-primary flex items-center"
          >
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="ios-button ios-button-primary flex items-center"
          >
            {isSubmitting ? (
              <>Creating<div className="ml-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div></>
            ) : (
              <>Create Project<PlusCircle className="h-4 w-4 ml-2" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCreationFlow;