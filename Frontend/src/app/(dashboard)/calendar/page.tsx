'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Check, Plus, X, Search, Filter } from 'lucide-react';

// Utility function to replace cn from @/lib/utils
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

// Custom components to replace the missing UI components
const GlassPanel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '',
  onClick
}: { 
  children: React.ReactNode, 
  variant?: 'default' | 'outline' | 'ghost', 
  size?: 'default' | 'sm' | 'lg' | 'icon',
  className?: string,
  onClick?: () => void 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded-md focus:outline-none';
  const variantClasses = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white',
    outline: 'border border-white/20 hover:bg-white/10 text-white',
    ghost: 'hover:bg-white/10 text-white'
  };
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 py-1.5 text-sm',
    lg: 'h-11 px-6 py-3 text-lg',
    icon: 'h-10 w-10 p-0'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
};

// Simple tooltip component
const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block" 
         onMouseEnter={() => setIsVisible(true)} 
         onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
        </div>
      )}
    </div>
  );
};

// Simple dropdown component
const Dropdown = ({ 
  trigger, 
  items, 
  value, 
  onChange 
}: { 
  trigger: React.ReactNode, 
  items: { label: string, value: string }[],
  value: string,
  onChange: (value: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 rounded-md bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            {items.map((item) => (
              <div
                key={item.value}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-white/10 ${value === item.value ? 'text-blue-500' : 'text-white'}`}
                onClick={() => {
                  onChange(item.value);
                  setIsOpen(false);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// iOS-like segmented control
const SegmentedControl = ({ 
  options, 
  selectedOption, 
  onChange 
}: {
  options: string[],
  selectedOption: string,
  onChange: (option: string) => void
}) => {
  return (
    <div className="flex bg-white/5 backdrop-blur-md rounded-lg p-1.5 border border-white/10">
      {options.map((option) => (
        <button
          key={option}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            selectedOption === option 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 2000, prefix = '', suffix = '' }: { 
  value: number | string, 
  duration?: number, 
  prefix?: string, 
  suffix?: string 
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString());
    const incrementTime = (duration / end) * 1.1;
    
    // Don't run if value is zero
    if (end === 0) return;
    
    // Timer to increment counter
    let timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    
    // Cleanup
    return () => {
      clearInterval(timer);
    };
  }, [value, duration]);
  
  let formattedCount: string | number = count;
  if (typeof count === 'number' && count >= 1000) {
    formattedCount = (count / 1000).toFixed(1) + 'k';
  }
  
  return <span>{prefix}{formattedCount}{suffix}</span>;
};

// Calendar related types
type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  attendees?: number;
  category: 'meeting' | 'personal' | 'task' | 'reminder';
  categoryColor: string;
};

type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

// Generate dates for the calendar
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const getLastDayOfMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDay();
};

const getDateRange = (date: Date, view: CalendarViewType) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (view === 'month') {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const lastDay = getLastDayOfMonth(year, month);
    
    // Get days from previous month
    const daysFromPrevMonth = firstDay;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    // Get days from next month
    const daysFromNextMonth = 6 - lastDay;
    
    const dates: Date[] = [];
    
    // Add days from previous month
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      dates.push(new Date(prevMonthYear, prevMonth, i));
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
    
    // Add days from next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= daysFromNextMonth; i++) {
      dates.push(new Date(nextMonthYear, nextMonth, i));
    }
    
    return dates;
  } else if (view === 'week') {
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(weekStart);
      newDate.setDate(weekStart.getDate() + i);
      dates.push(newDate);
    }
    
    return dates;
  } else {
    // Day view - just return the current day
    return [new Date(date)];
  }
};

// Sample calendar events
const generateCalendarEvents = (): CalendarEvent[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const events: CalendarEvent[] = [];
  
  // Categories with their colors
  const categories = [
    { name: 'meeting', color: 'bg-blue-500' },
    { name: 'personal', color: 'bg-green-500' },
    { name: 'task', color: 'bg-purple-500' },
    { name: 'reminder', color: 'bg-orange-500' }
  ];
  
  // Generate events for the current month
  for (let i = 1; i <= 28; i++) {
    const eventDate = new Date(currentYear, currentMonth, i);
    const dayOfWeek = eventDate.getDay();
    
    // Skip weekends for some event types
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Morning meeting
      if (Math.random() > 0.6) {
        const category = categories[0];
        events.push({
          id: `meeting-${i}`,
          title: `Team Sync Meeting`,
          start: new Date(currentYear, currentMonth, i, 9, 30),
          end: new Date(currentYear, currentMonth, i, 10, 30),
          category: 'meeting' as 'meeting',
          categoryColor: category.color,
          attendees: Math.floor(Math.random() * 8) + 2
        });
      }
      
      // Afternoon task
      if (Math.random() > 0.7) {
        const category = categories[2];
        events.push({
          id: `task-${i}`,
          title: `Project Review`,
          start: new Date(currentYear, currentMonth, i, 14, 0),
          end: new Date(currentYear, currentMonth, i, 15, 0),
          category: 'task' as 'task',
          categoryColor: category.color
        });
      }
    }
    
    // Personal events (including weekends)
    if (Math.random() > 0.85) {
      const category = categories[1];
      events.push({
        id: `personal-${i}`,
        title: `Gym Session`,
        start: new Date(currentYear, currentMonth, i, 18, 0),
        end: new Date(currentYear, currentMonth, i, 19, 30),
        category: 'personal' as 'personal',
        categoryColor: category.color
      });
    }
    
    // Reminders (any day)
    if (Math.random() > 0.9) {
      const category = categories[3];
      events.push({
        id: `reminder-${i}`,
        title: `Follow-up Deadline`,
        start: new Date(currentYear, currentMonth, i, 12, 0),
        end: new Date(currentYear, currentMonth, i, 12, 30),
        category: 'reminder' as 'reminder',
        categoryColor: category.color
      });
    }
  }
  
  // Add some all-day events
  for (let i = 1; i <= 3; i++) {
    const day = Math.floor(Math.random() * 28) + 1;
    const category = categories[Math.floor(Math.random() * categories.length)];
    events.push({
      id: `allday-${i}`,
      title: `Conference Day ${i}`,
      start: new Date(currentYear, currentMonth, day),
      end: new Date(currentYear, currentMonth, day),
      allDay: true,
      category: category.name as 'meeting' | 'personal' | 'task' | 'reminder',
      categoryColor: category.color
    });
  }
  
  return events;
};

// Generate time slots for day view
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    slots.push({
      hour: i,
      label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
    });
  }
  return slots;
};

// Format date for display
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Calendar filtering options
const viewOptions = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Day', value: 'day' },
  { label: 'Agenda', value: 'agenda' }
];

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Meetings', value: 'meeting' },
  { label: 'Personal', value: 'personal' },
  { label: 'Tasks', value: 'task' },
  { label: 'Reminders', value: 'reminder' }
];

export default function CalendarPage() {
  // State for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  
  // Load events on mount
  useEffect(() => {
    const loadedEvents = generateCalendarEvents();
    setEvents(loadedEvents);
    setFilteredEvents(loadedEvents);
    setMounted(true);
  }, []);
  
  // Filter events when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === selectedCategory));
    }
  }, [selectedCategory, events]);
  
  // Get dates for the current view
  const dates = useMemo(() => {
    return getDateRange(currentDate, view);
  }, [currentDate, view]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };
  
  const calendarVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  const staggerItemsVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.05
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };
  
  // Navigation functions
  const goToPreviousPeriod = () => {
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    
    setCurrentDate(newDate);
  };
  
  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() && 
             eventDate.getFullYear() === date.getFullYear();
    });
  };
  
  // Format header text based on view
  const getHeaderText = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long',
      year: 'numeric'
    };
    
    if (view === 'week') {
      const weekStart = dates[0];
      const weekEnd = dates[6];
      
      const startMonth = weekStart.toLocaleString('default', { month: 'short' });
      const endMonth = weekEnd.toLocaleString('default', { month: 'short' });
      
      if (startMonth === endMonth) {
        return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else {
        return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      }
    } else if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else {
      return currentDate.toLocaleDateString('en-US', options);
    }
  };
  
  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };
  
  // Close event details
  const closeEventDetails = () => {
    setIsEventDetailsOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  };
  
  // Time slots for day view
  const timeSlots = generateTimeSlots();
  
  // Format time for display
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Get total events count for stats
  const totalEvents = events.length;
  const meetingsCount = events.filter(e => e.category === 'meeting').length;
  const personalCount = events.filter(e => e.category === 'personal').length;
  const tasksCount = events.filter(e => e.category === 'task').length;
  const remindersCount = events.filter(e => e.category === 'reminder').length;
  
  return (
    <motion.div 
      className="space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Area */}
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-semibold">📅</span>
              </div>
              <h1 className="text-2xl font-bold">Calendar</h1>
            </div>
            <p className="text-gray-400">
              Manage your schedule and events
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View switcher */}
            <SegmentedControl 
              options={['Month', 'Week', 'Day', 'Agenda']} 
              selectedOption={view.charAt(0).toUpperCase() + view.slice(1)}
              onChange={(option) => setView(option.toLowerCase() as CalendarViewType)}
            />

            {/* Category filter */}
            <Dropdown
              trigger={
                <Button 
                  variant="outline" 
                  size="sm"
                  className="min-w-[110px] h-9 px-4"
                >
                  <Filter className="h-4 w-4 mr-2" /> 
                  {selectedCategory === 'all' ? 'All' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                </Button>
              }
              items={categoryOptions}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value)}
            />

            <Button 
              variant="outline" 
              size="sm"
              className="min-w-[100px] h-9 px-4"
              onClick={goToToday}
            >
              <CalendarIcon className="h-4 w-4 mr-2" /> Today
            </Button>
          </div>
        </div>
      </GlassPanel>

      {/* Calendar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-blue-500/10 rounded-lg p-2.5">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400 text-sm">Total Events</div>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={totalEvents} />
              </div>
            </div>
          </GlassPanel>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          transition={{ delay: 0.2 }}
        >
          <GlassPanel className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-purple-500/10 rounded-lg p-2.5">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400 text-sm">Meetings</div>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={meetingsCount} />
              </div>
            </div>
          </GlassPanel>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          transition={{ delay: 0.3 }}
        >
          <GlassPanel className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-green-500/10 rounded-lg p-2.5">
                <Check className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400 text-sm">Tasks</div>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={tasksCount} />
              </div>
            </div>
          </GlassPanel>
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          transition={{ delay: 0.4 }}
        >
          <GlassPanel className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-orange-500/10 rounded-lg p-2.5">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400 text-sm">Personal</div>
              <div className="text-2xl font-bold">
                <AnimatedCounter value={personalCount} />
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Main Calendar */}
      <motion.div 
        variants={calendarVariants}
        initial="hidden"
        animate={mounted ? "visible" : "hidden"}
        transition={{ delay: 0.5 }}
      >
        <GlassPanel className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{getHeaderText()}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousPeriod}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextPeriod}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Month View */}
          {view === 'month' && (
            <motion.div 
              variants={staggerItemsVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-7 gap-2"
            >
              {/* Day headers */}
              {weekDays.map((day) => (
                <div key={day} className="text-center py-2 text-sm font-medium text-gray-400">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {dates.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const dayEvents = getEventsForDate(date);
                
                return (
                  <motion.div 
                    key={date.toISOString()}
                    variants={itemVariants}
                    className={`min-h-28 p-2 rounded-lg border ${
                      isToday ? 'border-blue-500 bg-blue-500/10' : 
                      isCurrentMonth ? 'border-white/10 hover:border-white/20' : 
                      'border-white/5 bg-white/5 text-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${isToday ? 'text-blue-500' : ''}`}>
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-500">
                          {dayEvents.length}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div 
                          key={event.id}
                                                    className={`text-xs px-2 py-0.5 rounded-md cursor-pointer truncate ${event.categoryColor}`}
                          onClick={() => handleEventClick(event)}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-400 mt-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Placeholder for other views (Week, Day, Agenda) */}
          {view !== 'month' && (
            <div className="text-center text-gray-400 py-10">
              {view.charAt(0).toUpperCase() + view.slice(1)} view coming soon...
            </div>
          )}
        </GlassPanel>
      </motion.div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {isEventDetailsOpen && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/10 p-6 rounded-xl w-full max-w-md backdrop-blur-md border border-white/10 shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">{selectedEvent.title}</h3>
                <Button variant="ghost" size="icon" onClick={closeEventDetails}>
                  <X className="h-5 w-5 text-white" />
                </Button>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                {selectedEvent.description || 'No additional details provided.'}
              </p>
              <p className="text-sm text-gray-400">
                <strong>Start:</strong> {formatEventTime(new Date(selectedEvent.start))}
              </p>
              <p className="text-sm text-gray-400 mb-2">
                <strong>End:</strong> {formatEventTime(new Date(selectedEvent.end))}
              </p>
              {selectedEvent.attendees && (
                <p className="text-sm text-gray-400">
                  <strong>Attendees:</strong> {selectedEvent.attendees}
                </p>
              )}
              <Badge className={`${selectedEvent.categoryColor} text-white mt-3`}>
                {selectedEvent.category}
              </Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
