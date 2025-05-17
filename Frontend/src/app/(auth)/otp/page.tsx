"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { api } from "@/lib/axios"
import { motion } from "framer-motion"

export default function OTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextRoute = searchParams.get("next") || ""
  
  const [code, setCode] = useState(Array(6).fill(""))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState("")
  const [timeLeft, setTimeLeft] = useState(120)
  const [error, setError] = useState("")
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Determine which email to use based on the flow
  useEffect(() => {
    let storedEmail = ""
    
    if (nextRoute === "reset") {
      storedEmail = localStorage.getItem("taskup_reset_email") || ""
    } else {
      storedEmail = localStorage.getItem("taskup_register_email") || ""
    }
    
    if (!storedEmail) {
      toast.error("Email not found. Please restart the process.")
      router.push(nextRoute === "reset" ? "/forgot" : "/register")
    } else {
      setEmail(storedEmail)
    }
  }, [nextRoute])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return
    
    const newCode = [...code]
    newCode[idx] = value
    setCode(newCode)
    setError("")
    
    // Auto-advance to next input
    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus()
    }
    
    // Auto-submit when all digits are entered
    if (value && idx === 5 && newCode.every(digit => digit !== "")) {
      setTimeout(() => handleSubmit(), 300)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      const newCode = [...code]
      newCode[idx - 1] = ""
      setCode(newCode)
      inputsRef.current[idx - 1]?.focus()
    }
  }

  const handleSubmit = async () => {
    const fullCode = code.join("")
    if (fullCode.length < 6) return setError("Please enter all 6 digits.")
    if (timeLeft === 0) return setError("Code expired. Please resend.")

    setLoading(true)
    try {
      const res = await api.post("/email/check-verification-code", {
        Email: email,
        VerificationCode: fullCode,
      })
      
      const data = res.data
      if (data.Success) {
        toast.success("Code verified successfully! ✅")
        router.push(nextRoute === "reset" ? "/reset" : "/finishRegister")
      } else {
        setError(data.Message || "Verification failed")
        toast.error(data.Message || "Verification failed")
      }
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.detail || 
        "Invalid or expired code."
      
      setError(typeof errorMessage === 'string' ? errorMessage : "Verification failed")
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found. Please restart the process.")
      return
    }

    setResending(true)
    try {
      setCode(Array(6).fill(""))
      setError("")
      setTimeLeft(120)

      await api.post("/email/send-verification-code", null, {
        params: { recipientEmail: email }
      })
      
      toast.success("Code resent! Check your email.")
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.detail || 
        "Failed to resend code. Try again."
        
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Failed to resend code")
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {nextRoute === "reset" ? "Reset Password" : "Verify your email"}
          </h2>
          <p className="text-sm text-zinc-400">
            We've sent a 6-digit code to{" "}
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="flex justify-between gap-2">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-16 sm:w-14 sm:h-18 text-2xl sm:text-3xl text-center rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center font-medium -mt-2">{error}</p>
        )}

        <div className="text-center text-sm text-zinc-400">
          {timeLeft > 0 ? (
            <div className="flex flex-col gap-1 items-center">
              <div>
                Code expires in{" "}
                <span className="text-white font-semibold">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-400 hover:underline font-medium transition disabled:opacity-50"
              >
                {resending ? "Resending..." : "Didn't receive the code? Resend"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-indigo-400 hover:underline font-medium transition disabled:opacity-50"
            >
              {resending ? "Resending..." : "Code expired. Click to resend."}
            </button>
          )}
        </div>

        <Button className="w-full mt-2 text-lg py-3" isLoading={loading} onClick={handleSubmit}>
          {nextRoute === "reset" ? "Continue to Reset Password" : "Verify & Continue"}
        </Button>
      </motion.div>
    </main>
  )
}