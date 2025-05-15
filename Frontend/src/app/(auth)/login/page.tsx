"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/api/UserAPI";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use loginUser from API to store user + token
      await loginUser({
        Email: form.email,
        Password: form.password,
      });

      toast.success("Welcome back 👋");
      await new Promise((res) => setTimeout(res, 300));
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid lg:grid-cols-2 min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white overflow-hidden">
      {/* Ambient blobs */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
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

      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute top-6 left-6 z-20 text-white text-xl font-bold tracking-tight drop-shadow-md"
      >
        TaskUp
      </motion.div>

      {/* Left Hero */}
      <motion.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex items-center justify-center px-12 py-24"
      >
        <div className="max-w-xl pl-2">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Welcome back.
          </h1>
          <p className="text-white/70 text-lg mt-3 max-w-md">
            Pick up the flow.<br />
            Everything's synced.
          </p>
        </div>
      </motion.section>

      {/* Right Form */}
      <motion.section
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex items-center justify-center px-8 py-24 bg-white/5 backdrop-blur-xl border-l border-white/10"
      >
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-white">Log In</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="login-email"
              label="Email"
              inputProps={{
                id: "login-email",
                name: "email",
                type: "email",
                autoComplete: "email",
                placeholder: "you@example.com",
                value: form.email,
                onChange: handleChange,
              }}
            />
            <FormInput
              id="login-password"
              label="Password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="hover:text-white transition"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              inputProps={{
                id: "login-password",
                name: "password",
                type: show ? "text" : "password",
                autoComplete: "current-password",
                placeholder: "••••••••",
                value: form.password,
                onChange: handleChange,
              }}
            />

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => router.push("/forgot")}
                className="text-indigo-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Log In
            </Button>
          </form>

          <p className="text-sm text-center text-white/50 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-indigo-400 hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </motion.section>
    </div>
  );
}
