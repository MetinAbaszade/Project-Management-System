'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Get theme directly from document attribute
  const [currentTheme, setCurrentTheme] = useState('dark')
  
  // Setup theme change detection with MutationObserver
  useEffect(() => {
    // Initial theme detection
    const detectInitialTheme = () => {
      const root = document.documentElement
      const dataTheme = root.getAttribute('data-theme')
      if (dataTheme) {
        setCurrentTheme(dataTheme)
      }
    }
    
    detectInitialTheme()
    
    // Watch for theme changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'data-theme'
        ) {
          const newTheme = document.documentElement.getAttribute('data-theme')
          if (newTheme && newTheme !== currentTheme) {
            setCurrentTheme(newTheme)
          }
        }
      })
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
    
    return () => observer.disconnect()
  }, [])

  // Handle logout action
  const handleLogout = () => {
    localStorage.removeItem('taskup_token')
    localStorage.removeItem('authToken')
    router.push('/login')
  }

  useEffect(() => {
    const checkMobile = () => {
      const isSmall = window.innerWidth < 768
      setIsMobile(isSmall)
      if (isSmall && !collapsed) setCollapsed(true)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [collapsed])

  const toggleSidebar = () => setCollapsed(!collapsed)
  
  // Theme-dependent styles
  const getThemeColors = () => {
    switch (currentTheme) {
      case 'blue':
        return {
          bg: 'bg-gradient-to-b from-blue-900 to-blue-950',
          active: 'bg-blue-800/40 text-blue-200',
          hover: 'hover:bg-blue-800/20',
          shadow: 'shadow-blue-900/20',
          indicator: 'bg-gradient-to-r from-blue-400 to-indigo-400'
        };
      case 'green':
      case 'lushForest':
        return {
          bg: 'bg-gradient-to-b from-green-900 to-green-950',
          active: 'bg-green-800/40 text-green-200',
          hover: 'hover:bg-green-800/20',
          shadow: 'shadow-green-900/20',
          indicator: 'bg-gradient-to-r from-green-400 to-teal-400'
        };
      case 'sundownSerenity':
        return {
          bg: 'bg-gradient-to-b from-amber-900 to-amber-950',
          active: 'bg-amber-800/40 text-amber-200',
          hover: 'hover:bg-amber-800/20',
          shadow: 'shadow-amber-900/20',
          indicator: 'bg-gradient-to-r from-amber-400 to-orange-400'
        };
      case 'technoAurora':
        return {
          bg: 'bg-gradient-to-b from-indigo-900 to-indigo-950',
          active: 'bg-indigo-800/40 text-indigo-200',
          hover: 'hover:bg-indigo-800/20',
          shadow: 'shadow-indigo-900/20',
          indicator: 'bg-gradient-to-r from-indigo-400 to-purple-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-b from-[#1e3a8a] to-[#172554]',
          active: 'bg-blue-800/40 text-blue-200',
          hover: 'hover:bg-blue-800/20',
          shadow: 'shadow-blue-900/20',
          indicator: 'bg-gradient-to-r from-blue-400 to-indigo-400'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? '68px' : '220px',
          x: isMobile && collapsed ? '-100%' : 0,
          transition: { 
            type: "spring", 
            stiffness: 400, 
            damping: 30 
          }
        }}
        className={cn(
          'fixed left-0 top-0 h-screen z-30 flex flex-col',
          colors.bg,
          'border-r border-white/5 shadow-lg',
          colors.shadow,
          'backdrop-blur-md'
        )}
      >
        {/* Top Area */}
        <div className="h-16 px-4 flex items-center justify-end">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all",
              collapsed && "mx-auto"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180" 
            )} />
          </motion.button>
        </div>

        {/* Navigation Items */}
        <div className="mt-2 px-3 flex-grow">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 h-10 px-3 rounded-xl',
                      'transition-all duration-200 text-sm',
                      isActive 
                        ? cn(colors.active, 'font-medium backdrop-blur-sm')
                        : cn('text-white/60', colors.hover, 'hover:text-white/90')
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-6 h-6",
                      isActive ? 'text-white' : 'text-white/50'
                    )}>
                      <item.icon className="h-[18px] w-[18px]" />
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {isActive && (
                      <motion.div 
                        className={cn(
                          "ml-auto h-1.5 w-1.5 rounded-full",
                          colors.indicator,
                          collapsed && "absolute right-3"
                        )}
                        layoutId="nav-indicator"
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>
        </div>
        
        {/* Bottom section */}
        <div className="p-3 mb-2">
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-800/20 transition-all duration-200 text-sm"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <LogOut className="h-[18px] w-[18px]" />
            </div>
            
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    
      {/* Space reservation for sidebar */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[220px]",
        isMobile && "w-0"
      )} />
    </>
  )
}