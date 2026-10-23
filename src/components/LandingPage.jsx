import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Lock
} from 'lucide-react';

export default function LandingPage({ onLaunch }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xs">
              <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                AuditSphere
              </span>
              <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PlantIQ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLaunch}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onLaunch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              <span>Launch PlantIQ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Text + Analyzing Photo */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            
            {/* Title & Headline */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Manufacturing Audit Analytics • PlantIQ Toolkit</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                Plant<span className="text-blue-600">IQ</span> Manufacturing <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Audit Analytics
                </span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                One unified platform for equipment reliability, PM schedule validation, breakdown loss diagnostics, and interactive natural language audit reporting.
              </p>
            </div>

            {/* THE ANALYZING PHOTO */}
            <div className="relative rounded-3xl bg-white border border-slate-200 p-2 sm:p-3 shadow-md overflow-hidden group">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src="/analytics-hero.png"
                  alt="AuditSphere Manufacturing Audit Analytics Inspection"
                  className="w-full h-auto object-cover max-h-[360px] sm:max-h-[400px] transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Clean Launch Button Action Station */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
            
            <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-left relative overflow-hidden">
              
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">AuditSphere Workspace</h3>
                <p className="text-xs text-slate-500 mt-1">Access PM compliance analysis and reliability diagnostic tools.</p>
              </div>

              {/* The Launch Button */}
              <button
                type="button"
                onClick={onLaunch}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95 group"
              >
                <span className="tracking-wide text-base">Launch PlantIQ</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Enterprise AD Sign In option */}
              <button
                type="button"
                onClick={onLaunch}
                className="w-full mt-3.5 py-3 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Enterprise AD Sign In</span>
              </button>

              <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                <span className="text-[11px] text-slate-500">
                  Enterprise Audit • Secured with Enterprise Standards
                </span>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AuditSphere • Powered by PlantIQ Analytics Engine</span>
          <span className="font-mono text-[11px] text-slate-500">Enterprise Edition v2.4 • Confidential</span>
        </div>
      </footer>

    </div>
  );
}
