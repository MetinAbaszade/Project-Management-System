// app/(auth)/layout.tsx

"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"
import { AuthProvider } from "@/contexts/AuthContext"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const direction = pathname.includes("register") ? 1 : -1

  return (
    <AuthProvider>
      <main className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#1c1b3a] via-[#202144] to-[#171738] text-white relative">
        {/* Background blobs */}
        <div className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-indigo-500 opacity-20 rounded-full blur-[200px] z-0" />
        <div className="absolute bottom-[-20vh] right-[-10vw] w-[60vw] h-[60vw] bg-purple-500 opacity-10 rounded-full blur-[180px] z-0" />

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 60 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative z-10 w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </AuthProvider>
  )
}
