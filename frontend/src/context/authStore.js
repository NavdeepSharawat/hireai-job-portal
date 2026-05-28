import { create } from "zustand";
import { authAPI } from "../utils/api";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("hireai_user")) || null,
  token: localStorage.getItem("hireai_token") || null,
  loading: false,
  initialized: false,

  // Register
  register: async (data) => {
    set({ loading: true });
    try {
      const res = await authAPI.register(data);
      const { token, user } = res.data;
      localStorage.setItem("hireai_token", token);
      localStorage.setItem("hireai_user", JSON.stringify(user));
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  },

  // Login
  login: async (data) => {
    set({ loading: true });
    try {
      const res = await authAPI.login(data);
      const { token, user } = res.data;
      localStorage.setItem("hireai_token", token);
      localStorage.setItem("hireai_user", JSON.stringify(user));
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("hireai_token");
    localStorage.removeItem("hireai_user");
    set({ user: null, token: null });
  },

  // Fetch fresh user data from server
  fetchMe: async () => {
    if (!get().token) {
      set({ initialized: true });
      return;
    }
    try {
      const res = await authAPI.getMe();
      const user = res.data.user;
      localStorage.setItem("hireai_user", JSON.stringify(user));
      set({ user, initialized: true });
    } catch (err) {
      set({ user: null, token: null, initialized: true });
      localStorage.removeItem("hireai_token");
      localStorage.removeItem("hireai_user");
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      const user = res.data.user;
      localStorage.setItem("hireai_user", JSON.stringify(user));
      set({ user });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Update failed" };
    }
  },

  // Toggle save job
  toggleSaveJob: async (jobId) => {
    try {
      const res = await authAPI.toggleSaveJob(jobId);
      const user = { ...get().user, savedJobs: res.data.savedJobs };
      localStorage.setItem("hireai_user", JSON.stringify(user));
      set({ user });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false };
    }
  },

  isJobSaved: (jobId) => {
    const { user } = get();
    return user?.savedJobs?.some((id) => id === jobId || id?._id === jobId) || false;
  },

  isRecruiter: () => get().user?.role === "recruiter",
  isJobSeeker: () => get().user?.role === "jobseeker",
}));

export default useAuthStore;
