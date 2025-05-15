'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const messages = [
  'Precision in every detail.',
  'Design meets performance.',
  'Your flow, uninterrupted.',
  'Productivity, redefined.',
  'Welcome to your command center.',
]

export default function Onboarding() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [show, setShow] = useState(true)

  // Redirect if onboarded
  useEffect(() => {
    const onboarded = localStorage.getItem('taskup_onboarded')
    const userId = localStorage.getItem('userId')
    if (onboarded === 'true') {
      router.push(userId ? '/dashboard' : '/login')
    }
  }, [router])

  // ✨ Bulletproof message loop using timeout
  useEffect(() => {
    if (!show) return

    timeoutRef.current = setTimeout(() => {
      setShow(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length)
        setShow(true)
      }, 500) // this matches the exit animation time
    }, 4000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [index, show])

  const go = (path: string) => {
    try {
      localStorage.setItem('taskup_onboarded', 'true')
    } catch (error) {
      console.error('Failed to set onboarded status:', error)
    }
    router.push(path)
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans"
    >
      {/* Background */}
      <motion.div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-indigo-500 opacity-20 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-20vh] right-[-10vw] w-[60vw] h-[60vw] bg-purple-500 opacity-10 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold tracking-wide text-indigo-400 mb-1"
        >
          TaskUp
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-md text-zinc-300 mb-8"
        >
          Focused work. Beautifully managed.
        </motion.p>

        {/* 🔁 Message loop */}
        <div className="mb-8 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight min-h-[3.5rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {show && (
              <motion.span
                key={messages[index]}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
                className="block bg-gradient-to-r from-indigo-300 to-white bg-clip-text text-transparent"
              >
                {messages[index]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Project Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-10 w-[90%] max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl transition-all cursor-pointer"
        >
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-sm text-indigo-300 font-semibold mb-1">Project • UX Launch</p>
              <p className="text-lg font-medium text-white">Redefine Authentication</p>
              <p className="text-xs text-zinc-400 mt-1">Due: May 22 • Priority: Critical</p>
            </div>
            <div className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-semibold shrink-0">
              In Progress
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => go('/register')}
            className="bg-white text-black font-semibold px-6 py-3 rounded-full shadow-lg hover:ring-2 hover:ring-white/30 transition-all"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => go('/login')}
            className="border border-white/30 text-white px-6 py-3 rounded-full hover:bg-white/10 transition-all"
          >
            Log In
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-sm text-white/40 px-6 py-6 flex flex-col sm:flex-row justify-between items-center border-t border-white/10 backdrop-blur-sm gap-2 sm:gap-0">
        <p>&copy; {new Date().getFullYear()} TaskUp. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition hover:underline underline-offset-2">Changelog</a>
          <a href="#" className="hover:text-white transition hover:underline underline-offset-2">Contact</a>
          <a href="#" className="hover:text-white transition hover:underline underline-offset-2">Docs</a>
        </div>
      </footer>
    </main>
  )
}
