import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Cpu, 
  FileCheck2,
  AlertCircle
} from 'lucide-react';

export default function Step4Analysis({ uploadedFiles, onComplete, onCancel }) {
  const [progress, setProgress] = useState(15);
  const [completedSteps, setCompletedSteps] = useState([0]);

  const tasks = [
    { 
      label: '1. Universal File Input (Excel • CSV • PDF • Word • JSON • XML • SQL • Images)', 
      desc: 'Ingesting multi-format data streams with format-specific binary and text reader engines' 
    },
    { 
      label: '2. File Detection & Format-Specific Parsers', 
      desc: 'Read all Excel sheets, extract tables, inspect schemas, detect encodings (OpenPyXL, Pandas, OCR)' 
    },
    { 
      label: '3. Unified Data Layer', 
      desc: 'Normalize columns, dates, machine IDs, data types and source references across plant equipment' 
    },
    { 
      label: '4. Data Quality & Validation', 
      desc: 'Missing values • Duplicate records • Invalid dates • Inconsistent IDs' 
    },
    { 
      label: '5. Analytics Engine', 
      desc: 'PM compliance • PM effectiveness • Reliability metrics • ML predictions (XGBoost & Isolation Forest)' 
    },
    { 
      label: '6. Excel Report Generator', 
      desc: 'Validated calculations, audit observations and recommendations compiled into formal assurance workbooks' 
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 14) + 6;
        return next > 100 ? 100 : next;
      });
    }, 350);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentStepIndex = Math.min(
      tasks.length - 1,
      Math.floor((progress / 100) * tasks.length)
    );

    const steps = [];
    for (let i = 0; i <= currentStepIndex; i++) {
      steps.push(i);
    }
    setCompletedSteps(steps);
  }, [progress]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 text-center">
      
      {/* Icon & Title */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-6 shadow-xs animate-pulse">
        <Cpu className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Analysing Maintenance Audit Data…
      </h1>
      <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
        Running <strong>2 Plant Maintenance checkpoints</strong> across {uploadedFiles.length} uploaded document(s): <span className="text-blue-700 font-medium">PM Compliance (%)</span> and <span className="text-blue-700 font-medium">PM Effectiveness</span>.
      </p>

      {/* Big Circular/Bar Progress Display */}
      <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
            Audit Pipeline Progress
          </span>
          <span className="text-lg font-mono font-extrabold text-blue-600">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-300 shadow-xs"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Task List */}
        <div className="mt-8 space-y-3 text-left">
          {tasks.map((task, idx) => {
            const isFinished = progress >= 100 || (completedSteps.includes(idx) && idx < completedSteps[completedSteps.length - 1]);
            const isCurrent = completedSteps[completedSteps.length - 1] === idx && progress < 100;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isFinished
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                    : isCurrent
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isFinished ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 text-xs font-medium">
                      {idx + 1}
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold leading-tight">{task.label}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{task.desc}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase">
                  {isFinished ? (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Done</span>
                  ) : isCurrent ? (
                    <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md animate-pulse">Running</span>
                  ) : (
                    <span className="text-slate-400">Queued</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          Cancel run
        </button>

        <button
          onClick={onComplete}
          disabled={progress < 100}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
            progress === 100
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-blue-500/20 scale-100 hover:scale-105'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          <span>View Insights</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
