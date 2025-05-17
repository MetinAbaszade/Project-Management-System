"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "@/lib/toast"
import { api } from "@/lib/axios"  // ✅ FIXED - Using proper API import
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/FormInput"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" })  // ✅ ADDED - Confirm password field
  const [errors, setErrors] = useState<{ newPassword?: string, confirmPassword?: string }>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("taskup_reset_email")
    if (!stored) {
      toast.error("Email not found. Please restart the password reset process.")
      router.push("/forgot")
    } else {
      setEmail(stored)
    }
  }, [])

  const validate = () => {
    const errs: typeof errors = {}
    if (!form.newPassword) errs.newPassword = "New password is required."
    else if (form.newPassword.length < 6)
      errs.newPassword = "Password must be at least 6 characters."
    
    // ✅ ADDED - Confirm password validation
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Passwords don't match."
    
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    
    setLoading(true)
    try {
      // ✅ FIXED - Using correct API endpoint with proper payload
      await api.post("/users/reset-password", {
        Email: email,
        NewPassword: form.newPassword
      })
      
      toast.success("Password reset successfully")
      localStorage.removeItem("taskup_reset_email")
      
      // Give user time to see success message before redirecting
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err: any) {
      console.error("Password reset error:", err)
      
      // ✅ FIXED - Improved error handling
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.detail || 
        "Password reset failed. Please try again."
      
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Password reset failed.")
    } finally {
      setLoading(false)
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl space-y-6 relative z-10"
      >
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-white">Reset your password</h1>
          <p className="text-sm text-zinc-400">
            Enter your new password for{" "}
            <span className="text-white font-medium">{email}</span>.
          </p>
        </div>

        <FormInput
          label="New Password"
          error={errors.newPassword}
          rightSlot={
            <div
              onClick={togglePasswordVisibility}
              className="cursor-pointer hover:text-white transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </div>
          }
          inputProps={{
            name: "newPassword",
            type: showPassword ? "text" : "password",
            placeholder: "••••••••",
            value: form.newPassword,
            onChange: (e) => handleChange("newPassword", e.target.value),
          }}
        />

        {/* ✅ ADDED - Confirm password field */}
        <FormInput
          label="Confirm Password"
          error={errors.confirmPassword}
          inputProps={{
            name: "confirmPassword",
            type: showPassword ? "text" : "password",
            placeholder: "••••••••",
            value: form.confirmPassword,
            onChange: (e) => handleChange("confirmPassword", e.target.value),
          }}
        />

        <Button
          className="w-full py-4 text-base font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-lg hover:shadow-xl"
          isLoading={loading}
          onClick={handleSubmit}
        >
          Reset Password
        </Button>

        <p className="text-sm text-center text-zinc-400 mt-4">
          Remembered it?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-300 hover:underline font-medium transition"
          >
            Back to login
          </button>
        </p>
      </motion.div>
    </div>
  )
}