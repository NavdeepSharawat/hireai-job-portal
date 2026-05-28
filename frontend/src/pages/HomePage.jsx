import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, ArrowRight, Zap, Shield, Users, TrendingUp, Briefcase, Code, Palette, BarChart3, Heart, BookOpen } from "lucide-react";
import { jobsAPI } from "../utils/api";

const STATS = [
  { label: "Active Jobs", value: "10,000+", icon: Briefcase },
  { label: "Companies", value: "2,500+", icon: Users },
  { label: "Hires Made", value: "50,000+", icon: TrendingUp },
  { label: "Success Rate", value: "94%", icon: Zap },
];

const FEATURES = [
  { icon: Sparkles, title: "AI-Powered Matching", desc: "Smart algorithms match your skills to the perfect job opportunities in real time." },
  { icon: Shield, title: "Verified Companies", desc: "Every recruiter and company is verified before posting — no spam, no scams." },
  { icon: Zap, title: "One-Click Apply", desc: "Apply to multiple jobs instantly with your saved profile and smart cover letters." },
];

const CATEGORIES = [
  { icon: Code, label: "Technology", count: "3,240 jobs", color: "from-blue-500 to-cyan-500" },
  { icon: Palette, label: "Design", count: "890 jobs", color: "from-pink-500 to-rose-500" },
  { icon: BarChart3, label: "Finance", count: "1,120 jobs", color: "from-emerald-500 to-teal-500" },
  { icon: Users, label: "HR & Operations", count: "540 jobs", color: "from-orange-500 to-amber-500" },
  { icon: Heart, label: "Healthcare", count: "780 jobs", color: "from-red-500 to-pink-500" },
  { icon: BookOpen, label: "Education", count: "430 jobs", color: "from-purple-500 to-violet-500" },
];

const TRENDING_SKILLS = ["React", "Python", "Node.js", "AWS", "Machine Learning", "TypeScript", "Docker", "Figma", "SQL", "Go"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [recentJobs, setRecentJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    jobsAPI.getJobs({ limit: 4, sort: "-createdAt" })
      .then((res) => setRecentJobs(res.data.jobs || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* ───────── HERO ───────── */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-medium mb-6"
          >
            <Sparkles size={14} className="animate-spin-slow" />
            AI-Powered Job Matching Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Find Your
            <span className="block gradient-text">Dream Job</span>
            with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
          >
            Intelligent job matching that understands your skills, experience, and career goals.
            Connect with top companies in seconds.
          </motion.p>

          {/* Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSearch}
            className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto shadow-glow-lg"
          >
            <div className="flex items-center gap-2 flex-1 bg-surface-800/50 rounded-xl px-4 py-3">
              <Search size={18} className="text-zinc-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Job title, skills, or company..."
                className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 sm:w-44 bg-surface-800/50 rounded-xl px-4 py-3">
              <MapPin size={18} className="text-zinc-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap flex items-center gap-2 justify-center">
              <Search size={16} />
              Search Jobs
            </button>
          </motion.form>

          {/* Trending Skills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-wrap gap-2 justify-center"
          >
            <span className="text-xs text-zinc-500 mt-1">Trending:</span>
            {TRENDING_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => navigate(`/jobs?search=${skill}`)}
                className="text-xs px-3 py-1.5 rounded-full bg-surface-800 border border-white/10 text-zinc-400 hover:text-white hover:border-primary-500/50 transition-all"
              >
                {skill}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── STATS ───────── */}
      <section className="py-12 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {STATS.map(({ label, value, icon: Icon }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <Icon size={20} className="text-primary-400" />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-zinc-500 mt-0.5">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── CATEGORIES ───────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Browse by Category</h2>
            <p className="text-zinc-400">Explore thousands of job opportunities across industries</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {CATEGORIES.map(({ icon: Icon, label, count, color }) => (
              <motion.div key={label} variants={fadeUp}>
                <Link
                  to={`/jobs?category=${label}`}
                  className="card card-hover flex items-center gap-4 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white group-hover:text-primary-400 transition-colors">{label}</div>
                    <div className="text-sm text-zinc-500">{count}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section className="py-20 px-4 bg-surface-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Why Choose HireAI?</h2>
            <p className="text-zinc-400">Built for the modern job market</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="card card-hover text-center group">
                <div className="w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── RECENT JOBS ───────── */}
      {recentJobs.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white">Latest Jobs</h2>
                <p className="text-zinc-400 mt-1">Fresh opportunities posted today</p>
              </div>
              <Link to="/jobs" className="btn-outline text-sm py-2.5 flex items-center gap-2">
                View All <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentJobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/jobs/${job._id}`} className="card card-hover block">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 border border-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400 shrink-0">
                        {job.companyName?.[0] || "C"}
                      </div>
                      <span className="badge-primary ml-auto">{job.jobType}</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{job.title}</h3>
                    <p className="text-sm text-zinc-400">{job.companyName} · {job.location}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills?.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs px-2 py-1 rounded-lg bg-surface-800 text-zinc-400 border border-white/5">{s}</span>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── CTA ───────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative card text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-purple-600/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Find Your <span className="gradient-text">Next Opportunity?</span>
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join 50,000+ professionals already using HireAI to land their dream job.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/register" className="btn-primary flex items-center gap-2">
                  <Sparkles size={16} />
                  Start for Free
                </Link>
                <Link to="/jobs" className="btn-secondary flex items-center gap-2">
                  Browse Jobs <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
