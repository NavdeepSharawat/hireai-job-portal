import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase, Users, FileText, TrendingUp, Plus, Eye, Clock,
  CheckCircle, XCircle, AlertCircle, ChevronRight, BarChart3, Loader2
} from "lucide-react";
import { applicationsAPI, jobsAPI } from "../utils/api";
import useAuthStore from "../context/authStore";

const STATUS_CONFIG = {
  applied:     { color: "badge-primary",  icon: FileText,      label: "Applied" },
  reviewing:   { color: "badge-yellow",   icon: Eye,           label: "Reviewing" },
  shortlisted: { color: "badge-green",    icon: CheckCircle,   label: "Shortlisted" },
  interview:   { color: "badge-orange",   icon: Clock,         label: "Interview" },
  offered:     { color: "badge-green",    icon: TrendingUp,    label: "Offered" },
  rejected:    { color: "badge-red",      icon: XCircle,       label: "Rejected" },
  withdrawn:   { color: "bg-zinc-700/40 text-zinc-400 border border-zinc-600/40", icon: AlertCircle, label: "Withdrawn" },
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

/* ── RECRUITER DASHBOARD ── */
function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    Promise.all([applicationsAPI.getRecruiterStats(), jobsAPI.getMyJobs()])
      .then(([statsRes, jobsRes]) => {
        setData(statsRes.data);
        setMyJobs(jobsRes.data.jobs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const { stats, recentApplications } = data || {};
  const statCards = [
    { label: "Total Jobs Posted", value: stats?.totalJobs || 0, icon: Briefcase, color: "from-primary-500 to-indigo-600" },
    { label: "Active Listings", value: stats?.activeJobs || 0, icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
    { label: "Total Applications", value: stats?.totalApplications || 0, icon: Users, color: "from-orange-500 to-amber-600" },
    { label: "Shortlisted", value: stats?.statusBreakdown?.find(s => s._id === "shortlisted")?.count || 0, icon: CheckCircle, color: "from-purple-500 to-violet-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Recruiter Dashboard</h1>
          <p className="text-zinc-400 mt-1">Welcome back, <span className="text-primary-400">{user?.name}</span> 👋</p>
        </div>
        <Link to="/post-job" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Post New Job
        </Link>
      </div>

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={fadeUp} className="card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">My Job Listings</h2>
            <Link to="/post-job" className="text-xs text-primary-400 hover:underline flex items-center gap-1">
              Post New <ChevronRight size={12} />
            </Link>
          </div>
          {myJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase size={36} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No jobs posted yet</p>
              <Link to="/post-job" className="btn-primary text-sm py-2 mt-4 inline-block">Post Your First Job</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myJobs.slice(0, 5).map((job) => (
                <div key={job._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/50 border border-white/5 hover:border-white/10 transition-all group">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white text-sm group-hover:text-primary-400 transition-colors line-clamp-1">{job.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{job.applicationsCount || 0} applications · {job.status}</div>
                  </div>
                  <div className="flex gap-2 ml-3 shrink-0">
                    <Link to={`/applications?job=${job._id}`} className="text-xs text-primary-400 hover:underline">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <h2 className="font-bold text-white mb-5">Recent Applications</h2>
          {!recentApplications?.length ? (
            <div className="text-center py-8">
              <Users size={36} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No applications received yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => {
                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                return (
                  <div key={app._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-white/5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center text-sm font-bold text-primary-400 shrink-0">
                      {app.applicant?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white line-clamp-1">{app.applicant?.name}</div>
                      <div className="text-xs text-zinc-500 line-clamp-1">{app.job?.title}</div>
                    </div>
                    <span className={`badge ${cfg.color} shrink-0`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── JOB SEEKER DASHBOARD ── */
function SeekerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    applicationsAPI.getSeekerStats()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const { stats, recent } = data || {};
  const statusMap = Object.fromEntries((stats?.statusBreakdown || []).map(s => [s._id, s.count]));

  const statCards = [
    { label: "Total Applied", value: stats?.total || 0, icon: FileText, color: "from-primary-500 to-indigo-600" },
    { label: "Under Review", value: (statusMap.applied || 0) + (statusMap.reviewing || 0), icon: Eye, color: "from-yellow-500 to-amber-600" },
    { label: "Shortlisted", value: (statusMap.shortlisted || 0) + (statusMap.interview || 0), icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
    { label: "Offers", value: statusMap.offered || 0, icon: TrendingUp, color: "from-purple-500 to-violet-600" },
  ];

  const profileComplete = (() => {
    const p = user?.profile;
    let score = 0;
    if (user?.name) score += 20;
    if (p?.bio) score += 20;
    if (p?.skills?.length) score += 20;
    if (p?.location) score += 20;
    if (p?.experience) score += 20;
    return score;
  })();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <p className="text-zinc-400 mt-1">Welcome back, <span className="text-primary-400">{user?.name}</span> 👋</p>
        </div>
        <Link to="/jobs" className="btn-primary flex items-center gap-2">
          <Briefcase size={16} /> Browse Jobs
        </Link>
      </div>

      {/* Profile Completion */}
      {profileComplete < 100 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="card border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-purple-500/5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div>
              <div className="font-semibold text-white">Complete Your Profile</div>
              <div className="text-sm text-zinc-400">A complete profile gets 5x more recruiter views</div>
            </div>
            <Link to="/profile" className="btn-outline text-sm py-2">Edit Profile</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileComplete}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
              />
            </div>
            <span className="text-sm font-bold text-primary-400">{profileComplete}%</span>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={fadeUp} className="card">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Recent Applications</h2>
          <Link to="/applications" className="text-xs text-primary-400 hover:underline flex items-center gap-1">
            View All <ChevronRight size={12} />
          </Link>
        </div>
        {!recent?.length ? (
          <div className="text-center py-10">
            <FileText size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm mb-4">You haven't applied to any jobs yet</p>
            <Link to="/jobs" className="btn-primary text-sm py-2.5 inline-block">Browse Jobs</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((app) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              const Icon = cfg.icon;
              return (
                <div key={app._id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/10 flex items-center justify-center text-sm font-bold text-primary-400 shrink-0">
                    {app.job?.companyName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm line-clamp-1">{app.job?.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{app.job?.companyName} · {app.job?.location}</div>
                  </div>
                  <span className={`badge ${cfg.color} shrink-0 flex items-center gap-1`}>
                    <Icon size={11} /> {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><div className="skeleton h-8 w-48 rounded" /><div className="skeleton h-4 w-36 rounded" /></div>
        <div className="skeleton h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="card"><div className="skeleton h-10 w-10 rounded-xl mb-3" /><div className="skeleton h-7 w-12 rounded mb-1" /><div className="skeleton h-3 w-24 rounded" /></div>)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {user?.role === "recruiter" ? <RecruiterDashboard /> : <SeekerDashboard />}
      </div>
    </div>
  );
}
