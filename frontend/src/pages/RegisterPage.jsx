import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Loader2, Briefcase, Search, Building2, CheckCircle } from "lucide-react";
import useAuthStore from "../context/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "jobseeker" });
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 1 = role select, 2 = form
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const res = await register(form);
    if (res.success) {
      toast.success("Account created! Welcome to HireAI 🎉");
      navigate("/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  const selectRole = (role) => {
    setForm((f) => ({ ...f, role }));
    setStep(2);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center px-4">
      <div className="fixed top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl gradient-text">HireAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === 1 ? "Join HireAI" : `Sign up as ${form.role === "recruiter" ? "Recruiter" : "Job Seeker"}`}
          </h1>
          <p className="text-zinc-400 text-sm">
            {step === 1 ? "Choose your account type to get started" : "Fill in your details below"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Role Selection */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <button
                onClick={() => selectRole("jobseeker")}
                className="w-full card card-hover text-left flex items-center gap-5 group hover:border-primary-500/50"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-glow shrink-0">
                  <Search size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-primary-400 transition-colors mb-1">I'm a Job Seeker</div>
                  <div className="text-sm text-zinc-400">Browse jobs, apply with one click, track your applications</div>
                </div>
              </button>

              <button
                onClick={() => selectRole("recruiter")}
                className="w-full card card-hover text-left flex items-center gap-5 group hover:border-accent-500/50"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-orange-600 flex items-center justify-center shrink-0">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-accent-400 transition-colors mb-1">I'm a Recruiter</div>
                  <div className="text-sm text-zinc-400">Post jobs, manage applications, find top talent fast</div>
                </div>
              </button>

              <p className="text-center text-sm text-zinc-500 pt-2">
                Already have an account?{" "}
                <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link>
              </p>
            </motion.div>
          )}

          {/* Step 2 — Registration Form */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Role Badge */}
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setStep(1)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Change role</button>
                <span className={`badge text-xs ml-auto ${form.role === "recruiter" ? "bg-accent-500/20 text-accent-400 border-accent-500/30" : "badge-primary"}`}>
                  {form.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                </span>
              </div>

              <div className="card border-white/10">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name"
                        className="input pl-10"
                        autoComplete="name"
                      />
                    </div>
                  </div>

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
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder="Min. 6 characters"
                        className="input pl-10 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {form.password && (
                      <div className="flex gap-1 mt-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            form.password.length > i * 2 + 2
                              ? form.password.length >= 10 ? "bg-emerald-500" : form.password.length >= 6 ? "bg-yellow-500" : "bg-red-500"
                              : "bg-surface-700"
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-zinc-500">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-primary-400 hover:underline">Terms of Service</a> and{" "}
                    <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 size={16} className="animate-spin" /> Creating Account...</>
                      : <><CheckCircle size={16} /> Create Account</>
                    }
                  </button>
                </form>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-zinc-600">Have an account?</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <Link to="/login" className="btn-secondary w-full text-center block text-sm">Sign In Instead</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
