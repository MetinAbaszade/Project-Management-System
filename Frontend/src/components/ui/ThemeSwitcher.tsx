'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const extendedThemes = {
  neonPulse: {
    name: "Neon Pulse",
    primary: "#0EF0FF",
    background: "#0A0E1A",
    foreground: "#FFFFFF",
    muted: "#101428",
    description: "Futuristic, vibrant, high-energy",
    gradient: "from-blue-500 via-purple-500 to-pink-500"
  },
  sundownSerenity: {
    name: "Sundown Serenity",
    primary: "#FFA27B",
    background: "#FEF3E2",
    foreground: "#484340",
    muted: "#F5E1CE",
    description: "Calm, relaxed, nature-inspired",
    gradient: "from-orange-300 via-pink-300 to-purple-300"
  },
  midnightSlate: {
    name: "Midnight Slate",
    primary: "#6B7CFF",
    background: "#1F2937",
    foreground: "#F3F4F6", 
    muted: "#2A3644",
    description: "Elegant, professional, sleek",
    gradient: "from-gray-700 via-gray-800 to-gray-900"
  },
  lushForest: {
    name: "Lush Forest",
    primary: "#3EB875",
    background: "#F1F9F5",
    foreground: "#1B3A29",
    muted: "#DCE8E0",
    description: "Earthy, calming, organic",
    gradient: "from-green-700 via-green-600 to-green-500"
  },
  technoAurora: {
    name: "Techno Aurora",
    primary: "#4D4DFF",
    background: "#080825",
    foreground: "#E2E8F0",
    muted: "#10104B",
    description: "Cosmic, otherworldly, high-tech",
    gradient: "from-blue-800 via-indigo-700 to-purple-800"
  },
  blue: {
    name: "Classic Blue",
    primary: "#3B82F6",
    background: "#F9FAFB",
    foreground: "#111827",
    muted: "#E5E7EB",
    description: "Clean, professional, classic",
    gradient: "from-blue-400 to-blue-600"
  },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Mapping from the themes object to our extended themes
  const currentTheme = theme as keyof typeof extendedThemes;
  
  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        duration: 0.4, 
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-white/10 text-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={cn(
          "h-4 w-4 rounded-full",
          `bg-gradient-to-r ${extendedThemes[currentTheme]?.gradient || extendedThemes.blue.gradient}`
        )} />
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span>Theme</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-72 p-3 bg-background rounded-xl border border-white/10 shadow-lg z-50"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h3 className="text-sm font-medium mb-2 px-2">Select a theme</h3>
            <div className="space-y-1">
              {Object.entries(extendedThemes).map(([key, value]) => (
                <motion.button
                  key={key}
                  variants={itemVariants}
                  onClick={() => {
                    setTheme(key as keyof typeof extendedThemes);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    theme === key 
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      "h-8 w-8 rounded-full shadow-inner",
                      `bg-gradient-to-r ${value.gradient}`
                    )} />
                    {theme === key && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{value.name}</div>
                    <div className="text-xs opacity-70">{value.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}