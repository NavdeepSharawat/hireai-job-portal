import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, Briefcase, Sparkles } from "lucide-react";
import useAuthStore from "../context/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) {
      toast.success("Welcome back! 👋");
      navigate(from, { replace: true });
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl gradient-text">HireAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-zinc-400 text-sm">Sign in to continue your journey</p>
        </div>

        {/* Form Card */}
        <div className="card border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <><Sparkles size={16} /> Sign In</>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-zinc-600">New to HireAI?</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <Link to="/register" className="btn-secondary w-full text-center block text-sm">
            Create an Account
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20 text-center">
          <p className="text-xs text-zinc-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-400 hover:underline">Register free</Link>
            {" "}— no credit card required
          </p>
        </div>
      </motion.div>
    </div>
  );
}
