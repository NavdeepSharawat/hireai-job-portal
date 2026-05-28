import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkX, MapPin, Clock, Briefcase, ArrowRight } from "lucide-react";
import { authAPI } from "../utils/api";
import useAuthStore from "../context/authStore";
import toast from "react-hot-toast";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleSaveJob } = useAuthStore();

  useEffect(() => {
    authAPI.getMe()
      .then((res) => setJobs(res.data.user?.savedJobs || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (jobId) => {
    const res = await toggleSaveJob(jobId);
    if (res.success) {
      setJobs((j) => j.filter((job) => job._id !== jobId));
      toast.success("Job removed from saved");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bookmark className="text-primary-400" size={28} /> Saved Jobs
            </h1>
            <p className="text-zinc-400 mt-1">{loading ? "Loading..." : `${jobs.length} saved job${jobs.length !== 1 ? "s" : ""}`}</p>
          </div>
          <Link to="/jobs" className="btn-outline text-sm py-2.5 flex items-center gap-2">
            Browse More <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card"><div className="skeleton h-24 rounded-lg" /></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-20">
            <Bookmark size={48} className="text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No saved jobs yet</h3>
            <p className="text-zinc-400 mb-6">Bookmark jobs you're interested in to find them quickly later</p>
            <Link to="/jobs" className="btn-primary inline-block">Browse Jobs</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {jobs.map((job) => {
                const days = Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
                return (
                  <motion.div key={job._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="card card-hover flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/10 flex items-center justify-center text-lg font-bold text-primary-400 shrink-0">
                      {job.companyName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/jobs/${job._id}`} className="font-semibold text-white hover:text-primary-400 transition-colors">{job.title}</Link>
                      <p className="text-sm text-zinc-400 mt-0.5">{job.companyName}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={11} /> {job.jobType}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {days === 0 ? "Today" : `${days}d ago`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/jobs/${job._id}`} className="btn-outline text-xs py-2 px-3">Apply</Link>
                      <button onClick={() => handleRemove(job._id)} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                        <BookmarkX size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
