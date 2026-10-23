import React from 'react';
import { 
  Wrench, 
  CalendarClock, 
  Factory, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { PROCESSES } from '../data/auditData';

const ICON_MAP = {
  Wrench: Wrench,
  CalendarClock: CalendarClock,
  Factory: Factory,
  ShieldCheck: ShieldCheck,
};

export default function Step1Process({ selectedProcess, setSelectedProcess, onContinue }) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header section */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Step 1 of 5 • Audit Process Scope</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Manufacturing Audit Process
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Choose a manufacturing domain to audit. Currently configured with <span className="text-blue-600 font-semibold">Plant Maintenance</span> analytics; other processes are reserved for upcoming audit phases.
          </p>
        </div>

        <button
          onClick={onContinue}
          disabled={!selectedProcess}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
            selectedProcess
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 scale-100 hover:scale-[1.02]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          <span>Continue to Checkpoints</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Process Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PROCESSES.map((proc) => {
          const Icon = ICON_MAP[proc.icon] || Wrench;
          const isSelected = selectedProcess === proc.id;
          const isConfigured = proc.active;

          return (
            <div
              key={proc.id}
              onClick={() => {
                if (isConfigured) {
                  setSelectedProcess(proc.id);
                }
              }}
              className={`relative rounded-2xl p-6 transition-all border text-left cursor-pointer group ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : isConfigured
                  ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-75 cursor-not-allowed'
              }`}
            >
              {/* Status Pill */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-600 font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {proc.code}
                </span>

                {isConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>2 Checkpoints Configured</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                    <Lock className="w-3 h-3" />
                    <span>(0 Checkpoints)</span>
                  </span>
                )}
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : isConfigured
                    ? 'bg-slate-100 border-slate-200 text-slate-700 group-hover:text-blue-600 group-hover:border-blue-300'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-bold transition-colors ${
                    isSelected ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-700'
                  }`}>
                    {proc.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {proc.description}
                  </p>
                </div>
              </div>

              {/* Bottom selection indicator */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                {isConfigured ? (
                  <>
                    <span className="text-slate-500 font-medium">
                      Includes: <span className="text-slate-800 font-semibold">PM Compliance (%) & PM Effectiveness</span>
                    </span>
                    <span className={`font-bold transition-colors flex items-center gap-1 ${
                      isSelected ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                    }`}>
                      {isSelected ? 'Selected' : 'Select Process'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between text-slate-400 italic">
                    <span>Process pipeline currently empty</span>
                    <span className="text-[11px] font-mono not-italic px-1.5 py-0.5 rounded bg-slate-100">Sprint 2</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Informative banner */}
      <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <p>
          Per audit directive, only <strong className="text-blue-950 font-bold">Plant Maintenance</strong> is activated with exactly 2 checkpoints: <strong className="text-blue-950 font-bold">PM Compliance (%)</strong> and <strong className="text-blue-950 font-bold">PM Effectiveness</strong>. Remaining manufacturing processes are kept clean and empty.
        </p>
      </div>

    </div>
  );
}
