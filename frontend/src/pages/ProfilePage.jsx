import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Building2, Save, Loader2, Plus, X, Lock, Eye, EyeOff, Link as LinkIcon } from "lucide-react";
import useAuthStore from "../context/authStore";
import { authAPI } from "../utils/api";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    profile: {
      bio: user?.profile?.bio || "",
      skills: user?.profile?.skills || [],
      experience: user?.profile?.experience || "",
      location: user?.profile?.location || "",
      resume: user?.profile?.resume || "",
      avatar: user?.profile?.avatar || "",
      linkedin: user?.profile?.linkedin || "",
      github: user?.profile?.github || "",
      portfolio: user?.profile?.portfolio || "",
    },
    company: {
      name: user?.company?.name || "",
      website: user?.company?.website || "",
      description: user?.company?.description || "",
      industry: user?.company?.industry || "",
      size: user?.company?.size || "",
      location: user?.company?.location || "",
    },
  });

  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false });

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const token = localStorage.getItem("hireai_token");
      const res = await axios.post(
        "https://hireai-backend-seuo.onrender.com/api/upload/resume",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setProfileForm((f) => ({ ...f, profile: { ...f.profile, resume: res.data.url } }));
      toast.success("Resume uploaded! ✅");
    } catch (err) {
      toast.error("Upload failed");
    }
    setUploadingResume(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("hireai_token");
      const res = await axios.post(
        "https://hireai-backend-seuo.onrender.com/api/upload/avatar",
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setProfileForm((f) => ({ ...f, profile: { ...f.profile, avatar: res.data.url } }));
      toast.success("Profile picture uploaded! ✅");
    } catch (err) {
      toast.error("Upload failed");
    }
    setUploadingAvatar(false);
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v || profileForm.profile.skills.includes(v)) { setSkillInput(""); return; }
    setProfileForm((f) => ({ ...f, profile: { ...f.profile, skills: [...f.profile.skills, v] } }));
    setSkillInput("");
  };

  const removeSkill = (i) => {
    setProfileForm((f) => ({ ...f, profile: { ...f.profile, skills: f.profile.skills.filter((_, idx) => idx !== i) } }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({ name: profileForm.name, profile: profileForm.profile, company: profileForm.company });
    if (res.success) toast.success("Profile updated!");
    else toast.error(res.message);
    setSaving(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) { toast.error("Passwords don't match"); return; }
    if (passForm.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success("Password changed!");
      setPassForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    setSaving(false);
  };

  const TABS = [
    { id: "profile", label: user?.role === "recruiter" ? "Company" : "Profile", icon: user?.role === "recruiter" ? Building2 : User },
    { id: "security", label: "Security", icon: Lock }
  ];

  const profileComplete = (() => {
    if (user?.role === "recruiter") return 100;
    const p = profileForm.profile;
    let s = 0;
    if (profileForm.name) s += 20;
    if (p.bio) s += 20;
    if (p.skills.length) s += 20;
    if (p.location) s += 20;
    if (p.experience) s += 20;
    return s;
  })();

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400 mt-1">Manage your account and preferences</p>
        </div>

        {/* User Card */}
        <div className="card mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-glow shrink-0 overflow-hidden">
            {profileForm.profile.avatar
              ? <img src={profileForm.profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase()
            }
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-lg">{user?.name}</div>
            <div className="text-zinc-400 text-sm">{user?.email}</div>
            <span className={`badge text-xs mt-1 ${user?.role === "recruiter" ? "bg-accent-500/20 text-accent-400 border-accent-500/30" : "badge-primary"}`}>
              {user?.role === "recruiter" ? "Recruiter" : "Job Seeker"}
            </span>
          </div>
          {user?.role === "jobseeker" && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-primary-400">{profileComplete}%</div>
              <div className="text-xs text-zinc-500">Profile Complete</div>
              <div className="w-20 h-1.5 bg-surface-800 rounded-full mt-1.5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${profileComplete}%` }} transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${tab === id ? "bg-primary-500/10 border-primary-500/40 text-primary-400" : "bg-surface-900 border-white/5 text-zinc-400 hover:text-white"}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleProfileSave} className="card space-y-5">
              <h2 className="font-bold text-white">Personal Information</h2>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
                <input value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} className="input" />
              </div>

              {user?.role === "jobseeker" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                    <textarea value={profileForm.profile.bio} onChange={(e) => setProfileForm((f) => ({ ...f, profile: { ...f.profile, bio: e.target.value } }))} rows={3} placeholder="Tell recruiters about yourself..." className="input resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                      <input value={profileForm.profile.location} onChange={(e) => setProfileForm((f) => ({ ...f, profile: { ...f.profile, location: e.target.value } }))} placeholder="e.g. Bangalore" className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Experience Level</label>
                      <select value={profileForm.profile.experience} onChange={(e) => setProfileForm((f) => ({ ...f, profile: { ...f.profile, experience: e.target.value } }))} className="input">
                        <option value="">Select...</option>
                        {["fresher", "1-2 years", "3-5 years", "5+ years"].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Skills</label>
                    <div className="flex gap-2 mb-2">
                      <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                        placeholder="Add a skill (press Enter)" className="input text-sm flex-1" />
                      <button type="button" onClick={addSkill} className="btn-secondary px-3 py-2"><Plus size={15} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileForm.profile.skills.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm">
                          {s} <button type="button" onClick={() => removeSkill(i)}><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links & Resume */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><LinkIcon size={14} /> Links & Resume</h3>

                    {/* Resume Upload */}
                    <div className="p-3 rounded-xl bg-surface-800/50 border border-white/5">
                      <p className="text-xs text-zinc-400 mb-2">Upload Resume (PDF, DOC — max 5MB)</p>
                      <div className="flex items-center gap-3">
                        <label className="btn-primary text-xs py-2 px-4 cursor-pointer flex items-center gap-2">
                          {uploadingResume ? <><Loader2 size={12} className="animate-spin" /> Uploading...</> : "📄 Upload Resume"}
                          <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                        </label>
                        {profileForm.profile.resume && (
                          <a href={profileForm.profile.resume} target="_blank" rel="noreferrer" className="text-xs text-primary-400 hover:underline">View Current Resume</a>
                        )}
                      </div>
                    </div>

                    {/* Avatar Upload */}
                    <div className="p-3 rounded-xl bg-surface-800/50 border border-white/5">
                      <p className="text-xs text-zinc-400 mb-2">Profile Picture (JPG, PNG — max 2MB)</p>
                      <div className="flex items-center gap-3">
                        {profileForm.profile.avatar && (
                          <img src={profileForm.profile.avatar} alt="avatar" className="w-10 h-10 rounded-xl object-cover" />
                        )}
                        <label className="btn-secondary text-xs py-2 px-4 cursor-pointer flex items-center gap-2">
                          {uploadingAvatar ? <><Loader2 size={12} className="animate-spin" /> Uploading...</> : "🖼️ Upload Photo"}
                          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                        </label>
                      </div>
                    </div>

                    {[
                      { label: "LinkedIn", key: "linkedin", placeholder: "https://linkedin.com/in/..." },
                      { label: "GitHub", key: "github", placeholder: "https://github.com/..." },
                      { label: "Portfolio", key: "portfolio", placeholder: "https://myportfolio.com" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs text-zinc-500 mb-1">{label}</label>
                        <input value={profileForm.profile[key]} onChange={(e) => setProfileForm((f) => ({ ...f, profile: { ...f.profile, [key]: e.target.value } }))} placeholder={placeholder} className="input text-sm" />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Company Name</label>
                      <input value={profileForm.company.name} onChange={(e) => setProfileForm((f) => ({ ...f, company: { ...f.company, name: e.target.value } }))} className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Industry</label>
                      <input value={profileForm.company.industry} onChange={(e) => setProfileForm((f) => ({ ...f, company: { ...f.company, industry: e.target.value } }))} placeholder="e.g. FinTech" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">About Company</label>
                    <textarea value={profileForm.company.description} onChange={(e) => setProfileForm((f) => ({ ...f, company: { ...f.company, description: e.target.value } }))} rows={3} className="input resize-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Website</label>
                      <input value={profileForm.company.website} onChange={(e) => setProfileForm((f) => ({ ...f, company: { ...f.company, website: e.target.value } }))} placeholder="https://..." className="input text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                      <input value={profileForm.company.location} onChange={(e) => setProfileForm((f) => ({ ...f, company: { ...f.company, location: e.target.value } }))} className="input text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Team Size</label>
                      <select value={profileForm.company.size} onChange={(e) => setProfileForm((f) => ({ ...f, company: { ...f.company, size: e.target.value } }))} className="input text-sm">
                        <option value="">Select...</option>
                        {["1-10", "11-50", "51-200", "201-500", "500+"].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 justify-center w-full">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
              </button>
            </form>
          </motion.div>
        )}

        {/* Security Tab */}
        {tab === "security" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handlePasswordSave} className="card space-y-5">
              <h2 className="font-bold text-white">Change Password</h2>
              {[
                { label: "Current Password", key: "currentPassword", showKey: "current" },
                { label: "New Password", key: "newPassword", showKey: "new" },
                { label: "Confirm New Password", key: "confirm", showKey: "new" },
              ].map(({ label, key, showKey }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type={showPass[showKey] ? "text" : "password"}
                      value={passForm[key]} onChange={(e) => setPassForm((f) => ({ ...f, [key]: e.target.value }))}
                      required minLength={key !== "currentPassword" ? 6 : undefined}
                      className="input pl-10 pr-10" autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPass((s) => ({ ...s, [showKey]: !s[showKey] }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                      {showPass[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 justify-center w-full">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : <><Lock size={15} /> Update Password</>}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
