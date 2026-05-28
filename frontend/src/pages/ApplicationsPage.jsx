import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, Eye, TrendingUp, AlertCircle, Search, Filter, ChevronDown, Loader2, Calendar, MapPin, ExternalLink } from "lucide-react";
import { applicationsAPI } from "../utils/api";
import useAuthStore from "../context/authStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  applied:     { color: "badge-primary",  icon: FileText,    label: "Applied",     bg: "bg-primary-500/10 border-primary-500/20" },
  reviewing:   { color: "badge-yellow",   icon: Eye,         label: "Reviewing",   bg: "bg-yellow-500/10 border-yellow-500/20" },
  shortlisted: { color: "badge-green",    icon: CheckCircle, label: "Shortlisted", bg: "bg-emerald-500/10 border-emerald-500/20" },
  interview:   { color: "badge-orange",   icon: Clock,       label: "Interview",   bg: "bg-orange-500/10 border-orange-500/20" },
  offered:     { color: "badge-green",    icon: TrendingUp,  label: "Offered",     bg: "bg-emerald-500/10 border-emerald-500/20" },
  rejected:    { color: "badge-red",      icon: XCircle,     label: "Rejected",    bg: "bg-red-500/10 border-red-500/20" },
  withdrawn:   { color: "bg-zinc-700/40 text-zinc-400 border-zinc-600/40", icon: AlertCircle, label: "Withdrawn", bg: "bg-zinc-800/40 border-zinc-700/20" },
};

const RECRUITER_STATUSES = ["reviewing", "shortlisted", "interview", "offered", "rejected"];

