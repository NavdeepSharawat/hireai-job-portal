import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hireai_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally - auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hireai_token");
      localStorage.removeItem("hireai_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// =============================================
// AUTH ENDPOINTS
// =============================================
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/change-password", data),
  toggleSaveJob: (jobId) => API.put(`/auth/saved-jobs/${jobId}`),
};

// =============================================
// JOBS ENDPOINTS
// =============================================
export const jobsAPI = {
  getJobs: (params) => API.get("/jobs", { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  createJob: (data) => API.post("/jobs", data),
  updateJob: (id, data) => API.put(`/jobs/${id}`, data),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
  getMyJobs: () => API.get("/jobs/my-jobs"),
  getTrendingSkills: () => API.get("/jobs/skills"),
};

// =============================================
// APPLICATIONS ENDPOINTS
// =============================================
export const applicationsAPI = {
  apply: (jobId, data) => API.post(`/applications/${jobId}`, data),
  getMyApplications: (params) => API.get("/applications/my", { params }),
  getJobApplications: (jobId, params) => API.get(`/applications/job/${jobId}`, { params }),
  updateStatus: (id, data) => API.put(`/applications/${id}/status`, data),
  withdraw: (id) => API.put(`/applications/${id}/withdraw`),
  getRecruiterStats: () => API.get("/applications/recruiter-stats"),
  getSeekerStats: () => API.get("/applications/seeker-stats"),
};

export default API;
