import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  FileSpreadsheet, 
  Sparkles,
  CheckCheck,
  FileCheck
} from 'lucide-react';
import { MAINTENANCE_CHECKPOINTS } from '../data/auditData';

export default function Step2Checkpoints({ 
  selectedCheckpoints, 
  setSelectedCheckpoints, 
  onBack, 
  onContinue 
}) {
  const allSelected = selectedCheckpoints.length === MAINTENANCE_CHECKPOINTS.length;

  const toggleCheckpoint = (id) => {
    if (selectedCheckpoints.includes(id)) {
      setSelectedCheckpoints(selectedCheckpoints.filter((item) => item !== id));
    } else {
      setSelectedCheckpoints([...selectedCheckpoints, id]);
    }
  };

  const selectAll = () => {
    setSelectedCheckpoints(MAINTENANCE_CHECKPOINTS.map((c) => c.id));
  };

  const clearAll = () => {
    setSelectedCheckpoints([]);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Step Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Step 2 of 5 • Scope Selection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Plant Maintenance Checkpoints</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              2 Active Checkpoints
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Selected audit domain: <strong className="text-slate-900">Plant Maintenance</strong>. Review and select the 2 active checkpoints to run automated analysis on your uploaded data.
          </p>
        </div>

        {/* Quick bulk actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={allSelected ? clearAll : selectAll}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{allSelected ? 'Deselect All' : 'Select Both Checkpoints'}</span>
          </button>
        </div>
      </div>

      {/* Checkpoints Grid */}
      <div className="space-y-6 mb-8">
        {MAINTENANCE_CHECKPOINTS.map((cp) => {
          const isSelected = selectedCheckpoints.includes(cp.id);

          return (
            <div
              key={cp.id}
              className={`rounded-2xl p-6 transition-all border text-left relative ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs'
              }`}
            >
              {/* Header Row */}
              <div 
                className="flex items-start justify-between gap-4 mb-4 cursor-pointer"
                onClick={() => toggleCheckpoint(cp.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-1 rounded-full transition-colors ${
                    isSelected ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {isSelected ? (
                      <CheckCircle2 className="w-6 h-6 fill-blue-100 text-blue-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {cp.name}
                      </h3>
                      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {cp.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{cp.riskTested}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                    isSelected ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isSelected ? '✓ Selected' : 'Click to select'}
                  </span>
                </div>
              </div>

              {/* Exact Required Input Data Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-[11px] mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Input Data:</span>
                </div>
                <div className="font-mono text-slate-800 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed shadow-2xs">
                  {cp.inputData}
                </div>
              </div>

              {/* Exact Analytical Method */}
              <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>Analytical Methodology:</span>
                </div>
                <p className="font-semibold text-blue-900 leading-snug">
                  {cp.methodology}
                </p>
              </div>

              {/* Expected Excel Workbook Tabs */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivered Excel Workbook Tabs:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cp.excelTabs.map((tab, tIdx) => (
                    <span 
                      key={tIdx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quality & Calculation Rule Note */}
              <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-xl">
                  <strong className="text-slate-700">Rule: </strong> {cp.calculationRule}
                </span>
                <span className={`font-semibold shrink-0 ml-2 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                  {isSelected ? 'Included in Run' : 'Excluded'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Process</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            <strong className="text-slate-900">{selectedCheckpoints.length}</strong> of 2 selected
          </span>

          <button
            onClick={onContinue}
            disabled={selectedCheckpoints.length === 0}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              selectedCheckpoints.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 scale-100 hover:scale-[1.02]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <span>Continue to Upload Data</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
