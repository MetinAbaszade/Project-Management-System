"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import api from "@/lib/axios" // ✅ fixed import

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email address")
      return
    }

    setLoading(true)
    try {
      await api.post(`/email/send-verification-code?recipientEmail=${encodeURIComponent(email)}`)

      localStorage.setItem("taskup_register_email", email)
      toast.success("Verification code sent to your email")
      router.push("/verify")
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again."
      toast.error(typeof msg === "string" ? msg : "Failed to send verification code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid lg:grid-cols-2 min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden">
      {/* Ambient blobs */}
      <motion.div className="absolute inset-0 z-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div
          className="absolute top-[-25%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-500 opacity-20 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-30%] right-[-15%] w-[60vw] h-[60vw] bg-purple-600 opacity-10 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* App logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute top-6 left-6 z-20 text-white text-xl font-bold tracking-tight drop-shadow-md"
      >
        TaskUp
      </motion.div>

      {/* Hero left */}
      <motion.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex items-center justify-center px-12 py-24"
      >
        <div className="max-w-xl space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Elevate your <span className="text-indigo-400">workflow</span>.<br />
            Design meets clarity.
          </h1>
          <p className="text-white/70 text-lg">
            No clutter. No chaos.<br />
            Just focused flow.
          </p>
        </div>
      </motion.section>

      {/* Register Form */}
      <motion.section
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex items-center justify-center px-8 py-24 bg-white/5 backdrop-blur-xl border-l border-white/10"
      >
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-white">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/70">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-lg font-semibold bg-indigo-500 hover:bg-indigo-600 transition-all shadow-md disabled:opacity-70"
            >
              {loading ? "Sending..." : "Continue"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </motion.section>
    </div>
  )
}
