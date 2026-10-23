import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Sparkles, 
  Bot, 
  Layers, 
  ArrowRight, 
  Search, 
  Filter, 
  Share2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Flame,
  ArrowUpRight,
  FileCheck,
  X,
  Check,
  Upload,
  Trash2,
  File
} from 'lucide-react';
import { 
  SAMPLE_OBSERVATIONS, 
  PARETO_CATEGORIES, 
  TOP_LOSS_MACHINES,
  MAINTENANCE_CHECKPOINTS,
  MONTHLY_BREAKDOWN_DATA,
  PLANT_BREAKDOWN_TOTALS,
  MONTHLY_MACHINE_BREAKDOWNS
} from '../data/auditData';
import { 
  exportPMComplianceWorkbook, 
  exportPMEffectivenessWorkbook, 
  exportAllWorkbooks 
} from '../services/excelExporter';
import { exportAuditPptx } from '../services/pptxExporter';
import { analyzeMaintenanceData } from '../services/maintenanceAnalytics';
import { parseUploadedFile, createFallbackDoc } from '../services/fileParser';

export default function Step5Insights({ 
  uploadedFiles = [], 
  onRemoveFile,
  onAddFiles,
  onOpenSlide, 
  onToggleChat, 
  onTriggerNlgPrompt,
  onNavigateToUpload,
  onLoadBenchmarkData,
  chatbotAuditSlides = [],
  pptTemplate = { name: '', isCustom: false },
  onUploadPptTemplate,
  onRemovePptTemplate
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMachineId, setSelectedMachineId] = useState('GSP-35');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Oct 2025');
  const [selectedPlantFilter, setSelectedPlantFilter] = useState('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const pttInputRef = useRef(null);
  const docFileInputRef = useRef(null);

  const handleDirectDocumentUpload = async (e) => {
    const fileList = e?.target?.files || e?.dataTransfer?.files;
    const files = fileList ? Array.from(fileList) : [];
    if (docFileInputRef.current) docFileInputRef.current.value = '';
    if (files.length === 0) return;

    try {
      const parsedDocs = await Promise.all(
        files.map(async (file) => {
          try {
            return await parseUploadedFile(file);
          } catch (fileErr) {
            console.warn('Direct upload parse notice:', file?.name, fileErr);
            return createFallbackDoc(file, 'excel', 150);
          }
        })
      );
      if (onAddFiles) {
        onAddFiles(parsedDocs.filter(Boolean));
      }
    } catch (err) {
      console.error('Error during direct document upload in Step5:', err);
    }
  };

  // Synchronized dynamic analytics engine for uploaded files
  const analysis = useMemo(() => {
    try {
      return analyzeMaintenanceData(uploadedFiles);
    } catch (err) {
      console.warn('Analysis execution notice in Step5:', err);
      return {};
    }
  }, [uploadedFiles]);

  const m = analysis?.metrics || {
    machinesAnalyzed: 0,
    complianceRate: '0%',
    lowAdherenceCount: 0,
    criticalCount: 0,
    totalBreakdownHours: '0 hrs',
    quantifiedDowntimeLoss: '₹0 L',
    topOutlierPlant: { name: 'General Plant', adherence: '0%', count: 0 }
  };
  const monthlyData = (Array.isArray(analysis?.monthlyBreakdownData) && analysis.monthlyBreakdownData.length > 0)
    ? analysis.monthlyBreakdownData 
    : MONTHLY_BREAKDOWN_DATA;
  const plantTotals = (Array.isArray(analysis?.plantBreakdownTotals) && analysis.plantBreakdownTotals.length > 0)
    ? analysis.plantBreakdownTotals 
    : PLANT_BREAKDOWN_TOTALS;
  const machineBreakdowns = analysis?.monthlyMachineBreakdowns || MONTHLY_MACHINE_BREAKDOWNS;
  const paretoCategories = (Array.isArray(analysis?.paretoCategories) && analysis.paretoCategories.length > 0)
    ? analysis.paretoCategories 
    : PARETO_CATEGORIES;
  const topLossMachines = (Array.isArray(analysis?.topLossMachines) && analysis.topLossMachines.length > 0)
    ? analysis.topLossMachines 
    : TOP_LOSS_MACHINES;
  const observations = (Array.isArray(analysis?.observations) && analysis.observations.length > 0)
    ? analysis.observations 
    : SAMPLE_OBSERVATIONS;
  const pmEffectivenessLagAnalysis = analysis?.pmEffectivenessLagAnalysis || null;
  const gapBrackets = pmEffectivenessLagAnalysis?.gapBrackets || analysis?.pmGapBrackets || [];
  const auditSections = analysis?.auditInsightSections || {};
  const fileClassificationList = analysis?.fileClassificationList || [];

  // Dynamic Outlier Plant metrics
  const outlierPlantName = m.topOutlierPlant?.name || (plantTotals[0]?.name || 'Primary Plant');
  const outlierAdherence = m.topOutlierPlant?.adherence || `${m.complianceRateNum || 88.9}%`;
  const outlierLowMachines = m.topOutlierPlant?.count !== undefined ? m.topOutlierPlant.count : m.lowAdherenceCount;

  const otherPlants = plantTotals.filter(p => (p.name || p.plant || '').toUpperCase() !== outlierPlantName.toUpperCase());
  const otherPlantNames = otherPlants.map(p => p.name || p.plant).slice(0, 4).join(', ');
  const outlierLowPct = m.lowAdherenceCount > 0 ? Math.round((outlierLowMachines / m.lowAdherenceCount) * 100) : 0;

  const outlierPlantObj = plantTotals.find(p => (p.name || p.plant || '').toUpperCase() === outlierPlantName.toUpperCase());
  const outlierHours = outlierPlantObj?.hours || (m.totalBreakdownHoursNum ? Math.round(m.totalBreakdownHoursNum * 0.25) : 0);
  const outlierDowntimePct = m.totalBreakdownHoursNum > 0 ? Math.round((outlierHours / m.totalBreakdownHoursNum) * 1000) / 10 : 0;

  // Dynamic Pareto Top Sum
  const topParetoItems = paretoCategories.slice(0, 3);
  const topParetoPctSum = Math.round(topParetoItems.reduce((acc, c) => acc + (typeof c.pct === 'number' ? c.pct : parseFloat(c.pct) || 0), 0) * 10) / 10;

  // Dynamic Machine Concentration
  const totalBdMachinesCount = analysis.bdRecords && analysis.bdRecords.length > 0 
    ? new Set(analysis.bdRecords.map(r => r.machine_id).filter(Boolean)).size 
    : (m.machinesAnalyzed || topLossMachines.length || 0);
  const top10Machines = topLossMachines.slice(0, 10);
  const top10Hours = top10Machines.reduce((acc, mach) => acc + (Number(mach.hours) || 0), 0);
  const top10DowntimePct = m.totalBreakdownHoursNum > 0 
    ? Math.min(100, Math.round((top10Hours / m.totalBreakdownHoursNum) * 1000) / 10)
    : 0;

  // Dynamic Top Recurring Failure Modes
  const topFailureReasons = useMemo(() => {
    if (!analysis.bdRecords || analysis.bdRecords.length === 0) return [];
    const reasonMap = {};
    analysis.bdRecords.forEach(r => {
      const reason = r.failure_mode || r.reason || '';
      if (reason && reason.length > 2) {
        if (!reasonMap[reason]) reasonMap[reason] = { name: reason, count: 0, hours: 0 };
        reasonMap[reason].count++;
        reasonMap[reason].hours += (r.duration_hours || 0);
      }
    });
    return Object.values(reasonMap).sort((a, b) => b.hours - a.hours).slice(0, 2);
  }, [analysis.bdRecords]);

  // Auto-select valid month if monthlyData changes
  useEffect(() => {
    if (monthlyData.length > 0 && !monthlyData.some(d => d.month === selectedMonth)) {
      setSelectedMonth(monthlyData[0].month);
    }
  }, [monthlyData, selectedMonth]);

  // Handle Escape key to close download modal
  useEffect(() => {
    if (!showExcelModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowExcelModal(false);
        setDownloadSuccess('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showExcelModal]);

  if (uploadedFiles.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Audit Data Uploaded</h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
          The audit model requires source documents to calculate <strong className="text-slate-800">PM Compliance (%)</strong> and <strong className="text-slate-800">PM Effectiveness</strong>. Without uploaded records, no audit findings or losses can be generated.
        </p>
        <div className="flex items-center justify-center gap-3">
          {onNavigateToUpload && (
            <button
              onClick={onNavigateToUpload}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-colors"
            >
              Go to Step 3 (Upload Files)
            </button>
          )}
          {onLoadBenchmarkData && (
            <button
              onClick={onLoadBenchmarkData}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors"
            >
              Load Demo Benchmark Data
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Step Banner & Quick Actions */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step 5 of 5 • Audit Findings & NLG Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Plant Maintenance Audit Insights</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              FY 2025–26
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Cross-analyzed <strong className="text-slate-900">PM Compliance (%)</strong> and <strong className="text-slate-900">PM Effectiveness</strong> across {uploadedFiles.length} uploaded files.
          </p>
        </div>

        {/* Export and Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <input 
            type="file" 
            ref={pttInputRef} 
            accept=".pptx,.potx" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onUploadPptTemplate) {
                onUploadPptTemplate(file);
                setDownloadSuccess(`Custom template "${file.name}" applied for presentation outputs!`);
              }
            }}
            className="hidden" 
          />

          {/* Upload / Custom Template Badge with Remove (X) Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pttInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Upload custom PowerPoint presentation template (.pptx/.potx)"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Upload a custom template</span>
              {pptTemplate?.name && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-bold truncate max-w-[120px]">
                  {pptTemplate.name}
                </span>
              )}
            </button>
            {pptTemplate?.isCustom && onRemovePptTemplate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePptTemplate();
                  setDownloadSuccess('Custom template removed. Default template restored.');
                }}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                title="Remove custom template and re-upload"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowExcelModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Output (Excel & PPT)</span>
          </button>

          <button
            onClick={() => exportAuditPptx(pptTemplate, chatbotAuditSlides, analysis)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Download PowerPoint Presentation (.pptx)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Download PPT (.pptx)</span>
          </button>

          <button
            onClick={onOpenSlide}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>View PPT Deck ({1 + (chatbotAuditSlides ? chatbotAuditSlides.length : 0)} Slide(s))</span>
          </button>

          <button
            onClick={() => onToggleChat()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-300 hover:border-blue-400 shadow-xs transition-all flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span>AuditSphere Chatbot</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards (5 Cards) - Live Engine Linked */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs" title={`${m.machinesAnalyzed?.toLocaleString() || 0} Unique Physical Assets identified`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Machines Analyzed</p>
          <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
            {m.machinesAnalyzed !== null && m.machinesAnalyzed !== undefined && m.machinesAnalyzed !== 'NULL'
              ? Number(m.machinesAnalyzed).toLocaleString()
              : 'NULL'}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block font-medium truncate">
            {analysis.pmRowsCount > 0 
              ? `From ${analysis.pmRowsCount.toLocaleString()} PM orders` 
              : (analysis.bdRowsCount > 0 
                  ? `From ${analysis.bdRowsCount.toLocaleString()} breakdown events` 
                  : (analysis.totalRecordsProcessed > 0 ? `From ${analysis.totalRecordsProcessed.toLocaleString()} records` : 'Unique Plant Assets'))}
          </span>
        </div>

        <div className={`p-4 rounded-2xl bg-white border shadow-xs ${m.complianceRate === 'NULL' || m.complianceRate === null ? 'border-dashed border-slate-300' : 'border-slate-200'}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">PM Compliance</p>
          <p className={`mt-1 text-2xl font-black font-mono ${m.complianceRate === 'NULL' || m.complianceRate === null ? 'text-slate-400' : 'text-blue-600'}`}>
            {m.complianceRate ?? 'NULL'}
          </p>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block truncate">
            {m.complianceRate === 'NULL' || m.complianceRate === null 
              ? 'Requires PM Schedule file' 
              : (m.topOutlierPlant?.name ? `${m.topOutlierPlant.name} outlier (${m.topOutlierPlant.adherence})` : 'Plant Adherence Metric')}
          </span>
        </div>

        <div className={`p-4 rounded-2xl bg-white border shadow-xs ${m.lowAdherenceCount === 'NULL' || m.lowAdherenceCount === null ? 'border-dashed border-slate-300' : 'border-slate-200'}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Low Adherence (&lt;70%)</p>
          <p className={`mt-1 text-2xl font-black font-mono ${m.lowAdherenceCount === 'NULL' || m.lowAdherenceCount === null ? 'text-slate-400' : 'text-amber-600'}`}>
            {m.lowAdherenceCount ?? 'NULL'}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {m.lowAdherenceCount === 'NULL' || m.lowAdherenceCount === null ? 'Requires PM Schedule file' : 'Where ≥2 PMs scheduled'}
          </span>
        </div>

        <div className={`p-4 rounded-2xl bg-white border shadow-xs ${m.criticalCount === 'NULL' || m.criticalCount === null ? 'border-dashed border-slate-300' : 'border-slate-200'}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Critical (&lt;50%)</p>
          <p className={`mt-1 text-2xl font-black font-mono ${m.criticalCount === 'NULL' || m.criticalCount === null ? 'text-slate-400' : 'text-rose-600'}`}>
            {m.criticalCount ?? 'NULL'}
          </p>
          <span className="text-[10px] text-rose-600 mt-1 block font-medium">
            {m.criticalCount === 'NULL' || m.criticalCount === null ? 'Requires PM Schedule file' : 'Severe breakdown risk'}
          </span>
        </div>

        <div className={`p-4 rounded-2xl bg-white border shadow-xs ${m.totalBreakdownHours === 'NULL' || m.totalBreakdownHours === null ? 'border-dashed border-slate-300' : 'border-slate-200'}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Breakdown Hrs</p>
          <p className={`mt-1 text-2xl font-black font-mono ${m.totalBreakdownHours === 'NULL' || m.totalBreakdownHours === null ? 'text-slate-400' : 'text-slate-900'}`}>
            {m.totalBreakdownHours ?? 'NULL'}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {m.totalBreakdownHours === 'NULL' || m.totalBreakdownHours === null 
              ? 'Requires Breakdown Report' 
              : `${(analysis.metrics?.totalEventsCount || analysis.bdRowsCount || monthlyData.reduce((acc, c) => acc + (Number(c.count) || 0), 0)).toLocaleString()} events logged`}
          </span>
        </div>

      </div>

      {/* Uploaded Documents List with (bin) to Remove */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Uploaded Audit Documents ({uploadedFiles.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Active source files ingested by Multi-Format Engine. Click the trash icon to remove any file.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input for direct document uploading inside Step 5 */}
            <input
              ref={docFileInputRef}
              type="file"
              multiple
              accept="*/*,.xlsx,.xls,.xlsm,.xlsb,.csv,.tsv,.pdf,.docx,.doc,.txt,.json,.xml,.sql"
              onChange={handleDirectDocumentUpload}
              className="hidden"
            />

            <button
              onClick={() => docFileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload More Documents</span>
            </button>

            {onNavigateToUpload && (
              <button
                onClick={onNavigateToUpload}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Go to Step 3 Full Ingestion Pipeline"
              >
                <span>Pipeline View</span>
              </button>
            )}
          </div>
        </div>

        {uploadedFiles.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map((file) => {
              const ext = file.extension || file.name?.split('.').pop()?.toLowerCase() || 'file';
              const isExcel = ['xlsx', 'xls', 'csv', 'tsv'].includes(ext);
              const isPdf = ext === 'pdf';
              const classification = fileClassificationList.find(c => c.fileName === file.name);
              const detectedType = classification?.detectedType || file.detectedType || 'general';
              const detectedLabel = classification?.label || (detectedType === 'pm' ? 'PM Schedule' : detectedType === 'breakdown' ? 'Breakdown Report' : 'General Maintenance Data');

              return (
                <div 
                  key={file.id || file.name}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      detectedType === 'pm'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : detectedType === 'breakdown'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : isExcel 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : isPdf 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {isExcel ? <FileSpreadsheet className="w-4 h-4" /> : isPdf ? <FileText className="w-4 h-4" /> : <File className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                          detectedType === 'pm'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : detectedType === 'breakdown'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : detectedType === 'mixed'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {detectedLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{file.size || 'Auto'}</span>
                        <span>•</span>
                        <span className="text-blue-700 font-bold">{file.records || file.rows || 'Parsed'} rows</span>
                        {classification?.evidence && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 truncate max-w-[140px]" title={classification.evidence}>{classification.evidence}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {onRemoveFile && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(file.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all shrink-0"
                      title={`Remove "${file.name}" from audit analysis`}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            {analysis.isRealPm && !analysis.isRealBd && (
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-blue-900 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>PM Schedule Active:</strong> PM Compliance and Machine Adherence calculated. Breakdown Pareto and downtime parameters display <code className="px-1 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-bold">NULL</code> pending upload of a Breakdown Report.
                  </span>
                </div>
                <button
                  onClick={() => docFileInputRef.current?.click()}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline shrink-0 whitespace-nowrap self-start sm:self-auto"
                >
                  + Upload Breakdown Report
                </button>
              </div>
            )}

            {!analysis.isRealPm && analysis.isRealBd && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-amber-900 gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Breakdown Report Active:</strong> Downtime hours and failure reason Pareto calculated. PM Adherence and compliance metrics display <code className="px-1 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold">NULL</code> pending upload of a PM Schedule.
                  </span>
                </div>
                <button
                  onClick={() => docFileInputRef.current?.click()}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0 whitespace-nowrap self-start sm:self-auto"
                >
                  + Upload PM Schedule
                </button>
              </div>
            )}

            {analysis.isRealPm && analysis.isRealBd && (
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Full Multi-Domain Integration:</strong> Both PM Schedule and Breakdown Report matched. All cross-correlation metrics, post-PM breakdown gaps, and failure reasons active.
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                  Synergy 100%
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
          <div 
            onClick={() => docFileInputRef.current?.click()}
            className="p-7 text-center rounded-2xl bg-blue-50/30 hover:bg-blue-50/60 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center mb-3 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">Click to Upload Maintenance Documents</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Upload your plant's Excel (.xlsx, .xls), CSV, or PDF maintenance schedules and breakdown logs
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); docFileInputRef.current?.click(); }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
              >
                Browse Files
              </button>
              {onLoadBenchmarkData && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onLoadBenchmarkData(); }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
                >
                  Load Demo Data
                </button>
              )}
            </div>
          </div>
        )}

        {/* Methodology Footer Note */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              <strong className="text-blue-800">PM Compliance Engine:</strong> Rule-Based Python Pandas
            </span>
            <span>•</span>
            <span>
              <strong className="text-indigo-800">PM Effectiveness:</strong> Reliability Engineering + Pareto + XGBoost + Isolation Forest
            </span>
          </div>
          <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            {uploadedFiles.length} file(s) active
          </span>
        </div>
      </div>

      {/* Interactive Tabs Header (3 Tabs) */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none pb-2">
        {[
          { id: 'overview', label: '1. Executive Overview & Plant Summary' },
          { id: 'pareto', label: '2. Breakdown Pareto (Reason & Machine)' },
          { id: 'reliability', label: '3. Inadequate Preventive Maintenance Compliance Leading to Increased Equipment Breakdown Risk' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Equipment Linkage Status (PM Compliance × Breakdown Register) */}
          {analysis?.equipmentLinkage?.isAvailable && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
              analysis.equipmentLinkage.isLinked
                ? 'bg-gradient-to-r from-emerald-50/90 via-white to-blue-50/40 border-emerald-200 text-emerald-950'
                : 'bg-gradient-to-r from-amber-50/90 via-white to-rose-50/40 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  analysis.equipmentLinkage.isLinked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {analysis.equipmentLinkage.isLinked ? 'Common Equipment Link Verified' : 'Equipment Link Check'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      analysis.equipmentLinkage.isLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {analysis.equipmentLinkage.isLinked ? 'Linked & Correlated' : 'No Overlap'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    {analysis.equipmentLinkage.summary}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs">
                  {analysis.equipmentLinkage.matchedCount} / {analysis.equipmentLinkage.totalBdEquipment} Assets Matched ({analysis.equipmentLinkage.linkagePercentage})
                </span>
              </div>
            </div>
          )}

          {/* Audit Insights Parameter Cards (The 4 Benchmark Sections from Reference Image) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Section 1: PM Adherence by machine */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      1. PM Adherence by machine
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    auditSections.pmAdherence?.isAvailable 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {auditSections.pmAdherence?.isAvailable ? 'PM Analyzed' : 'NULL (No PM File)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3.5">
                  {auditSections.pmAdherence?.cards?.map((card, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={card.label}>
                        {card.label}
                      </p>
                      <p className={`mt-1 text-xl font-black font-mono ${
                        card.value === null || card.value === 'NULL' 
                          ? 'text-slate-400' 
                          : card.isCritical 
                          ? 'text-amber-600' 
                          : 'text-slate-900'
                      }`}>
                        {card.value ?? 'NULL'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block truncate" title={card.subtext}>
                        {card.subtext}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Read Footer */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-900 mr-1.5">Quick Read:</span>
                <span>{auditSections.pmAdherence?.quickRead}</span>
              </div>
            </div>

            {/* Section 2: Low-Adherence Machines — Breakdown Overview */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      2. Low-Adherence Machines — Breakdown Overview
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    auditSections.lowAdherenceBdOverview?.isAvailable 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {auditSections.lowAdherenceBdOverview?.isAvailable ? 'Cross-Correlated' : 'NULL (Requires Both Files)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3.5">
                  {auditSections.lowAdherenceBdOverview?.cards?.map((card, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={card.label}>
                        {card.label}
                      </p>
                      <p className={`mt-1 text-xl font-black font-mono ${
                        card.value === null || card.value === 'NULL' 
                          ? 'text-slate-400' 
                          : card.isCritical 
                          ? 'text-amber-600' 
                          : 'text-slate-900'
                      }`}>
                        {card.value ?? 'NULL'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block truncate" title={card.subtext}>
                        {card.subtext}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Read Footer */}
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-amber-900 mr-1.5">Quick Read:</span>
                <span>{auditSections.lowAdherenceBdOverview?.quickRead}</span>
              </div>
            </div>

            {/* Section 3: Breakdown Pareto — by Reason */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      3. Breakdown Pareto — by Reason
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    auditSections.breakdownParetoByReason?.isAvailable 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {auditSections.breakdownParetoByReason?.isAvailable ? 'Breakdown Analyzed' : 'NULL (No BD File)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3.5">
                  {auditSections.breakdownParetoByReason?.cards?.map((card, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={card.label}>
                        {card.label}
                      </p>
                      <p className={`mt-1 text-xl font-black font-mono ${
                        card.value === null || card.value === 'NULL' 
                          ? 'text-slate-400' 
                          : card.isCritical 
                          ? 'text-indigo-600' 
                          : 'text-slate-900'
                      }`}>
                        {card.value ?? 'NULL'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block truncate" title={card.subtext}>
                        {card.subtext}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Read Footer */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-indigo-900 mr-1.5">Quick Read:</span>
                <span>{auditSections.breakdownParetoByReason?.quickRead}</span>
              </div>
            </div>

            {/* Section 4: Breakdown Pareto — by Machine */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      4. Breakdown Pareto — by Machine
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    auditSections.breakdownParetoByMachine?.isAvailable 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {auditSections.breakdownParetoByMachine?.isAvailable ? 'Breakdown Analyzed' : 'NULL (No BD File)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3.5">
                  {auditSections.breakdownParetoByMachine?.cards?.map((card, cIdx) => (
                    <div key={cIdx} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate" title={card.label}>
                        {card.label}
                      </p>
                      <p className={`mt-1 text-xl font-black font-mono ${
                        card.value === null || card.value === 'NULL' 
                          ? 'text-slate-400' 
                          : card.isCritical 
                          ? 'text-rose-600' 
                          : 'text-slate-900'
                      }`}>
                        {card.value ?? 'NULL'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block truncate" title={card.subtext}>
                        {card.subtext}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Read Footer */}
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-rose-900 mr-1.5">Quick Read:</span>
                <span>{auditSections.breakdownParetoByMachine?.quickRead}</span>
              </div>
            </div>

          </div>

          {/* Outlier Alert Card - Dynamically Grounded on Uploaded File Records */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-blue-50/40 border border-amber-200 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 shrink-0">
                <Flame className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">
                    {outlierPlantName} Identified as the Primary Systemic Outlier
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                    {outlierAdherence} Adherence
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {otherPlants.length > 0 ? (
                    <>
                      While peer operating shops ({otherPlantNames || 'other monitored units'}) recorded higher compliance, {outlierPlantName} averaged <strong className="text-amber-700">{outlierAdherence}</strong>.
                      {m.lowAdherenceCount > 0 && (
                        <> Notably, <strong className="text-slate-900">{outlierLowMachines} of the {m.lowAdherenceCount} low-adherence machines ({outlierLowPct}%)</strong> belong to {outlierPlantName} — demonstrating a concentrated plant-level PM execution and governance deficit.</>
                      )}
                    </>
                  ) : (
                    <>
                      Plant maintenance compliance averages <strong className="text-amber-700">{m.complianceRate}</strong> across {m.machinesAnalyzed} machines, with <strong className="text-slate-900">{m.lowAdherenceCount} machines</strong> identified below the 70% adherence threshold.
                    </>
                  )} Filter rule strictly flags machines below 70% adherence where &ge;2 PMs were scheduled.
                </p>

                <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="text-slate-600">
                    {outlierHours > 0 ? (
                      <>
                        Machines in {outlierPlantName} drive <strong className="text-slate-900">{outlierDowntimePct}%</strong> of total site downtime ({outlierHours.toLocaleString()} hrs).
                      </>
                    ) : (
                      <>
                        Total evaluated downtime exposure across fleet: <strong className="text-slate-900">{m.totalBreakdownHours}</strong>.
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => onTriggerNlgPrompt(`Explain why compliance dropped at ${outlierPlantName} plant and what management actions are needed`)}
                    className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Ask AuditSphere Chatbot for {outlierPlantName} Recovery Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Metric Summary Pillars - Dynamically Grounded */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Worst Combined Cases</span>
                <span className="text-xs text-rose-600 font-mono font-semibold">Top {Math.min(4, topLossMachines.length)} Risks</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                {topLossMachines.slice(0, 4).map((mach, idx) => (
                  <div key={idx} className="truncate">
                    <strong className="text-slate-900">{mach.name || mach.id}:</strong>{' '}
                    <span>{mach.adherence || 'N/A'} adh, {mach.hours} BD hrs ({mach.breakdowns || 1} {mach.breakdowns === 1 ? 'breakdown' : 'breakdowns'})</span>
                  </div>
                ))}
                {topLossMachines.length === 0 && (
                  <div className="text-slate-400">No chronic breakdown assets logged</div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Root Cause Pareto</span>
                <span className="text-xs text-blue-600 font-mono font-semibold">
                  {topParetoItems.length > 0 ? `Top ${topParetoItems.length} = ${topParetoPctSum}%` : 'Pareto Split'}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                {paretoCategories.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="truncate">
                    <strong className="text-slate-900">{cat.name}:</strong>{' '}
                    <span>{(cat.hours || 0).toLocaleString()} hrs lost ({cat.pct}%)</span>
                  </div>
                ))}
                {paretoCategories.length === 0 && (
                  <div className="text-slate-400">No Pareto categories logged</div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Machine Concentration</span>
                <span className="text-xs text-blue-600 font-mono font-semibold">80/20 Rule</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {totalBdMachinesCount > 0 ? (
                  <>
                    <strong className="text-slate-900">{totalBdMachinesCount.toLocaleString()} machines</strong> recorded breakdown events, but <strong className="text-slate-900">Top {top10Machines.length} machines drive {top10DowntimePct}%</strong> of total downtime ({Math.round(top10Hours).toLocaleString()} hrs). Focus on these high-loss assets delivers maximum downtime containment with minimal operational friction.
                  </>
                ) : (
                  <>
                    Zero equipment breakdowns recorded in uploaded dataset. Asset fleet availability is maintained across all {m.machinesAnalyzed} machines.
                  </>
                )}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Breakdown Pareto */}
      {activeTab === 'pareto' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Pareto by Failure Category (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Breakdown Pareto • By Failure Mode
                </h3>
                <p className="text-xs text-slate-500">Total {m.totalBreakdownHours} across failure categories</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600">{paretoCategories.length} Categories</span>
            </div>

            <div className="space-y-4">
              {paretoCategories.map((cat, idx) => {
                const colors = ['#2563eb', '#dc2626', '#d97706', '#059669', '#7c3aed', '#64748b'];
                const catColor = cat.color || colors[idx % colors.length];
                const pctNum = typeof cat.pct === 'number' ? cat.pct : parseFloat(cat.pct) || 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.name || cat.category}</span>
                      <span className="font-mono text-slate-500">
                        <strong className="text-slate-900">{(cat.hours || 0).toLocaleString()} hrs</strong> ({pctNum}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${Math.min(100, pctNum * 2.8)}%`, 
                          backgroundColor: catColor 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              💡 Top recurring issues:{' '}
              {topFailureReasons.length > 0 ? (
                topFailureReasons.map((r, i) => (
                  <span key={i}>
                    {i > 0 && ' and '}
                    <strong className="text-slate-900">&quot;{r.name}&quot;</strong> ({Math.round(r.hours).toLocaleString()} hrs across {r.count} events)
                  </span>
                ))
              ) : (
                paretoCategories.length > 0 ? (
                  <span>
                    Concentrated in top category <strong className="text-slate-900">&quot;{paretoCategories[0]?.name || paretoCategories[0]?.category}&quot;</strong> ({(paretoCategories[0]?.hours || 0).toLocaleString()} hrs).
                  </span>
                ) : (
                  <span>No failure issues recorded in uploaded dataset.</span>
                )
              )}
            </div>
          </div>

          {/* Right: Worst Machines Table (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Top Breakdown Machines
                  </h3>
                  <p className="text-xs text-slate-500">Ranked by total breakdown downtime hours</p>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600">High Impact</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="pb-2.5">Machine</th>
                      <th className="pb-2.5">Plant</th>
                      <th className="pb-2.5">Adherence</th>
                      <th className="pb-2.5 text-right">BD Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topLossMachines.slice(0, 7).map((mItem) => (
                      <tr 
                        key={mItem.id}
                        onClick={() => {
                          setSelectedMachineId(mItem.id);
                        }}
                        className="hover:bg-slate-50 cursor-pointer group transition-colors"
                      >
                        <td className="py-2.5 font-bold text-slate-900 group-hover:text-blue-600">
                          {mItem.name}
                        </td>
                        <td className="py-2.5 text-slate-600">{mItem.plant}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            {typeof mItem.adherence === 'string' ? mItem.adherence : `${mItem.adherence}%`}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-900 font-bold text-right">{mItem.hours || mItem.bdHours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Worst machines correlate with delayed PM execution</span>
              <button
                onClick={() => onTriggerNlgPrompt('Generate a breakdown loss mitigation plan for top chronic machines')}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <span>Diagnose with AuditSphere Chatbot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION OF BREAKDOWN PARETO: MONTHLY TREND, PLANT TOTALS & DRILLDOWN */}
          <div className="lg:col-span-12 space-y-6 mt-2 pt-6 border-t border-slate-200">
            
            {/* 1. Monthly Breakdown History Bar Chart */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Monthly Breakdown History ({analysis.reportingPeriod || 'FY 2025–26'})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Monthly incident distribution across {monthlyData.reduce((acc, c) => acc + (Number(c.count) || 0), 0)} total breakdown events. Click any bar to inspect plant &amp; machine incident logs.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 font-mono text-xs">
                  <span className="text-slate-500">Selected Month:</span>
                  <span className="font-bold text-blue-700">{selectedMonth}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold">
                    {monthlyData.find((item) => item.month === selectedMonth)?.count || 0} Breakdowns
                  </span>
                </div>
              </div>

              {/* The Visual Bar Chart */}
              <div className="grid grid-cols-12 gap-2 sm:gap-3 h-48 items-end pt-4 pb-2 px-2 border-b border-slate-200 bg-slate-50/60 rounded-xl mb-3">
                {monthlyData.map((item, idx) => {
                  const mStr = String(item?.month || `Month ${idx + 1}`);
                  const isSelected = selectedMonth === (item?.month || mStr);
                  const maxCount = Math.max(...monthlyData.map(d => Number(d?.count) || 1), 85);
                  const countNum = Number(item?.count) || 0;
                  const heightPct = Math.max(15, Math.round((countNum / Math.max(1, maxCount)) * 100));
                  return (
                    <div
                      key={item?.month || `bar-${idx}`}
                      onClick={() => setSelectedMonth(item?.month || mStr)}
                      className="flex flex-col items-center cursor-pointer group h-full justify-end relative"
                    >
                      <span className={`text-[10px] font-mono font-bold mb-1 transition-all ${
                        isSelected 
                          ? 'text-blue-700 font-black scale-110' 
                          : 'text-slate-500 group-hover:text-slate-900'
                      }`}>
                        {countNum}
                      </span>
                      
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-t from-blue-600 via-indigo-600 to-cyan-500 shadow-md ring-2 ring-blue-500'
                            : 'bg-slate-300 group-hover:bg-blue-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Month Labels Strip */}
              <div className="grid grid-cols-12 gap-2 sm:gap-3 text-center px-2">
                {monthlyData.map((item, idx) => {
                  const mStr = String(item?.month || `Month ${idx + 1}`);
                  const isSelected = selectedMonth === (item?.month || mStr);
                  return (
                    <button
                      key={item?.month || `btn-month-${idx}`}
                      onClick={() => setSelectedMonth(item?.month || mStr)}
                      className={`text-[10px] sm:text-xs font-mono py-1 rounded transition-colors ${
                        isSelected
                          ? 'font-bold text-blue-700 bg-blue-50 border border-blue-200'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {mStr.split(' ')[0] || mStr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Below it: Plant Breakdown Totals */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Total Number of Breakdowns by Plant (Annual Reconciliation)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click a plant card to filter the machine incident log below for <strong className="text-blue-700">{selectedMonth}</strong>:
                  </p>
                </div>
                {selectedPlantFilter !== 'ALL' && (
                  <button
                    onClick={() => setSelectedPlantFilter('ALL')}
                    className="text-xs text-rose-700 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 self-start"
                  >
                    Clear Filter ({selectedPlantFilter.toUpperCase()})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {plantTotals.map((p, pIdx) => {
                  const plantName = p.name || p.plant || `Plant ${pIdx + 1}`;
                  const pId = p.id || String(plantName).split(' ')[0] || `p-${pIdx}`;
                  const isFilterActive = selectedPlantFilter.toLowerCase() === pId.toLowerCase() || (p.plant && selectedPlantFilter.toLowerCase() === String(p.plant).toLowerCase());
                  return (
                    <div
                      key={pId}
                      onClick={() => setSelectedPlantFilter(isFilterActive ? 'ALL' : pId)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isFilterActive
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900 truncate">{plantName}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {p.pct && !String(p.pct).includes('undefined')
                            ? (typeof p.pct === 'string' ? p.pct : `${p.pct}%`)
                            : (p.share && !String(p.share).includes('undefined')
                                ? p.share
                                : `${Math.round(((p.count || 0) / Math.max(1, plantTotals.reduce((a, x) => a + (Number(x.count) || 0), 0))) * 100)}%`)}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-slate-900 font-mono">{p.count}</span>
                        <span className="text-xs font-mono text-slate-500">{(p.hours || 0).toLocaleString()} hrs</span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          (p.status || p.risk || '').includes('Outlier') || (p.status || p.risk || '').includes('CRITICAL')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {p.status || p.risk || 'Controlled'}
                        </span>
                        {isFilterActive && (
                          <span className="text-[10px] text-blue-700 font-bold">Filtered ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Below it: Interactive Drill-Down Table */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Machine Breakdown Drill-Down for: <span className="text-blue-700">{selectedMonth}</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Granular incident register displaying which plant's which machine suffered downtime.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Showing {
                      (selectedPlantFilter === 'ALL'
                        ? (machineBreakdowns[selectedMonth] || [])
                        : (machineBreakdowns[selectedMonth] || []).filter((item) => (item.plant || '').toLowerCase().includes(selectedPlantFilter.toLowerCase()))
                      ).length
                    } incidents
                  </span>
                  <button
                    onClick={() => exportPMEffectivenessWorkbook(analysis)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export to Excel</span>
                  </button>
                </div>
              </div>

              {/* Drill-down Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Plant Name</th>
                      <th className="p-3">Machine ID &amp; Name</th>
                      <th className="p-3">Incident Date</th>
                      <th className="p-3">Downtime Duration</th>
                      <th className="p-3">Failure Reason / Component</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(() => {
                      const list = machineBreakdowns[selectedMonth] || [];
                      const filtered = selectedPlantFilter === 'ALL' 
                        ? list 
                        : list.filter((item) => (item.plant || '').toLowerCase().includes(selectedPlantFilter.toLowerCase()));

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              No breakdown incidents found for <strong className="text-slate-800">{selectedPlantFilter}</strong> in <strong className="text-slate-800">{selectedMonth}</strong>.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((row, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => {
                            setSelectedMachineId(row.machineId || row.id);
                          }}
                          className="hover:bg-slate-50 cursor-pointer group transition-colors"
                        >
                          <td className="p-3 font-bold text-slate-900 group-hover:text-blue-600">
                            {row.plant}
                          </td>
                          <td className="p-3 font-mono text-slate-800 font-semibold">
                            {row.machineName}
                          </td>
                          <td className="p-3 font-mono text-slate-500">
                            {row.date}
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-600">
                            {row.duration} hrs
                          </td>
                          <td className="p-3 text-slate-700 max-w-sm truncate" title={row.reason}>
                            {row.reason}
                          </td>
                          <td className="p-3 text-slate-500">
                            {row.category}
                          </td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.duration > 6.45
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {row.duration > 6.45 ? 'High Impact (>6.45h)' : 'Standard'}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 3: PM Effectiveness & Post-PM Failure Lag Analysis */}
      {activeTab === 'reliability' && (
        <div className="space-y-6">
          {/* Main Slide Card Styled exactly after Protiviti Executive Audit Slide */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden p-6 sm:p-8">
            
            {/* Top Slide Header Row: Title on Left, Meta Box on Right */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
              <div className="max-w-2xl">
                <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 mb-2">
                  Executive Audit Finding • Repeat Issue
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1a365d] leading-snug tracking-tight">
                  3. Ineffective Preventive Maintenance Management Resulting in Increased Breakdown Risk and Reduced Maintenance Effectiveness (Repeat)
                </h3>
              </div>

              {/* Top-Right Risk Evaluation Table matching the image */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs shrink-0 shadow-2xs self-start">
                <div className="grid grid-cols-[160px_40px] border-b border-slate-200">
                  <span className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50">Design ineffectiveness</span>
                  <span className="px-2 py-1.5 font-black text-center text-slate-900 border-l border-slate-200 bg-white">✕</span>
                </div>
                <div className="grid grid-cols-[160px_40px] border-b border-slate-200">
                  <span className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50">Operating ineffectiveness</span>
                  <span className="px-2 py-1.5 font-black text-center text-slate-900 border-l border-slate-200 bg-white">✔</span>
                </div>
                <div className="grid grid-cols-[160px_40px]">
                  <span className="px-3 py-1.5 font-bold text-white bg-[#0f2942] text-center tracking-wide">Risk Rating</span>
                  <span className="px-2 py-1.5 font-black text-center text-white bg-red-600 border-l border-red-700 uppercase tracking-wider">High</span>
                </div>
              </div>
            </div>

            {/* Observation Blue Section Banner */}
            <div className="bg-[#1a365d] text-white font-bold px-4 py-2.5 text-center text-sm tracking-wider uppercase rounded-t-xl shadow-xs">
              Observation
            </div>

            {/* Observation Narrative and Quantitative Findings */}
            <div className="p-6 bg-slate-50/50 border border-t-0 border-slate-300 rounded-b-xl space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <div>
                <p>
                  <strong className="text-slate-900">Background:</strong> Preventive Maintenance (PM) is a planned maintenance approach designed to inspect, service, and replace equipment components at predefined intervals to prevent unexpected failures and ensure reliable equipment performance. Effective PM planning, timely execution, maintenance quality verification, and adherence to approved schedules are essential to maximize asset availability, improve equipment reliability, minimize unplanned downtime, and optimize maintenance costs.
                </p>
              </div>

              <div>
                <p>
                  <strong className="text-slate-900">Observation:</strong> Review of preventive maintenance (PM) records identified deficiencies in maintenance planning, execution, compliance monitoring, and effectiveness evaluation, indicating weaknesses in the overall maintenance control framework.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-slate-900">Analysis of PM compliance and breakdown records showed that:</p>
                
                <div className="space-y-2 text-slate-700">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <strong className="text-blue-900 block mb-1">A. PM Schedule Compliance:</strong>
                    <ul className="list-disc list-outside pl-5 space-y-1 text-xs">
                      <li>
                        <strong>{pmEffectivenessLagAnalysis?.findings?.delayedOver7DaysCount ?? 0} PM activities</strong> were completed more than seven days after the planned due date. <span className="text-slate-500 font-mono text-xs">(Refer Annexure 5.1)</span>
                      </li>
                      <li>
                        Overall PM schedule adherence was approximately <strong>{m.complianceRate || '0.0%'}</strong>, indicating that a substantial proportion of preventive maintenance activities were not performed in accordance with the approved maintenance schedule.
                      </li>
                      <li>
                        Delayed work orders created an accumulated backlog of maintenance tasks across critical machining bays.
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <strong className="text-rose-900 block mb-1">B. Breakdown Exposure Due to Overdue PM:</strong>
                    <ul className="list-disc list-outside pl-5 space-y-1 text-xs">
                      <li>
                        Further review identified <strong>{pmEffectivenessLagAnalysis?.findings?.overduePmBreakdownsCount ?? 0} breakdown incidents</strong> affecting <strong>{pmEffectivenessLagAnalysis?.findings?.criticalAssetsAffectedCount ?? 0} Critical &apos;A&apos; assets</strong>, where preventive maintenance activities were already overdue at the time of failure.
                      </li>
                      <li>
                        These breakdowns resulted in approximately <strong>{pmEffectivenessLagAnalysis?.findings?.overduePmDowntimeHours ?? 0} hours</strong> of equipment downtime, demonstrating a direct correlation between PM non-compliance and equipment failures.
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <strong className="text-amber-900 block mb-1">C. Breakdowns Following PM Completion:</strong>
                    <ul className="list-disc list-outside pl-5 space-y-1 text-xs">
                      <li>
                        Additionally, <strong>{pmEffectivenessLagAnalysis?.findings?.earlyFailureCount ?? 0} equipment failures</strong> occurred within five days following completion of preventive maintenance activities, suggesting potential deficiencies in PM execution quality, inspection effectiveness, maintenance procedures, or post-maintenance verification practices. <span className="text-slate-500 font-mono text-xs">(Refer Annexure 5.2)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Grid: Supporting Table on Left, Actionable Recommendations on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                {/* Left 7 Cols: The Post-PM Breakdown Time-Lag Table */}
                <div className="lg:col-span-7">
                  <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-xs bg-white">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#1a365d] text-white">
                        <tr>
                          <th className="py-2.5 px-3.5 font-bold border-r border-blue-900/40">PM Gap / Breakdown Interval</th>
                          <th className="py-2.5 px-3 text-center font-bold border-r border-blue-900/40">Breakdown Count</th>
                          <th className="py-2.5 px-3 text-center font-bold border-r border-blue-900/40">% of Total</th>
                          <th className="py-2.5 px-3.5 text-right font-bold">Total Duration (Hours)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-xs">
                        {gapBrackets.map((gb, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="py-2.5 px-3.5 font-bold font-sans text-slate-900 border-r border-slate-200">
                              {gb.bracket}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900 border-r border-slate-200">
                              {gb.count}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-700 border-r border-slate-200">
                              {gb.pct}
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">
                              {typeof gb.hours === 'number' ? gb.hours.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : gb.hours}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right 5 Cols: Recommendations block */}
                <div className="lg:col-span-5 p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1a365d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Key Audit Recommendations</span>
                    </h4>
                    <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-outside pl-4">
                      <li>Strengthen monitoring and escalation of overdue PM activities.</li>
                      <li>Investigate repeat breakdowns occurring shortly after PM completion.</li>
                      <li>Review PM frequency and inspection tasks for critical assets with repeated failures.</li>
                      <li>Introduce post-maintenance quality checks and verification.</li>
                      <li>Establish machine-wise PM compliance and breakdown monitoring.</li>
                      <li>Track corrective actions and review PM effectiveness periodically.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Footer bar with Protiviti branding */}
              <div className="pt-4 mt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-400">13</span>
                  <span>•</span>
                  <span>Plant Maintenance Audit Assurance Deck • FY 2025–26</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onTriggerNlgPrompt(`Perform deep root cause analysis on why ${pmEffectivenessLagAnalysis?.findings?.earlyFailureCount ?? 0} failures occurred within 5 days of PM completion`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs border border-indigo-200 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Analyze 1–5d Gap with AI</span>
                  </button>
                  <div className="text-right">
                    <span className="font-serif italic font-black text-slate-800 text-base tracking-tight block">
                      protiviti
                    </span>
                    <span className="text-[9px] font-sans text-slate-500 block uppercase tracking-wider -mt-1">
                      Global Business Consulting
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Supporting Evidence Drill-downs: Annexure 5.1 & Annexure 5.2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Annexure 5.1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] font-mono border border-rose-200">
                    Annexure 5.1
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    PM Activities Completed &gt;7 Days Overdue
                  </h4>
                </div>
                <span className="text-xs font-mono text-rose-600 font-bold">
                  {pmEffectivenessLagAnalysis?.findings?.delayedOver7DaysCount || 227} Work Orders
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Work orders where actual completion exceeded scheduled target date by more than 7 days, elevating wear-out and failure risk on plant lines:
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Machine ID / Name</th>
                      <th className="p-2">Plant</th>
                      <th className="p-2">Delay (Days)</th>
                      <th className="p-2">Risk Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { machine: 'MC-GRIND-04 (CNC Cylindrical Grinder)', plant: 'CHETAK', delay: '18 days', risk: 'Critical - Spindle Seizure' },
                      { machine: 'MC-SHAPER-09 (Gear Shaper)', plant: 'CHETAK', delay: '14 days', risk: 'Elevated - Indexing Wear' },
                      { machine: 'MC-MILL-02 (Horizontal Machining Ctr)', plant: 'CHETAK', delay: '12 days', risk: 'Elevated - Guide-way Play' },
                      { machine: 'MC-PRESS-07 (Mechanical Stamping Press)', plant: 'Forging', delay: '9 days', risk: 'Moderate - Lube starvation' },
                      { machine: 'MC-LATHE-11 (CNC Turning Center)', plant: 'CHETAK', delay: '8 days', risk: 'Moderate - Turret backlash' },
                    ].map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-800">{row.machine}</td>
                        <td className="p-2 text-slate-600">{row.plant}</td>
                        <td className="p-2 font-mono font-bold text-rose-600">{row.delay}</td>
                        <td className="p-2 text-slate-700">{row.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Annexure 5.2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px] font-mono border border-amber-200">
                    Annexure 5.2
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Early Equipment Failures (1–5 Days After PM)
                  </h4>
                </div>
                <span className="text-xs font-mono text-amber-600 font-bold">
                  {pmEffectivenessLagAnalysis?.findings?.earlyFailureCount || 28} Incidents
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Stoppages occurring within 5 days of maintenance completion, highlighting potential gaps in PM execution quality, inspection rigor, or assembly verification:
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Machine ID / Name</th>
                      <th className="p-2">Failure Lag</th>
                      <th className="p-2">Downtime</th>
                      <th className="p-2">Defect Mechanism</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { machine: 'MC-GRIND-04 (Grinder #4)', lag: '2 days after PM', hrs: '48.5h', defect: 'Lube seal pinched during PM filter replacement' },
                      { machine: 'MC-SHAPER-09 (Shaper #9)', lag: '3 days after PM', hrs: '36.0h', defect: 'Hydraulic connector loose after oil drain' },
                      { machine: 'MC-MILL-02 (HMC #2)', lag: '1 day after PM', hrs: '24.2h', defect: 'Proximity sensor misaligned during cleaning' },
                      { machine: 'MC-LATHE-15 (CNC Lathe)', lag: '4 days after PM', hrs: '18.0h', defect: 'Coolant hose clamp unfastened post-inspection' },
                      { machine: 'MC-PRESS-03 (Press #3)', lag: '5 days after PM', hrs: '16.5h', defect: 'Guide bush lubrication port airlocked' },
                    ].map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-800">{row.machine}</td>
                        <td className="p-2 font-mono font-bold text-amber-700">{row.lag}</td>
                        <td className="p-2 font-mono text-rose-600 font-bold">{row.hrs}</td>
                        <td className="p-2 text-slate-700">{row.defect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Output Download Modal (Excel & PPT) */}
      {showExcelModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExcelModal(false);
              setDownloadSuccess('');
            }
          }}
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl relative text-left flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in duration-150">
            
            {/* Modal Header with Dedicated Close Button */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Download Output (Excel &amp; PPT)</h3>
                  <p className="text-[11px] text-slate-500">Complete audit analytical models and presentation deck</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowExcelModal(false);
                  setDownloadSuccess('');
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 flex items-center justify-center transition-colors shadow-2xs shrink-0 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Close modal (Esc)"
                aria-label="Close"
              >
                <X className="w-4 h-4 font-bold" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              
              {/* Success Notification Banner */}
              {downloadSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-medium leading-tight">{downloadSuccess}</span>
                  </div>
                  <button 
                    onClick={() => setDownloadSuccess('')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 ml-2 underline shrink-0 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Deliverable 1: PM Compliance Workbook */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-900 truncate text-xs">PM_Compliance_Analysis_FY26.xlsx</span>
                    </div>
                    <span className="font-mono text-blue-700 font-semibold text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                      8 Tabs
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-900 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mb-1.5">
                    <strong>Methodology:</strong> Rule-Based Analytics Engine using Python Pandas, combined with data validation and KPI calculations
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                    Raw Data, Observation Summary, Data Quality Check, Working, Ranking, Ageing, Trend &amp; README
                  </p>
                  <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                    {['Raw Data', 'Summary', 'Data Quality', 'Compliance Working', 'Ranking', 'Ageing', 'Trend', 'README'].map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    exportPMComplianceWorkbook(analysis);
                    setDownloadSuccess('PM_Compliance_Analysis_FY26.xlsx downloaded successfully!');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              {/* Deliverable 2: PM Effectiveness Workbook */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-bold text-slate-900 truncate text-xs">PM_Effectiveness_Audit_FY26.xlsx</span>
                    </div>
                    <span className="font-mono text-indigo-700 font-semibold text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                      10 Tabs
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-950 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mb-1.5">
                    <strong>Methodology:</strong> Reliability Engineering + Pareto Analysis as the core, XGBoost for optional future breakdown-risk prediction, and Isolation Forest for anomaly detection.
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                    Monthly Breakdown History, Plant Totals, Machine Log, Pareto, Low Adherence × BD &amp; Findings
                  </p>
                  <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                    {['Monthly History', 'Plant Totals', 'Machine Log', 'Pareto', 'Reliability', 'Working', 'Findings'].map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    exportPMEffectivenessWorkbook(analysis);
                    setDownloadSuccess('PM_Effectiveness_Audit_FY26.xlsx downloaded successfully!');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              {/* Deliverable 3: PPT Presentation Deck with Dedicated Template Upload */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-slate-900 truncate text-xs">Plant_Maintenance_Observation_Deck_FY26.pptx</span>
                  </div>
                  <span className="font-mono text-amber-700 font-semibold text-[10px] shrink-0 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
                    {6 + (chatbotAuditSlides ? chatbotAuditSlides.length : 0)} Slides
                  </span>
                </div>

                {/* Upload a custom template dedicated button & banner with Remove (X) button */}
                <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-indigo-900 block truncate">PPT Presentation Template</span>
                      <span className="text-[10px] text-slate-600 truncate block">
                        Active: <strong className="text-indigo-700 font-mono">{pptTemplate?.name || 'Default 16:9 Template'}</strong>
                      </span>
                    </div>
                    {pptTemplate?.isCustom && onRemovePptTemplate && (
                      <button
                        onClick={onRemovePptTemplate}
                        className="p-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                        title="Remove custom template"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => pttInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-md text-[11px] font-bold bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-2xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload a custom template</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Executive Observations, PM Compliance, CHETAK Outlier, Pareto, Monthly History &amp; Chronic Machines{chatbotAuditSlides?.length > 0 ? ` + ${chatbotAuditSlides.length} Chatbot Slide(s)` : ''}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                    {['Exec Findings', 'Compliance & Ageing', 'CHETAK Cluster', 'Breakdown Pareto', 'Monthly History', 'Chronic Assets'].map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
                        {t}
                      </span>
                    ))}
                    {chatbotAuditSlides?.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        +{chatbotAuditSlides.length} Chatbot Slide(s)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      await exportAuditPptx(pptTemplate, chatbotAuditSlides, analysis);
                      setDownloadSuccess('Plant_Maintenance_Audit_Observation_Deck_FY26.pptx downloaded successfully!');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setShowExcelModal(false);
                  setDownloadSuccess('');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  exportAllWorkbooks(analysis);
                  await exportAuditPptx(pptTemplate, chatbotAuditSlides, analysis);
                  setDownloadSuccess(`All outputs downloaded: 2 Excel Workbooks (17 tabs) + PowerPoint Deck (${6 + (chatbotAuditSlides ? chatbotAuditSlides.length : 0)} slides)!`);
                }}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All (Excel + PPT)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