/* ── SEEKER VIEW ── */
function SeekerApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    applicationsAPI.getMyApplications()
      .then((res) => setApps(res.data.applications || []))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm("Withdraw this application?")) return;
    setWithdrawing(id);
    try {
      await applicationsAPI.withdraw(id);
      setApps((a) => a.map((app) => app._id === id ? { ...app, status: "withdrawn" } : app));
      toast.success("Application withdrawn");
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setWithdrawing(null); }
  };

  const filtered = filter ? apps.filter((a) => a.status === filter) : apps;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["", "applied", "reviewing", "shortlisted", "interview", "offered", "rejected"].map((s) => {
          const count = s ? apps.filter(a => a.status === s).length : apps.length;
          return (
            <button key={s || "all"} onClick={() => setFilter(s)}
              className={`text-sm px-4 py-2 rounded-xl border font-medium transition-all ${filter === s ? "bg-primary-500/10 border-primary-500/50 text-primary-400" : "bg-surface-900 border-white/5 text-zinc-400 hover:text-white"}`}>
              {s ? STATUS_CONFIG[s]?.label : "All"} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card"><div className="skeleton h-20 rounded-lg" /></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No applications {filter ? `with status "${STATUS_CONFIG[filter]?.label}"` : "yet"}</p>
          {!filter && <Link to="/jobs" className="btn-primary text-sm py-2.5 mt-4 inline-block">Browse Jobs</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              const Icon = cfg.icon;
              const days = Math.floor((Date.now() - new Date(app.createdAt)) / (1000 * 60 * 60 * 24));
              return (
                <motion.div key={app._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`card border ${cfg.bg}`}>
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/10 flex items-center justify-center text-lg font-bold text-primary-400 shrink-0">
                      {app.job?.companyName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <Link to={`/jobs/${app.job?._id}`} className="font-semibold text-white hover:text-primary-400 transition-colors flex items-center gap-1.5">
                            {app.job?.title} <ExternalLink size={12} className="text-zinc-500" />
                          </Link>
                          <p className="text-sm text-zinc-400 mt-0.5">{app.job?.companyName}</p>
                        </div>
                        <span className={`badge ${cfg.color} flex items-center gap-1`}><Icon size={11} /> {cfg.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-zinc-500">
                        {app.job?.location && <span className="flex items-center gap-1"><MapPin size={11} /> {app.job.location}</span>}
                        <span className="flex items-center gap-1"><Calendar size={11} /> Applied {days === 0 ? "today" : `${days} days ago`}</span>
                        {app.job?.jobType && <span className="px-2 py-0.5 rounded-full bg-surface-800 border border-white/5">{app.job.jobType}</span>}
                      </div>
                      {app.interviewDate && app.status === "interview" && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs flex items-center gap-2">
                          <Clock size={12} /> Interview: {new Date(app.interviewDate).toLocaleString()} ({app.interviewType})
                        </div>
                      )}
                    </div>
                    <div className="ml-auto shrink-0">
                      {!["offered", "rejected", "withdrawn"].includes(app.status) && (
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          disabled={withdrawing === app._id}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all"
                        >
                          {withdrawing === app._id ? <Loader2 size={12} className="animate-spin" /> : "Withdraw"}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Timeline */}
                  {app.statusHistory?.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {app.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-1 shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[h.status]?.color || "badge-primary"}`}>{h.status}</span>
                            {i < app.statusHistory.length - 1 && <span className="text-zinc-700 text-xs">→</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ── RECRUITER VIEW ── */
function RecruiterApplications() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    import("../utils/api").then(({ jobsAPI }) =>
      jobsAPI.getMyJobs()
        .then((res) => setJobs(res.data.jobs || []))
        .finally(() => setLoadingJobs(false))
    );
  }, []);

  const loadApplications = async (jobId) => {
    setSelectedJob(jobId);
    setLoadingApps(true);
    try {
      const res = await applicationsAPI.getJobApplications(jobId);
      setApps(res.data.applications || []);
    } catch (err) { toast.error("Failed to load applications"); }
    finally { setLoadingApps(false); }
  };

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      const res = await applicationsAPI.updateStatus(appId, { status });
      setApps((a) => a.map((app) => app._id === appId ? { ...app, status: res.data.application.status } : app));
      toast.success(`Status updated to ${status}`);
    } catch (err) { toast.error("Failed to update status"); }
    finally { setUpdating(null); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Jobs List */}
      <div className="card lg:col-span-1 h-fit">
        <h3 className="font-bold text-white mb-4">Select a Job</h3>
        {loadingJobs ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-zinc-400 text-sm mb-3">No jobs posted yet</p>
            <Link to="/post-job" className="btn-primary text-sm py-2 inline-block">Post a Job</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <button key={job._id} onClick={() => loadApplications(job._id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedJob === job._id ? "bg-primary-500/10 border-primary-500/40" : "bg-surface-800/40 border-white/5 hover:border-white/10"}`}>
                <div className="font-medium text-sm text-white line-clamp-1">{job.title}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{job.applicationsCount || 0} applications · {job.status}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Applications */}
      <div className="lg:col-span-2">
        {!selectedJob ? (
          <div className="card text-center py-16">
            <FileText size={48} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">Select a job to view its applications</p>
          </div>
        ) : loadingApps ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card"><div className="skeleton h-24 rounded-lg" /></div>)}</div>
        ) : apps.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-zinc-400">No applications for this job yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              return (
                <motion.div key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`card border ${cfg.bg}`}>
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center text-lg font-bold text-primary-400 shrink-0">
                      {app.applicant?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-semibold text-white">{app.applicant?.name}</div>
                          <div className="text-sm text-zinc-400">{app.applicant?.email}</div>
                          {app.applicant?.profile?.experience && (
                            <div className="text-xs text-zinc-500 mt-0.5">{app.applicant.profile.experience} experience</div>
                          )}
                        </div>
                        <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      {app.applicant?.profile?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.applicant.profile.skills.slice(0, 4).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-surface-800 text-zinc-400 border border-white/5">{s}</span>
                          ))}
                        </div>
                      )}
                      {app.coverLetter && (
                        <div className="mt-2 text-xs text-zinc-500 line-clamp-2 bg-surface-800/50 rounded-lg p-2">"{app.coverLetter}"</div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {RECRUITER_STATUSES.map((s) => (
                          <button key={s} onClick={() => updateStatus(app._id, s)}
                            disabled={updating === app._id || app.status === s}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${app.status === s ? "bg-primary-500/20 border-primary-500/40 text-primary-400" : "bg-surface-800/60 border-white/5 text-zinc-400 hover:text-white hover:border-white/20"}`}>
                            {updating === app._id ? <Loader2 size={10} className="animate-spin inline" /> : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{user?.role === "recruiter" ? "Manage Applications" : "My Applications"}</h1>
          <p className="text-zinc-400 mt-1">{user?.role === "recruiter" ? "Review and update candidate statuses" : "Track all your job applications in one place"}</p>
        </div>
        {user?.role === "recruiter" ? <RecruiterApplications /> : <SeekerApplications />}
      </div>
    </div>
  );
}
