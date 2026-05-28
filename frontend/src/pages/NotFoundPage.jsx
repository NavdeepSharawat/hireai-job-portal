import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-zinc-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2"><Home size={16} /> Go Home</Link>
          <Link to="/jobs" className="btn-secondary flex items-center gap-2"><Search size={16} /> Browse Jobs</Link>
        </div>
      </motion.div>
    </div>
  );
}
