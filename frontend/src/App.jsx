import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./context/authStore";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PostJobPage from "./pages/PostJobPage";
import ProfilePage from "./pages/ProfilePage";
import ApplicationsPage from "./pages/ApplicationsPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected Route component
const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fafafa",
            border: "1px solid #3f3f46",
            borderRadius: "12px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          },
          success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
        }}
      />
      <div className="min-h-screen flex flex-col mesh-gradient">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/post-job" element={
              <ProtectedRoute role="recruiter"><PostJobPage /></ProtectedRoute>
            } />
            <Route path="/edit-job/:id" element={
              <ProtectedRoute role="recruiter"><PostJobPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute><ApplicationsPage /></ProtectedRoute>
            } />
            <Route path="/saved-jobs" element={
              <ProtectedRoute role="jobseeker"><SavedJobsPage /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
