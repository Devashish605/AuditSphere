import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Layers, 
  UploadCloud, 
  BarChart3, 
  Bot, 
  LogOut,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function Navbar({ 
  currentStep, 
  setCurrentStep, 
  selectedProcess, 
  selectedCheckpoints,
  onOpenSlide,
  onToggleChat,
  isChatOpen,
  onLogout 
}) {
  const steps = [
    { num: 1, title: 'Process', icon: Layers },
    { num: 2, title: 'Checkpoints', icon: CheckCircle2 },
    { num: 3, title: 'Upload Data', icon: UploadCloud },
    { num: 4, title: 'Analysis', icon: BarChart3 },
    { num: 5, title: 'Insights & NLG', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentStep(1)} 
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform">
                <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    AuditSphere
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    PlantIQ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Manufacturing Audit Analytics</p>
              </div>
            </button>
          </div>

          {/* Stepper Progress Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              
              return (
                <button
                  key={s.num}
                  onClick={() => {
                    if (s.num <= currentStep || (s.num === 2 && selectedProcess) || (s.num === 3 && selectedCheckpoints.length > 0)) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isPast
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                      : 'text-slate-400 hover:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive 
                      ? 'bg-white text-blue-600 font-bold' 
                      : isPast 
                      ? 'bg-emerald-600 text-white font-bold' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isPast ? '✓' : s.num}
                  </span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep === 5 && (
              <button
                onClick={onOpenSlide}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
                title="View formal executive audit presentation slide"
              >
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span>Audit Slide (PPT)</span>
              </button>
            )}

            <button
              onClick={onToggleChat}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isChatOpen
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 shadow-2xs'
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-blue-600" />
              <span>AuditSphere Chatbot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            <div className="h-5 w-[1px] bg-slate-200 mx-1"></div>

            {/* User Profile & Log Out */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                U
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-tight text-slate-800">User</p>
                <p className="text-[10px] text-slate-500 leading-tight">Enterprise Auditor</p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign out to Login Page"
                  className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px] font-medium">Log out</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
