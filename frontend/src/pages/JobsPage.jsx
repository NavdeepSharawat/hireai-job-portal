import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, SlidersHorizontal, X, Briefcase, Clock, Building2, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";
import { jobsAPI } from "../utils/api";
import useAuthStore from "../context/authStore";
import toast from "react-hot-toast";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];
const LOCATION_TYPES = ["remote", "onsite", "hybrid"];
const EXPERIENCE_LEVELS = ["fresher", "1-2 years", "3-5 years", "5+ years"];
const CATEGORIES = ["Technology", "Design", "Marketing", "Finance", "Healthcare", "Education", "Sales", "Operations", "HR", "Other"];

const STATUS_COLORS = {
  "full-time": "badge-primary",
  "part-time": "badge-green",
  "contract": "badge-orange",
  "internship": "badge-yellow",
  "freelance": "badge-red",
  "remote": "badge-green",
  "onsite": "badge-primary",
  "hybrid": "badge-yellow",
};

function JobCard({ job, onSave, isSaved }) {
  const postedDays = Math.floor((Date.now() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="card card-hover group relative"
    >
      {/* Save Button */}
      {onSave && (
        <button
          onClick={(e) => { e.preventDefault(); onSave(job._id); }}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-primary-400 hover:border-primary-500/50 transition-all z-10"
        >
          {isSaved ? <BookmarkCheck size={14} className="text-primary-400" /> : <Bookmark size={14} />}
        </button>
      )}

      <Link to={`/jobs/${job._id}`} className="block">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/20 flex items-center justify-center text-lg font-bold text-primary-400 shrink-0">
            {job.companyName?.[0]?.toUpperCase() || "C"}
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">{job.title}</h3>
            <p className="text-sm text-zinc-400 mt-0.5">{job.companyName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={STATUS_COLORS[job.jobType] || "badge-primary"}>{job.jobType}</span>
          <span className={STATUS_COLORS[job.locationType] || "badge-primary"}>{job.locationType}</span>
          {job.experience && <span className="badge bg-surface-800 text-zinc-400 border border-white/10">{job.experience}</span>}
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {postedDays === 0 ? "Today" : `${postedDays}d ago`}</span>
          {job.applicationsCount > 0 && (
            <span className="flex items-center gap-1"><Briefcase size={12} /> {job.applicationsCount} applied</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills?.slice(0, 4).map((s) => (
            <span key={s} className="text-xs px-2 py-1 rounded-lg bg-surface-800 text-zinc-400 border border-white/5">{s}</span>
          ))}
          {job.skills?.length > 4 && <span className="text-xs px-2 py-1 rounded-lg bg-surface-800 text-zinc-500">+{job.skills.length - 4}</span>}
        </div>

        {job.salary?.isVisible && (job.salary.min || job.salary.max) && (
          <div className="text-sm font-semibold text-emerald-400">
            ₹{job.salary.min ? `${(job.salary.min / 100000).toFixed(1)}L` : ""} 
            {job.salary.min && job.salary.max ? " - " : ""}
            {job.salary.max ? `${(job.salary.max / 100000).toFixed(1)}L` : ""} / year
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { user, toggleSaveJob, isJobSaved } = useAuthStore();

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    jobType: searchParams.get("jobType") || "",
    locationType: searchParams.get("locationType") || "",
    experience: searchParams.get("experience") || "",
    category: searchParams.get("category") || "",
    page: Number(searchParams.get("page")) || 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v !== 0));
      const res = await jobsAPI.getJobs(params);
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "" && v !== 1));
    setSearchParams(params);
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: "", location: "", jobType: "", locationType: "", experience: "", category: "", page: 1 });
  };

  const handleSave = async (jobId) => {
    if (!user) { toast.error("Please log in to save jobs"); return; }
    const res = await toggleSaveJob(jobId);
    if (res.success) toast.success(res.message);
  };

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== "page" && k !== "search" && k !== "location");

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Find Jobs</h1>
          <p className="text-zinc-400">{loading ? "Loading..." : `${total.toLocaleString()} opportunities available`}</p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 bg-surface-900 border border-white/10 rounded-xl px-4 py-3">
            <Search size={18} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Job title, skills, or company..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
            />
            {filters.search && <button onClick={() => updateFilter("search", "")}><X size={15} className="text-zinc-500 hover:text-white" /></button>}
          </div>
          <div className="flex items-center gap-2 sm:w-48 bg-surface-900 border border-white/10 rounded-xl px-4 py-3">
            <MapPin size={18} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              placeholder="City or remote"
              className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
              filtersOpen || activeFilters.length > 0
                ? "bg-primary-500/10 border-primary-500/50 text-primary-400"
                : "bg-surface-900 border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="card grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                {[
                  { label: "Job Type", key: "jobType", options: JOB_TYPES },
                  { label: "Work Mode", key: "locationType", options: LOCATION_TYPES },
                  { label: "Experience", key: "experience", options: EXPERIENCE_LEVELS },
                  { label: "Category", key: "category", options: CATEGORIES },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">{label}</label>
                    <select
                      value={filters[key]}
                      onChange={(e) => updateFilter(key, e.target.value)}
                      className="input text-sm py-2"
                    >
                      <option value="">All {label}s</option>
                      {options.map((o) => (
                        <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                  <X size={14} /> Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-medium">
                {value}
                <button onClick={() => updateFilter(key, "")}><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card">
                <div className="flex gap-3 mb-4">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                </div>
                <div className="skeleton h-3 w-full rounded mb-2" />
                <div className="skeleton h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-zinc-400 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onSave={user?.role === "jobseeker" ? handleSave : null}
                  isSaved={isJobSaved(job._id)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page === 1}
              className="btn-secondary flex items-center gap-1 py-2.5 px-4 text-sm disabled:opacity-30"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <span className="text-sm text-zinc-400">Page {filters.page} of {pages}</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              disabled={filters.page === pages}
              className="btn-secondary flex items-center gap-1 py-2.5 px-4 text-sm disabled:opacity-30"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
