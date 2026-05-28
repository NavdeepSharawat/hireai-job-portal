import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Briefcase, Building2, Users, DollarSign, Calendar, ArrowLeft, Bookmark, BookmarkCheck, Share2, CheckCircle, X, Loader2, ExternalLink } from "lucide-react";
import { jobsAPI, applicationsAPI } from "../utils/api";
import useAuthStore from "../context/authStore";
import toast from "react-hot-toast";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [form, setForm] = useState({ coverLetter: "", expectedSalary: "", availableFrom: "" });
  const { user, toggleSaveJob, isJobSaved } = useAuthStore();

  useEffect(() => {
    jobsAPI.getJob(id)
      .then((res) => { setJob(res.data.job); setLoading(false); })
      .catch(() => { toast.error("Job not found"); navigate("/jobs"); });
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please log in to apply"); navigate("/login"); return; }
    setApplying(true);
    try {
      await applicationsAPI.apply(id, form);
      setApplied(true);
      toast.success("Application submitted successfully! 🎉");
      setApplyModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user) { toast.error("Please log in to save jobs"); return; }
    const res = await toggleSaveJob(id);
    if (res.success) toast.success(res.message);
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading job details...</p>
      </div>
    </div>
  );

  if (!job) return null;

  const postedDays = Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
  const isSaved = isJobSaved(id);
  const isDeadlinePassed = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);
  const canApply = user?.role === "jobseeker" && !applied && !isDeadlinePassed;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/20 flex items-center justify-center text-2xl font-bold text-primary-400 shrink-0">
                  {job.companyName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Building2 size={15} />
                    <span className="font-medium">{job.companyName}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleSave} className="p-2.5 rounded-xl bg-surface-800 border border-white/10 hover:border-primary-500/50 transition-all text-zinc-400 hover:text-primary-400">
                    {isSaved ? <BookmarkCheck size={18} className="text-primary-400" /> : <Bookmark size={18} />}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                    className="p-2.5 rounded-xl bg-surface-800 border border-white/10 hover:border-primary-500/50 transition-all text-zinc-400 hover:text-white">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="badge-primary">{job.jobType}</span>
                <span className="badge-green">{job.locationType}</span>
                <span className="badge bg-surface-800 text-zinc-400 border border-white/10">{job.experience}</span>
                <span className="badge bg-surface-800 text-zinc-400 border border-white/10">{job.category}</span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: MapPin, label: "Location", value: job.location },
                  { icon: Clock, label: "Posted", value: postedDays === 0 ? "Today" : `${postedDays} days ago` },
                  { icon: Users, label: "Applicants", value: `${job.applicationsCount || 0} applied` },
                  ...(job.applicationDeadline ? [{ icon: Calendar, label: "Deadline", value: new Date(job.applicationDeadline).toLocaleDateString() }] : []),
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-surface-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1"><Icon size={12} /> {label}</div>
                    <div className="text-sm font-medium text-white">{value}</div>
                  </div>
                ))}
              </div>

              {/* Salary */}
              {job.salary?.isVisible && (job.salary.min || job.salary.max) && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">
                      ₹{job.salary.min ? `${(job.salary.min / 100000).toFixed(1)}L` : ""}
                      {job.salary.min && job.salary.max ? " - " : ""}
                      {job.salary.max ? `${(job.salary.max / 100000).toFixed(1)}L` : ""} per year
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <h2 className="text-lg font-bold text-white mb-4">Job Description</h2>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
            </motion.div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
                <h2 className="text-lg font-bold text-white mb-4">Requirements</h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <CheckCircle size={15} className="text-primary-400 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
                <h2 className="text-lg font-bold text-white mb-4">Responsibilities</h2>
                <ul className="space-y-2.5">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
              <h2 className="text-lg font-bold text-white mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">{s}</span>
                ))}
              </div>
            </motion.div>

            {/* Perks */}
            {job.perks?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
                <h2 className="text-lg font-bold text-white mb-4">Perks & Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((p) => (
                    <span key={p} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">✓ {p}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card sticky top-24">
              {applied ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-white mb-1">Application Sent!</h3>
                  <p className="text-sm text-zinc-400 mb-4">Track your application in the dashboard</p>
                  <Link to="/applications" className="btn-primary w-full text-center text-sm py-2.5 block">
                    View Applications
                  </Link>
                </div>
              ) : isDeadlinePassed ? (
                <div className="text-center py-4">
                  <p className="text-red-400 font-medium mb-2">Application deadline passed</p>
                  <p className="text-xs text-zinc-500">This job is no longer accepting applications</p>
                </div>
              ) : job.status === "closed" ? (
                <div className="text-center py-4">
                  <p className="text-zinc-400 font-medium">This position is closed</p>
                </div>
              ) : (
                <>
                  {!user ? (
                    <>
                      <Link to="/login" className="btn-primary w-full text-center block mb-3">Log In to Apply</Link>
                      <Link to="/register" className="btn-secondary w-full text-center block text-sm">Create Account</Link>
                    </>
                  ) : user.role === "recruiter" ? (
                    <p className="text-center text-zinc-400 text-sm">Switch to a job seeker account to apply</p>
                  ) : (
                    <button onClick={() => setApplyModal(true)} className="btn-primary w-full">
                      Apply Now
                    </button>
                  )}
                </>
              )}

              {/* Company Info */}
              <div className="border-t border-white/5 mt-5 pt-5">
                <h4 className="text-sm font-semibold text-white mb-3">About the Company</h4>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex gap-2"><Building2 size={14} className="shrink-0 mt-0.5" /> {job.companyName}</div>
                  {job.recruiter?.company?.industry && <div>{job.recruiter.company.industry}</div>}
                  {job.recruiter?.company?.size && <div>Team size: {job.recruiter.company.size}</div>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">Apply to {job.title}</h2>
                  <p className="text-sm text-zinc-400">{job.companyName}</p>
                </div>
                <button onClick={() => setApplyModal(false)} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Cover Letter <span className="text-zinc-500 font-normal">(optional)</span></label>
                  <textarea
                    value={form.coverLetter}
                    onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
                    placeholder="Tell them why you're the perfect fit..."
                    rows={5}
                    className="input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Expected Salary (₹)</label>
                    <input
                      type="number"
                      value={form.expectedSalary}
                      onChange={(e) => setForm((f) => ({ ...f, expectedSalary: e.target.value }))}
                      placeholder="e.g. 800000"
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Available From</label>
                    <input
                      type="date"
                      value={form.availableFrom}
                      onChange={(e) => setForm((f) => ({ ...f, availableFrom: e.target.value }))}
                      className="input text-sm"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {user?.profile?.resume && (
                  <div className="p-3 rounded-xl bg-surface-800 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-1">Resume on file</p>
                    <a href={user.profile.resume} target="_blank" rel="noreferrer" className="text-sm text-primary-400 hover:underline flex items-center gap-1">
                      View Resume <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                <button type="submit" disabled={applying} className="btn-primary w-full flex items-center justify-center gap-2">
                  {applying ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Application"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
