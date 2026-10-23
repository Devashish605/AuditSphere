import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Upload, 
  Check, 
  Edit3, 
  Compass, 
  Monitor, 
  Cog 
} from 'lucide-react';
import { exportAuditPptx } from '../services/pptxExporter';
import { analyzeMaintenanceData } from '../services/maintenanceAnalytics';

export default function SlideReportModal({ 
  isOpen, 
  onClose,
  pptTemplate = { name: '', isCustom: false },
  onUploadTemplate,
  onRemoveTemplate,
  uploadedFiles = []
}) {
  const templateInputRef = useRef(null);
  const [templateNotice, setTemplateNotice] = useState('');
  const [isEditingResponse, setIsEditingResponse] = useState(false);

  // Synchronized dynamic analytics engine for uploaded files
  const analysis = useMemo(() => analyzeMaintenanceData(uploadedFiles), [uploadedFiles]);
  const m = analysis.metrics || {};
  const isLive = !!analysis.isLiveAnalyzed;

  const machineCount = (m.machinesAnalyzed !== null && m.machinesAnalyzed !== undefined && m.machinesAnalyzed !== 'NULL')
    ? Number(m.machinesAnalyzed).toLocaleString()
    : '597';
  
  const pmOrders = (analysis.pmRowsCount || 2156).toLocaleString();
  const bdCount = (analysis.bdRowsCount || 831).toLocaleString();
  const bdHours = (m.totalBreakdownHours !== null && m.totalBreakdownHours !== undefined && m.totalBreakdownHours !== 'NULL')
    ? String(m.totalBreakdownHours)
    : '11,948 hrs';
  
  const complianceRate = (m.complianceRate !== null && m.complianceRate !== undefined && m.complianceRate !== 'NULL')
    ? String(m.complianceRate)
    : '87.9%';
  
  const lowAdherenceCount = (m.lowAdherenceCount !== null && m.lowAdherenceCount !== undefined && m.lowAdherenceCount !== 'NULL')
    ? Number(m.lowAdherenceCount).toLocaleString()
    : '79';

  const outlierShop = m.topOutlierPlant?.name || 'CHETAK';

  // Dynamic evidence generation from top loss machines / worst combined cases
  let evidenceText = "GSP 35 (25%) – spindle failures 223.8 hrs; CG 22 (0%) – oil-seal failure twice, 49.1 hrs; CNC 14 (20%, PM 'Not Done – not released') – 129 hrs; SQF 05 furnace (2 PMs 'Not Done') – elevator 10.2 hrs; GHB 42 (0%) – late cleaning PM – connector-oiling fault 11.1 hrs.";
  const candidateMachines = (Array.isArray(analysis.worstCombinedCases) && analysis.worstCombinedCases.length > 0)
    ? analysis.worstCombinedCases
    : (Array.isArray(analysis.topLossMachines) ? analysis.topLossMachines : []);
  if (isLive && candidateMachines.length > 0) {
    const list = candidateMachines.slice(0, 5).map(mach => {
      const name = mach.name || mach.id;
      const adh = mach.adherence !== undefined 
        ? (String(mach.adherence).includes('%') ? mach.adherence : `${mach.adherence}%`) 
        : 'N/A';
      const hrs = mach.hours || mach.bdHours || 0;
      const reason = mach.failure_mode || mach.reason || mach.primaryReason || 'breakdown stoppage';
      return `${name} (${adh}) – ${reason} ${hrs} hrs`;
    });
    if (list.length > 0) evidenceText = list.join('; ') + '.';
  }

  // Top 5 machines concentration
  let top5Pct = '29';
  if (isLive && Array.isArray(analysis.topLossMachines) && analysis.topLossMachines.length > 0) {
    const totalSiteHrs = parseFloat(String(bdHours).replace(/[^0-9.]/g, '')) || 1;
    const top5Hrs = analysis.topLossMachines.slice(0, 5).reduce((acc, x) => acc + (x.hours || x.bdHours || 0), 0);
    if (totalSiteHrs > 0 && top5Hrs > 0) {
      top5Pct = String(Math.round((top5Hrs / totalSiteHrs) * 100));
    }
  }

  const [managementResponse, setManagementResponse] = useState(
    '1. Plant Head and Operations Manager agreed to establish a binding PM-Release SLA with production shift leads effective Nov 1, 2026.\n' +
    '2. Engineering team is updating the Grinder and Shaper PM check-sheets to mandate monthly vibration logs and quarterly oil-seal replacements.\n' +
    `3. Dedicated weekend maintenance sprint scheduled for ${outlierShop} plant to eliminate overdue backlog.\n` +
    'Target Implementation: Q4 FY26 | Owner: Head of Plant Operations'
  );

  const handleTemplateFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onUploadTemplate) {
        onUploadTemplate(file);
      }
      setTemplateNotice(`Template "${file.name}" loaded!`);
      setTimeout(() => setTemplateNotice(''), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Hidden template file input */}
        <input 
          type="file" 
          ref={templateInputRef} 
          accept=".pptx,.potx" 
          onChange={handleTemplateFileSelect} 
          className="hidden" 
        />

        {/* Modal Top Toolbar */}
        <div className="bg-white px-5 py-3 flex items-center justify-between border-b border-slate-200 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1B6488] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Plant Maintenance Audit Observation Slide
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#1B6488] border border-blue-200 font-mono font-bold">
                  Single Observation Page
                </span>
                {pptTemplate?.isCustom && (
                  <span className="text-[10px] pl-2 pr-1 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Template: {pptTemplate.name}</span>
                    {onRemoveTemplate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTemplate();
                          setTemplateNotice('Custom template removed');
                          setTimeout(() => setTemplateNotice(''), 3000);
                        }}
                        className="p-0.5 hover:bg-emerald-200/70 rounded-full text-emerald-800 transition-colors"
                        title="Remove custom template"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                1. Preventive Maintenance Program Design &amp; Execution Gaps Driving High-Impact Equipment Breakdowns
              </p>
            </div>
          </div>

          {/* Export & Print Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => templateInputRef.current?.click()}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                pptTemplate?.name
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
              }`}
              title="Upload custom corporate template"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>{pptTemplate?.name ? 'Change Template' : 'Upload Template'}</span>
            </button>

            <button
              onClick={() => exportAuditPptx(pptTemplate, [], analysis)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B6488] hover:bg-[#154f6c] text-white transition-colors flex items-center gap-1.5 shadow-xs"
              title="Download PowerPoint Slide (.pptx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PPT (.pptx)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
              title="Print Slide to PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {templateNotice && (
          <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              {templateNotice}
            </span>
            <button onClick={() => setTemplateNotice('')} className="underline text-[11px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          
          {/* THE 16:9 SLIDE CONTAINER */}
          <div className="bg-white border-2 border-slate-300 shadow-xl rounded-lg max-w-5xl w-full p-4 sm:p-6 text-slate-900 flex flex-col justify-between aspect-[16/9.4] min-h-[580px]">
            
            <div>
              {/* Slide Title */}
              <h1 className="text-sm sm:text-base md:text-[17px] font-black text-[#1B6488] tracking-tight uppercase leading-snug mb-3">
                1. PREVENTIVE MAINTENANCE PROGRAM DESIGN &amp; EXECUTION GAPS DRIVING HIGH-IMPACT EQUIPMENT BREAKDOWNS
              </h1>

              {/* Main Two-Column Structure */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                
                {/* Left Column (7 cols): Observation */}
                <div className="md:col-span-7 flex flex-col">
                  {/* Observation Header Bar */}
                  <div className="bg-[#2E7D9E] text-white px-3 py-1.5 rounded-t-sm flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">Observation</span>
                    
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 opacity-90">
                        <Compass className="w-3 h-3" />
                        <span>Design</span>
                      </span>
                      <span className="flex items-center gap-1 opacity-90">
                        <Monitor className="w-3 h-3" />
                        <span>System</span>
                      </span>
                      {/* Operational circled in white oval */}
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white font-bold bg-[#2E7D9E] shadow-2xs">
                        <Cog className="w-3 h-3" />
                        <span>Operational</span>
                      </span>
                    </div>

                    <div className="w-5 h-5 rounded-xs bg-[#C00000] text-white font-black text-xs flex items-center justify-center shrink-0 ml-1">
                      H
                    </div>
                  </div>

                  {/* Observation Content Box */}
                  <div className="border border-slate-300 border-t-0 p-3 bg-white text-[11px] text-slate-800 leading-relaxed space-y-2 flex-1 rounded-b-sm">
                    <p>
                      <strong>Background:</strong> The plant maintains ~{machineCount} machines across six shops under a monthly / quarterly / annual Preventive Maintenance (PM) program governed by machine-wise PM check-sheets. PM adherence and equipment breakdowns (BD) are logged separately. We analysed {pmOrders} PM line-items and {bdCount} breakdown events for FY'25-26 and correlated the low-adherence / high-impact machines against their PM check-sheets.
                    </p>

                    <div>
                      <strong>Observation:</strong>
                      <div className="space-y-1.5 mt-1">
                        <p>
                          <strong>1. Design gap – PM check sheet scope &amp; frequency not aligned to actual failure modes :</strong> Failure-precursor parameters are absent or scheduled too infrequently – spindle vibration/noise, belt and hydrostatic pressure on shapers/grinders are checked only Yearly / Half-yearly, and recurring failure modes are not codified at all (e.g., CG 22 has no spindle oil-seal checkpoint). The PM design therefore cannot detect the failures that drive most downtime.
                        </p>
                        <p>
                          <strong>2. Design gap – unreliable adherence monitoring &amp; escalation :</strong> The MIS 'Ageing Bucket' is inconsistent with the recorded delay (PMs 6+ days late tagged 'Before due date'), overstating adherence and masking low performers; no threshold or escalation exists for repeat 'Not Done' PMs.
                        </p>
                        <p>
                          <strong>3. Process gap – low adherence &amp; deferred PMs precede high-impact breakdowns (transactional evidence) :</strong> Against overall on-time adherence of {complianceRate}, {lowAdherenceCount} machines fall below 70% (&ge;2 PMs). Evidence: {evidenceText}
                        </p>
                        <p className="underline italic text-slate-900 pt-0.5">
                          Note : Downtime is concentrated – top 5 machines drive ~{top5Pct}% of ~{bdHours} BD hrs; fixing PM scope/frequency &amp; release discipline on ~10 critical machines removes most high-impact downtime (single event &gt; 6.45 hrs).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (5 cols): Recommendations & Action Plan */}
                <div className="md:col-span-5 flex flex-col">
                  {/* Recommendations Header Bar */}
                  <div className="bg-[#2E7D9E] text-white px-3 py-1.5 rounded-t-sm text-center">
                    <span className="font-bold text-xs uppercase tracking-wider">Recommendations</span>
                  </div>

                  {/* Recommendations Content Box */}
                  <div className="border border-slate-300 border-t-0 p-3 bg-white text-[11px] text-slate-800 leading-relaxed flex flex-col justify-between flex-1 rounded-b-sm">
                    <ul className="space-y-2 list-disc list-outside ml-3.5 mb-2">
                      <li>
                        <strong>Redesign PM check-sheets on an FMEA basis –</strong> add missing checkpoints (spindle oil-seal, connector integrity) and raise failure-precursor checks (spindle vibration/noise, belt, hydrostatic pressure) to monthly / quarterly condition-based tasks.
                      </li>
                      <li>
                        <strong>Correct the MIS ageing-bucket logic and set a hard adherence threshold</strong> with auto-escalation for repeat "Not Done" / &gt;10-day-late PMs.
                      </li>
                      <li>
                        <strong>Institute a PM-release SLA with production sign-off;</strong> protect bottleneck &amp; critical assets.
                      </li>
                    </ul>

                    {/* Management Response Sub-Banner */}
                    <div>
                      <div className="bg-[#2E7D9E] text-white py-1 px-2 text-center text-[10px] font-bold uppercase tracking-wider rounded-xs mb-1.5 flex items-center justify-between">
                        <span className="w-4"></span>
                        <span>Management Response / Action Plan</span>
                        <button
                          onClick={() => setIsEditingResponse(!isEditingResponse)}
                          className="text-[9px] hover:underline text-blue-100 flex items-center gap-0.5"
                          title="Edit response"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {isEditingResponse ? (
                        <textarea
                          value={managementResponse}
                          onChange={(e) => setManagementResponse(e.target.value)}
                          className="w-full text-[10.5px] p-1.5 border border-blue-400 rounded-sm bg-white text-slate-800 focus:outline-none"
                          rows={4}
                        />
                      ) : (
                        <div className="text-[10px] text-slate-600 leading-snug whitespace-pre-line bg-slate-50/60 p-1.5 rounded-xs border border-slate-200">
                          {managementResponse}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom 4 Parameter Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 mb-3">
                
                {/* 1. Root Cause */}
                <div className="md:col-span-4 flex flex-col">
                  <div className="bg-[#2E7D9E] text-white py-1 px-2 text-center text-[10px] font-bold uppercase rounded-t-xs">
                    Root Cause
                  </div>
                  <div className="border border-slate-300 border-t-0 p-2 text-[10px] text-slate-700 leading-tight flex-1 rounded-b-xs bg-white">
                    • PM check-sheets designed generically rather than derived from machine-specific failure modes (FMEA); failure-precursor checks are under-frequent or absent. No governance to enforce PM release / completion (deferrals &amp; 'Not Done' accepted without escalation); adherence reporting unreliable due to mislabeled ageing buckets.
                  </div>
                </div>

                {/* 2. Risk / Potential Impact */}
                <div className="md:col-span-4 flex flex-col">
                  <div className="bg-[#2E7D9E] text-white py-1 px-2 text-center text-[10px] font-bold uppercase rounded-t-xs">
                    Risk / Potential Impact
                  </div>
                  <div className="border border-slate-300 border-t-0 p-2 text-[10px] text-slate-700 leading-tight space-y-1 flex-1 rounded-b-xs bg-white">
                    <p>• Recurring high-impact breakdowns &amp; extended unplanned downtime (~{bdHours} BD hrs, FY'25-26)</p>
                    <p>• Higher maintenance cost &amp; longer MTTR</p>
                    <p>• Furnace batch-quality &amp; safety exposure</p>
                  </div>
                </div>

                {/* 3. Responsibility and Target Date */}
                <div className="md:col-span-2 flex flex-col">
                  <div className="bg-[#2E7D9E] text-white py-1 px-2 text-center text-[10px] font-bold uppercase rounded-t-xs">
                    Responsibility and Target Date
                  </div>
                  <div className="border border-slate-300 border-t-0 p-2 text-[10px] text-slate-700 leading-tight space-y-1 flex-1 rounded-b-xs bg-white">
                    <p><strong>Responsibility –</strong> Plant Operations Head &amp; Maintenance Lead</p>
                    <p><strong>Timeline –</strong> Q4 FY 2025–26</p>
                  </div>
                </div>

                {/* 4. Annexures */}
                <div className="md:col-span-2 flex flex-col">
                  <div className="bg-[#2E7D9E] text-white py-1 px-2 text-center text-[10px] font-bold uppercase rounded-t-xs">
                    Annexures
                  </div>
                  <div className="border border-slate-300 border-t-0 p-2 text-[10px] text-slate-700 leading-tight space-y-0.5 flex-1 rounded-b-xs bg-white">
                    <p className="font-semibold text-slate-800">Attachments if any</p>
                    <p>• PM Check-sheet Gap Analysis</p>
                    <p>• Machine Breakdown Pareto Register</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Slide Footer */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-mono font-bold text-slate-700">1</span>
              
              <div className="text-center text-[9px] leading-tight">
                <p>© 2025-Protiviti India Member Private Limited. - Confidential</p>
                <p>This document is for your organization's internal use only and should not be copied or distributed to any third party.</p>
              </div>

              <span className="font-bold text-sm tracking-tight text-slate-700 font-sans">
                protiviti
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
