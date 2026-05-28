import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Github, Twitter, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-950/50 backdrop-blur-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">HireAI</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              AI-powered job portal connecting talented professionals with top companies.
            </p>
            <div className="flex gap-3 mt-4">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-surface-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary-500/50 transition-all">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">For Job Seekers</h4>
            <ul className="space-y-2.5">
              {[["Browse Jobs", "/jobs"], ["My Applications", "/applications"], ["Saved Jobs", "/saved-jobs"], ["Profile", "/profile"]].map(([label, href]) => (
                <li key={href}><Link to={href} className="text-sm text-zinc-500 hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">For Recruiters</h4>
            <ul className="space-y-2.5">
              {[["Post a Job", "/post-job"], ["Dashboard", "/dashboard"], ["Sign Up", "/register"]].map(([label, href]) => (
                <li key={href}><Link to={href} className="text-sm text-zinc-500 hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[["About Us", "#"], ["Privacy Policy", "#"], ["Terms of Service", "#"], ["Contact", "#"]].map(([label, href]) => (
                <li key={label}><a href={href} className="text-sm text-zinc-500 hover:text-primary-400 transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">© 2024 HireAI. All rights reserved.</p>
          <p className="text-xs text-zinc-600 flex items-center gap-1">
            Built with <Heart size={11} className="text-red-500 fill-red-500" /> using React & Node.js
          </p>
        </div>
      </div>
    </footer>
  );
}
