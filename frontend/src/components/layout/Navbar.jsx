import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Bell, Menu, X, User, LogOut, LayoutDashboard, PlusCircle, Bookmark, FileText, ChevronDown } from "lucide-react";
import useAuthStore from "../../context/authStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navLinks = [
    { label: "Find Jobs", href: "/jobs" },
    ...(user?.role === "recruiter" ? [{ label: "Post a Job", href: "/post-job" }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-surface-950/90 backdrop-blur-lg border-b border-white/5 shadow-xl" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">HireAI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.href
                    ? "text-primary-400 bg-primary-500/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Dashboard
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-surface-800 border border-white/10 hover:border-primary-500/40 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white max-w-24 truncate">{user.name}</span>
                    <ChevronDown size={14} className={`text-zinc-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                          <span className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                            user.role === "recruiter" ? "bg-accent-400/20 text-accent-400" : "bg-primary-500/20 text-primary-400"
                          }`}>
                            {user.role === "recruiter" ? "Recruiter" : "Job Seeker"}
                          </span>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <User size={15} /> Profile
                          </Link>
                          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <LayoutDashboard size={15} /> Dashboard
                          </Link>
                          {user.role === "jobseeker" && (
                            <>
                              <Link to="/applications" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                <FileText size={15} /> My Applications
                              </Link>
                              <Link to="/saved-jobs" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                <Bookmark size={15} /> Saved Jobs
                              </Link>
                            </>
                          )}
                          {user.role === "recruiter" && (
                            <Link to="/post-job" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                              <PlusCircle size={15} /> Post New Job
                            </Link>
                          )}
                        </div>
                        <div className="p-1.5 border-t border-white/5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2.5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-950/95 backdrop-blur-lg border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} className="block px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 font-medium transition-all">
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <div className="px-4 py-2 mb-1">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all">Dashboard</Link>
                    <Link to="/profile" className="block px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all">Profile</Link>
                    {user.role === "jobseeker" && (
                      <>
                        <Link to="/applications" className="block px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all">My Applications</Link>
                        <Link to="/saved-jobs" className="block px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all">Saved Jobs</Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">Sign Out</button>
                  </div>
                </>
              ) : (
                <div className="border-t border-white/5 pt-2 mt-2 flex gap-2">
                  <Link to="/login" className="flex-1 btn-secondary text-center text-sm py-2.5">Sign In</Link>
                  <Link to="/register" className="flex-1 btn-primary text-center text-sm py-2.5">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
