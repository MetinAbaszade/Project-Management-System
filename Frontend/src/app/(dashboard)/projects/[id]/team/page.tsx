'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users, 
  X, 
  User, 
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectTeams, deleteTeam } from '@/api/TeamAPI';
import { useAuth } from '@/contexts/AuthContext';

// Styles
import './teams.css';

// Team colors based on ColorIndex
const TEAM_COLORS = [
  { bg: 'var(--team-color-1)', text: 'var(--team-color-1-text)' },
  { bg: 'var(--team-color-2)', text: 'var(--team-color-2-text)' },
  { bg: 'var(--team-color-3)', text: 'var(--team-color-3-text)' },
  { bg: 'var(--team-color-4)', text: 'var(--team-color-4-text)' },
  { bg: 'var(--team-color-5)', text: 'var(--team-color-5-text)' },
  { bg: 'var(--team-color-6)', text: 'var(--team-color-6-text)' },
];

export default function ProjectTeamsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [activeTeamMenu, setActiveTeamMenu] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  
  // Ref for dropdown menu closing
  const menuRef = useRef(null);
  
  // Get user ID from JWT token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || decoded.id || decoded.userId;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Handle click outside of dropdown menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveTeamMenu(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch project and teams data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch project and teams in parallel
        const [projectData, teamsData] = await Promise.all([
          getProjectById(id),
          getProjectTeams(id)
        ]);
        
        setProject(projectData);
        setTeams(teamsData);
        
        // Determine if current user is project owner
        const userId = user?.Id || getUserIdFromToken();
        setIsOwner(userId === projectData.OwnerId);
      } catch (error) {
        console.error('Failed to load project teams:', error);
        toast.error('Could not load teams for this project');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id, user]);
  
  // Filter teams based on search query
  const filteredTeams = teams.filter(team => 
    !searchQuery || 
    team.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.Description && team.Description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Delete team handler
  const handleDeleteTeam = async (teamId) => {
    try {
      setDeletingTeam(teamId);
      await deleteTeam(teamId);
      
      // Update local state
      setTeams(prevTeams => prevTeams.filter(team => team.Id !== teamId));
      setActiveTeamMenu(null);
      
      toast.success('Team deleted successfully');
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Could not delete team');
    } finally {
      setDeletingTeam(null);
    }
  };
  
  // Get team color based on ColorIndex
  const getTeamColor = (colorIndex) => {
    const index = colorIndex % TEAM_COLORS.length;
    return TEAM_COLORS[index] || TEAM_COLORS[0];
  };
  
  // Get initials from team name
  const getTeamInitials = (name) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  
  // Render loading skeletons
  const renderSkeletons = () => (
    <div className="teams-grid">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div 
          key={index} 
          className="team-card-skeleton"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.1 }}
        >
          <div className="team-avatar-skeleton"></div>
          <div className="team-content-skeleton">
            <div className="team-title-skeleton"></div>
            <div className="team-desc-skeleton"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
  
        const renderEmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="modern-empty-state"
  >
    <div className="empty-illustration">
      <div className="empty-icons">
        <div className="empty-icon icon-1"><Users size={28} /></div>
        <div className="empty-icon icon-2"><User size={24} /></div>
        <div className="empty-icon icon-3"><User size={20} /></div>
        <div className="empty-icon icon-4"><User size={22} /></div>
      </div>
      <div className="empty-circle"></div>
      <div className="empty-shadow"></div>
    </div>
    
    <div className="empty-content">
      <h2>Build Your Team</h2>
      <p>
        Teams help organize members and assign tasks efficiently.
        {isOwner ? ' Create your first team to get started.' : ' The project owner needs to create teams for this project.'}
      </p>
      
      <div className="button-container">
        {isOwner && (
          <motion.button 
            className="create-first-team-button"
            onClick={() => router.push(`/projects/${id}/team/create`)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} />
            <span>Create First Team</span>
          </motion.button>
        )}
      </div>
    </div>
  </motion.div>
       );
  
  // Render search empty state
  const renderSearchEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="modern-empty-state"
    >
      <div className="empty-illustration search-results">
        <div className="search-icon">
          <Search size={40} />
        </div>
        <div className="empty-circle"></div>
        <div className="empty-shadow"></div>
      </div>
      
      <div className="empty-content">
        <h2>No Matching Teams</h2>
        <p>No teams match your search criteria.</p>
        <motion.button 
          className="empty-secondary-button"
          onClick={() => setSearchQuery('')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Clear Search
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div className="project-teams-container">
      {/* Header */}
      <motion.div 
        className="project-teams-header"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="project-teams-title">
          <button 
            className="back-button" 
            onClick={() => router.push(`/projects/${id}`)}
            aria-label="Back to project"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>{project?.Name || 'Project'} Teams</h1>
            <p className="subtitle">
              Manage teams for this project
            </p>
          </div>
        </div>
        
        {/* Create Team button - only shown to project owner */}
        {isOwner && (
          <motion.button 
            className="create-team-button"
            onClick={() => router.push(`/projects/${id}/team/create`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Plus size={18} />
            <span>Create Team</span>
          </motion.button>
        )}
      </motion.div>
      
      {/* Search bar - fixed with more visible borders and no redundant icon */}
      <motion.div 
        className="search-container"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search teams"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Empty state or Teams grid */}
      <div className="content-wrapper">
        {loading ? (
          renderSkeletons()
        ) : teams.length === 0 ? (
          renderEmptyState()
        ) : filteredTeams.length === 0 ? (
          renderSearchEmptyState()
        ) : (
          <div className="teams-grid">
            <AnimatePresence>
              {filteredTeams.map((team, index) => {
                const teamColor = getTeamColor(team.ColorIndex);
                
                return (
                  <motion.div 
                    key={team.Id}
                    className="team-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <div 
                      className="team-avatar"
                      style={{ backgroundColor: teamColor.bg, color: teamColor.text }}
                      onClick={() => router.push(`/projects/${id}/team/${team.Id}`)}
                    >
                      {getTeamInitials(team.Name)}
                    </div>
                    
                    <div className="team-content" onClick={() => router.push(`/projects/${id}/team/${team.Id}`)}>
                      <h3 className="team-name">{team.Name}</h3>
                      {team.Description && (
                        <p className="team-description">{team.Description}</p>
                      )}
                    </div>
                    
                    {isOwner && (
                      <div className="team-menu-container" ref={menuRef}>
                        <button 
                          className="team-menu-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTeamMenu(activeTeamMenu === team.Id ? null : team.Id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        <AnimatePresence>
                          {activeTeamMenu === team.Id && (
                            <motion.div 
                              className="team-menu"
                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <button 
                                className="team-menu-item delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete the team "${team.Name}"?`)) {
                                    handleDeleteTeam(team.Id);
                                  }
                                }}
                                disabled={deletingTeam === team.Id}
                              >
                                {deletingTeam === team.Id ? (
                                  <div className="loading-spinner small"></div>
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                <span>{deletingTeam === team.Id ? 'Deleting...' : 'Delete Team'}</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    
                    <div 
                      className="team-members-indicator"
                      onClick={() => router.push(`/projects/${id}/team/${team.Id}`)}
                    >
                      <User size={14} />
                      <span>View Team</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}