import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, X, Loader2, Save, ChevronRight } from "lucide-react";
import { jobsAPI } from "../utils/api";
import useAuthStore from "../context/authStore";
import toast from "react-hot-toast";

const STEPS = ["Basic Info", "Details", "Requirements", "Preview"];

const INITIAL = {
  title: "", description: "", location: "", locationType: "onsite",
  jobType: "full-time", experience: "fresher", category: "Technology",
  skills: [], requirements: [], responsibilities: [], perks: [],
  salary: { min: "", max: "", currency: "INR", isVisible: true },
  applicationDeadline: "", status: "active",
  companyName: "", companyLogo: "",
};

// TagInput is OUTSIDE PostJobPage to prevent focus loss
const TagInput = ({ label, field, value, setValue, form, setForm, placeholder }) => {
  const addTag = () => {
    const v = value.trim();
    if (!v || form[field].includes(v)) { setValue(""); return; }
    setForm((f) => ({ ...f, [field]: [...f[field], v] }));
    setValue("");
  };

  const removeTag = (index) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className="input text-sm flex-1"
        />
        <button type="button" onClick={addTag} className="btn-secondary text-sm px-3 py-2">
          <Plus size={15} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {form[field].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm">
            {item}
            <button onClick={() => removeTag(i)} type="button"><X size={11} /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default function PostJobPage() {
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [respInput, setRespInput] = useState("");
  const [perkInput, setPerkInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (user?.company?.name) setForm((f) => ({ ...f, companyName: user.company.name, companyLogo: user.company.logo || "" }));
  }, [user]);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      jobsAPI.getJob(id)
        .then((res) => {
          const j = res.data.job;
          setForm({
            title: j.title || "", description: j.description || "", location: j.location || "",
            locationType: j.locationType || "onsite", jobType: j.jobType || "full-time",
            experience: j.experience || "fresher", category: j.category || "Technology",
            skills: j.skills || [], requirements: j.requirements || [],
            responsibilities: j.responsibilities || [], perks: j.perks || [],
            salary: j.salary || { min: "", max: "", currency: "INR", isVisible: true },
            applicationDeadline: j.applicationDeadline ? j.applicationDeadline.split("T")[0] : "",
            status: j.status || "active", companyName: j.companyName || "", companyLogo: j.companyLogo || "",
          });
        })
        .catch(() => { toast.error("Job not found"); navigate("/dashboard"); })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.location || !form.skills.length) {
      toast.error("Please fill in all required fields and add at least one skill");
      setStep(0);
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, salary: { ...form.salary, min: Number(form.salary.min) || 0, max: Number(form.salary.max) || 0 } };
      if (isEdit) {
        await jobsAPI.updateJob(id, payload);
        toast.success("Job updated successfully!");
      } else {
        await jobsAPI.createJob(payload);
        toast.success("Job posted successfully! 🎉");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Loader2 size={32} className="text-primary-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">{isEdit ? "Edit Job" : "Post a New Job"}</h1>
          <p className="text-zinc-400">Fill in the details to {isEdit ? "update" : "publish"} your job listing</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 text-sm font-medium transition-all ${i === step ? "text-primary-400" : i < step ? "text-white" : "text-zinc-600"}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${i === step ? "bg-primary-500 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-surface-800 text-zinc-600"}`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-emerald-500/50" : "bg-surface-700"}`} />}
            </React.Fragment>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card space-y-6">
          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <>
              <h2 className="font-bold text-white text-lg">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Job Title *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior React Developer" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name *</label>
                <input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} placeholder="Your company name" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Location *</label>
                  <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Bangalore, India" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Work Mode</label>
                  <select value={form.locationType} onChange={(e) => setForm((f) => ({ ...f, locationType: e.target.value }))} className="input">
                    {["onsite", "remote", "hybrid"].map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Job Type</label>
                  <select value={form.jobType} onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value }))} className="input">
                    {["full-time", "part-time", "contract", "internship", "freelance"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Experience</label>
                  <select value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} className="input">
                    {["fresher", "1-2 years", "3-5 years", "5+ years"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
                    {["Technology","Design","Marketing","Finance","Healthcare","Education","Sales","Operations","HR","Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Application Deadline</label>
                <input type="date" value={form.applicationDeadline} onChange={(e) => setForm((f) => ({ ...f, applicationDeadline: e.target.value }))} className="input" min={new Date().toISOString().split("T")[0]} />
              </div>
            </>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <>
              <h2 className="font-bold text-white text-lg">Job Details</h2>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Job Description *</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the role, team, and what the candidate will be doing..." rows={8} className="input resize-none" />
              </div>
              <TagInput
                label="Required Skills *"
                field="skills"
                value={skillInput}
                setValue={setSkillInput}
                form={form}
                setForm={setForm}
                placeholder="e.g. React (press Enter)"
              />
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Salary Range (₹/year)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.salary.min} onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, min: e.target.value } }))} placeholder="Min (e.g. 600000)" className="input text-sm" />
                  <input type="number" value={form.salary.max} onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, max: e.target.value } }))} placeholder="Max (e.g. 1200000)" className="input text-sm" />
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={form.salary.isVisible} onChange={(e) => setForm((f) => ({ ...f, salary: { ...f.salary, isVisible: e.target.checked } }))} className="rounded" />
                  <span className="text-sm text-zinc-400">Show salary publicly</span>
                </label>
              </div>
            </>
          )}

          {/* Step 2 — Requirements */}
          {step === 2 && (
            <>
              <h2 className="font-bold text-white text-lg">Requirements & Perks</h2>
              <TagInput label="Requirements" field="requirements" value={reqInput} setValue={setReqInput} form={form} setForm={setForm} placeholder="e.g. 3+ years of React experience" />
              <TagInput label="Responsibilities" field="responsibilities" value={respInput} setValue={setRespInput} form={form} setForm={setForm} placeholder="e.g. Build scalable frontend apps" />
              <TagInput label="Perks & Benefits" field="perks" value={perkInput} setValue={setPerkInput} form={form} setForm={setForm} placeholder="e.g. Health Insurance, WFH Allowance" />
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="input">
                  <option value="active">Active (visible to applicants)</option>
                  <option value="draft">Draft (hidden)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </>
          )}

          {/* Step 3 — Preview */}
          {step === 3 && (
            <>
              <h2 className="font-bold text-white text-lg">Preview & Submit</h2>
              <div className="space-y-3 text-sm">
                {[
                  ["Title", form.title],
                  ["Company", form.companyName],
                  ["Location", `${form.location} (${form.locationType})`],
                  ["Type", `${form.jobType} · ${form.experience}`],
                  ["Category", form.category],
                  ["Skills", form.skills.join(", ") || "—"],
                  ["Salary", form.salary.min ? `₹${(form.salary.min/100000).toFixed(1)}L - ₹${(form.salary.max/100000).toFixed(1)}L` : "Not specified"],
                  ["Status", form.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 p-3 rounded-xl bg-surface-800/50">
                    <span className="text-zinc-500 w-24 shrink-0">{k}</span>
                    <span className="text-white font-medium">{v || "—"}</span>
                  </div>
                ))}
              </div>
              {(!form.title || !form.description || !form.location || !form.skills.length) && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  ⚠ Please fill in: {[!form.title && "Title", !form.description && "Description", !form.location && "Location", !form.skills.length && "Skills"].filter(Boolean).join(", ")}
                </div>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2 border-t border-white/5">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex-1 text-sm py-2.5">← Previous</button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-1">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {isEdit ? "Update Job" : "Publish Job"}</>}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}