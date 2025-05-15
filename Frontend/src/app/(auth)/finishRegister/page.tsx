"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FormInput } from "@/components/ui/FormInput"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import axios from "axios"
import { Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"

export default function FinishRegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Password: "",
    RepeatPassword: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifyAgain, setVerifyAgain] = useState(false)

  useEffect(() => {
    const e = localStorage.getItem("taskup_register_email")
    if (!e) router.push("/register")
    else setEmail(e)
  }, [])

  const validate = () => {
    const e: typeof errors = {}
    if (!form.FirstName) e.FirstName = "First name is required"
    if (!form.LastName) e.LastName = "Last name is required"
    if (!form.Password || form.Password.length < 6) e.Password = "Minimum 6 characters"
    if (form.Password !== form.RepeatPassword) e.RepeatPassword = "Passwords don't match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const requestData = {
        FirstName: form.FirstName,
        LastName: form.LastName,
        Email: email,
        Password: form.Password
      }
      
      const response = await axios.post("http://127.0.0.1:8000/auth/register", requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      toast.success("Account created successfully!")
      localStorage.removeItem("taskup_register_email")
      router.push("/login")
    } catch (err: any) {
      console.error("Registration error:", err)
      
      // Check if the error is about email verification
      const errorMessage = err.response?.data || "Registration failed. Please try again."
      
      if (typeof errorMessage === 'string' && errorMessage.includes("not verified")) {
        toast.error("Your email verification has expired. Please verify your email again.")
        setVerifyAgain(true)
      } else {
        toast.error(typeof errorMessage === 'string' ? errorMessage : "Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReverify = async () => {
    setLoading(true)
    try {
      // Send verification code again
      await axios.post(`http://127.0.0.1:8000/email/send-verification-code?recipientEmail=${encodeURIComponent(email)}`)
      toast.success("Verification code sent again. Please check your email.")
      router.push("/verify")
    } catch (err) {
      toast.error("Failed to send verification code. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold mb-2">Finish creating your account</h2>
          <p className="text-sm text-zinc-400">
            Almost done. Enter your name and create a secure password.
          </p>
        </div>

        {verifyAgain ? (
          <div className="space-y-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <p className="text-sm">
                Your email verification has expired. You'll need to verify your email again before registering.
              </p>
            </div>
            <Button className="w-full" onClick={handleReverify} isLoading={loading}>
              Send New Verification Code
            </Button>
          </div>
        ) : (
          <>
            <FormInput
              id="first-name"
              label="First Name"
              error={errors.FirstName}
              inputProps={{
                id: "first-name",
                name: "FirstName",
                placeholder: "Jane",
                value: form.FirstName,
                onChange: handleChange,
              }}
            />
            <FormInput
              id="last-name"
              label="Last Name"
              error={errors.LastName}
              inputProps={{
                id: "last-name",
                name: "LastName",
                placeholder: "Doe",
                value: form.LastName,
                onChange: handleChange,
              }}
            />
            <FormInput
              id="password"
              label="Password"
              error={errors.Password}
              rightSlot={
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              }
              inputProps={{
                id: "password",
                name: "Password",
                type: showPassword ? "text" : "password",
                placeholder: "••••••••",
                value: form.Password,
                onChange: handleChange,
              }}
            />
            <FormInput
              id="repeat-password"
              label="Repeat Password"
              error={errors.RepeatPassword}
              inputProps={{
                id: "repeat-password",
                name: "RepeatPassword",
                type: showPassword ? "text" : "password",
                placeholder: "••••••••",
                value: form.RepeatPassword,
                onChange: handleChange,
              }}
            />

            <Button className="w-full mt-2 text-lg py-3" isLoading={loading} onClick={handleSubmit}>
              Finish Registration
            </Button>
            
            <p className="text-center text-xs text-zinc-400">
              Need to verify your email again?{" "}
              <button 
                type="button"
                onClick={handleReverify}
                className="text-indigo-400 hover:underline"
              >
                Resend verification
              </button>
            </p>
          </>
        )}
      </motion.div>
    </main>
  )
}