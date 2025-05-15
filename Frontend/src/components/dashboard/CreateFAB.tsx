
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckSquare, FolderKanban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fabVariants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.3,
    },
  },
};

const menuVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 10,
    transition: { duration: 0.2 },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
};

export function CreateFAB() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuItems: MenuItem[] = [
    {
      label: 'New Task',
      icon: <CheckSquare className="h-4 w-4 mr-2" />,
      onClick: () => {
        router.push('/tasks/create');
        closeMenu();
      },
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    },
    {
      label: 'New Project',
      icon: <FolderKanban className="h-4 w-4 mr-2" />,
      onClick: () => {
        router.push('/projects/create');
        closeMenu();
      },
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    },
  ];

  return (
    <>
      <div className="fixed right-6 bottom-6 z-50">
        <motion.div variants={fabVariants} initial="hidden" animate="visible">
          <Button
            onClick={toggleMenu}
            className={cn(
              'h-14 w-14 rounded-full shadow-lg text-white',
              isOpen
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500/90'
            )}
            size="lg"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute bottom-16 right-0 mb-2 w-48 space-y-2 flex flex-col items-end z-50"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={menuItemVariants}
                  className="flex justify-end w-full"
                >
                  <Button onClick={item.onClick} className={cn('text-white shadow-md', item.color)}>
                    {item.icon}
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}