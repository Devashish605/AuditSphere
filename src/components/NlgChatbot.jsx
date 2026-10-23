import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileText, 
  Lightbulb, 
  TrendingDown, 
  CheckCircle2, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  X, 
  ChevronRight, 
  ShieldAlert, 
  ArrowRight, 
  RefreshCw, 
  FileSpreadsheet,
  Layers,
  Key,
  Settings,
  Zap,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { answerUserPrompt, generateDocumentReport } from '../services/nlgEngine';
import { 
  askGeminiAuditAssistant, 
  isGeminiApiConfigured, 
  getGeminiApiKey, 
  saveGeminiApiKey 
} from '../services/geminiApiService';
import { analyzeMaintenanceData } from '../services/maintenanceAnalytics';

export default function NlgChatbot({ 
  uploadedFiles = [], 
  isOpen, 
  onClose,
  onAddObservationToSlide,
  onOpenSlideDeck,
  onLoadBenchmarkData,
  onNavigateToUpload
}) {
  const [addedMsgIds, setAddedMsgIds] = useState(new Set());
  const [selectedDoc, setSelectedDoc] = useState(
    uploadedFiles[0]?.name || ''
  );
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      timestamp: 'Just now',
      text: uploadedFiles.length > 0 
        ? `### 👋 Welcome to AuditSphere AI Assistant\n\nI have loaded **${uploadedFiles.length} audit document(s)**.\n\nSelect a document above or click a suggestion below to get an instant executive audit summary with quantified financial loss and corrective action steps.`
        : `### 👋 Welcome to AuditSphere AI Assistant\n\n⚠️ **No audit documents have been uploaded yet.**\n\nTo analyze **PM Compliance (%)** or **PM Effectiveness**, the model requires your source data files.\n\n• **PM Compliance (%)** requires: \`PM Plan Vs Actual (PM Schedule, PM Completion Date, Machine Master, PM Frequency)\`\n• **PM Effectiveness** requires: \`Breakdown history (PM History, Breakdown History, Machine Master, Breakdown Date, PM Date)\`\n\nPlease go to **Step 3 (Data Ingestion)** to upload your files, or click **"Load Demo Data"** above to test the system with benchmark sample records.`,
      reportData: null,
      modelUsed: isGeminiApiConfigured() ? 'Gemini 3.8 Flash' : 'Rule-Based NLG'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Gemini API Configuration State
  const [hasApiKey, setHasApiKey] = useState(() => isGeminiApiConfigured());
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getGeminiApiKey());
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState('');
  const [useGemini, setUseGemini] = useState(true);

  const chatBottomRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Keep selectedDoc in sync if uploadedFiles changes
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      if (!selectedDoc || !uploadedFiles.some(f => f.name === selectedDoc)) {
        setSelectedDoc(uploadedFiles[0].name);
      }
    } else {
      setSelectedDoc('');
    }
  }, [uploadedFiles]);

  const handleSaveApiKey = () => {
    const success = saveGeminiApiKey(apiKeyInput);
    setHasApiKey(isGeminiApiConfigured());
    setKeySavedMessage(success ? 'Gemini API Key saved successfully!' : 'Key cleared. Switched to Rule Engine.');
    setTimeout(() => {
      setKeySavedMessage('');
      if (success) setShowApiKeyModal(false);
    }, 1500);
  };

  const handleSendPrompt = async (promptText) => {
    const textToSend = promptText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: textToSend,
      reportData: null
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // If Gemini is active and configured, use Google Gemini 3.8 Flash
    if (useGemini && isGeminiApiConfigured()) {
      try {
        const auditAnalysis = analyzeMaintenanceData(uploadedFiles);
        const geminiResult = await askGeminiAuditAssistant(textToSend, {
          ...auditAnalysis,
          selectedDoc,
          uploadedFiles
        });

        if (geminiResult && geminiResult.success && geminiResult.text) {
          const botMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            timestamp: 'Just now',
            text: geminiResult.text,
            reportData: geminiResult.reportData || null,
            modelUsed: geminiResult.model || 'Gemini 3.8 Flash'
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
          return;
        }
      } catch (err) {
        console.warn('Gemini 3.8 Flash call failed, falling back to local rule engine:', err);
      }
    }

    // High-performance fallback: Local Rule-Based Analytics Engine
    setTimeout(() => {
      const response = answerUserPrompt(textToSend, { selectedDoc, uploadedFiles });
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: response.text,
        reportData: response.reportData,
        modelUsed: 'Rule-Based NLG Engine'
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleGenerateDocumentReport = () => {
    handleSendPrompt(`Generate executive audit report for document: ${selectedDoc} and suggest corrective actions for the losses identified`);
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      {/* Click outside backdrop to dismiss */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Close Chatbot Backdrop"
      />

      {/* Chatbot Drawer with Light Blue Interior */}
      <div className="relative z-10 w-full sm:max-w-[500px] lg:max-w-[540px] h-full bg-[#f0f7ff] border-l-2 border-blue-300 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Chatbot Top Bar */}
        <div className="p-3.5 sm:p-4 border-b border-blue-400 flex items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 p-1 flex items-center justify-center text-white shadow-inner">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">AuditSphere Assistant</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Dual-Engine AI
                </span>
              </div>
              <p className="text-[11px] text-blue-100">Natural Language Audit Report &amp; Reliability Advisor</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Gemini API Key Configuration Pill */}
            <button
              onClick={() => setShowApiKeyModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border shadow-xs ${
                hasApiKey 
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border-emerald-300/40' 
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-300/40'
              }`}
              title="Configure Google Gemini 3.8 Flash API Key"
            >
              <Sparkles className="w-3 h-3 text-cyan-200" />
              <span>{hasApiKey ? 'Gemini 3.8 Flash' : 'Connect Gemini API'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gemini API Key Modal Popup */}
        {showApiKeyModal && (
          <div className="p-4 bg-white border-b-2 border-blue-200 shadow-md animate-in slide-in-from-top duration-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Google Gemini AI API Integration</h4>
                  <p className="text-[10px] text-slate-500">Model: <strong className="text-blue-700">gemini-3.8-flash</strong> via official @google/genai SDK</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
              Enables real-time grounded generative reasoning, automated 5-Why RCA, and FMEA check-sheet gap detection. Key is saved strictly in your local browser storage.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showKeySecret ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 pr-9 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowKeySecret(!showKeySecret)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {keySavedMessage && (
                <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{keySavedMessage}</span>
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Get Gemini API Key (Free)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  {hasApiKey && (
                    <button
                      onClick={() => {
                        setApiKeyInput('');
                        saveGeminiApiKey('');
                        setHasApiKey(false);
                        setKeySavedMessage('API key cleared. Using local Rule Engine.');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] text-rose-700 hover:bg-rose-50 font-medium"
                    >
                      Clear Key
                    </button>
                  )}
                  <button
                    onClick={handleSaveApiKey}
                    className="px-3.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                  >
                    Save &amp; Activate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Selector Header - Light Blue Container */}
        <div className="p-3 bg-[#e0efff] border-b border-blue-200 flex items-center gap-2 shrink-0">
          <FileSpreadsheet className={`w-4 h-4 shrink-0 ${uploadedFiles.length > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="text-xs text-blue-900 font-semibold shrink-0">Audit Document:</span>
        <select
          value={selectedDoc}
          onChange={(e) => setSelectedDoc(e.target.value)}
          disabled={uploadedFiles.length === 0}
          className="flex-1 bg-white border border-blue-300 rounded-lg text-xs text-slate-800 px-2 py-1.5 focus:outline-none focus:border-blue-600 truncate disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs font-medium"
        >
          {uploadedFiles.length === 0 ? (
            <option value="">No documents uploaded (Upload in Step 3)</option>
          ) : (
            uploadedFiles.map((file) => (
              <option key={file.id} value={file.name}>
                {file.name}
              </option>
            ))
          )}
        </select>
        <button
          onClick={handleGenerateDocumentReport}
          disabled={uploadedFiles.length === 0 || !selectedDoc}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 shadow-xs transition-colors flex items-center gap-1 ${
            uploadedFiles.length > 0 && selectedDoc
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
          title={uploadedFiles.length === 0 ? 'Upload a document in Step 3 first' : 'Generate report for this document'}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
      </div>

      {/* Empty State Banner if no files are uploaded */}
      {uploadedFiles.length === 0 && (
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-800">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate text-[11px]">No audit documents uploaded. Model is awaiting source data.</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onLoadBenchmarkData && (
              <button
                onClick={onLoadBenchmarkData}
                className="text-[11px] px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 font-semibold text-amber-800 border border-amber-300 transition-colors"
              >
                Load Demo Data
              </button>
            )}
            {onNavigateToUpload && (
              <button
                onClick={onNavigateToUpload}
                className="text-[11px] px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 font-semibold text-blue-700 border border-blue-200 transition-colors"
              >
                Go to Step 3
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Prompt Pills Bar - Light Blue Styling */}
      <div className="px-3.5 py-2.5 bg-[#eaf4ff] border-b border-blue-200 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
        <button
          onClick={() => handleSendPrompt('Explain the methodology: Rule-Based Analytics Engine using Python Pandas, combined with data validation and KPI calculations for PM Compliance')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 shadow-2xs transition-colors flex items-center gap-1 font-semibold"
        >
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>PM Compliance: Rule-Based (Pandas)</span>
        </button>

        <button
          onClick={() => handleSendPrompt('Explain the methodology: Reliability Engineering + Pareto Analysis as the core, XGBoost for optional future breakdown-risk prediction, and Isolation Forest for anomaly detection for PM Effectiveness')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 shadow-2xs transition-colors flex items-center gap-1 font-semibold"
        >
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>PM Effectiveness: Reliability + XGBoost + Isolation Forest</span>
        </button>

        <button
          onClick={() => handleSendPrompt(
            uploadedFiles.length > 0 && selectedDoc
              ? `Give the executive report for document ${selectedDoc} and suggestion for the loss in report`
              : `Give the executive report for document and suggestion for the loss in report`
          )}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs transition-colors flex items-center gap-1 font-semibold"
        >
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Document Report & Loss Suggestions</span>
        </button>

        <button
          onClick={() => handleSendPrompt(`Analyze repeated failures despite PM and ineffective PM check-sheet scope for ${selectedDoc}`)}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs transition-colors flex items-center gap-1 font-semibold"
        >
          <span>Repeated Failures vs PM Scope</span>
        </button>

        <button
          onClick={() => handleSendPrompt('Suggest actionable mitigation for the ₹28.7 Lakhs downtime loss')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs transition-colors flex items-center gap-1 font-semibold"
        >
          <TrendingDown className="w-3 h-3 text-rose-500" />
          <span>Loss Mitigation & ROI</span>
        </button>

        <button
          onClick={() => handleSendPrompt('Why did compliance dip in CHETAK plant to 62.3%?')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs transition-colors font-semibold"
        >
          <span>CHETAK Outlier Diagnostic</span>
        </button>

        <button
          onClick={() => handleSendPrompt('Identify high-impact failure modes and repeat breakdown correlations (>6.45 hrs)')}
          className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs transition-colors font-semibold"
        >
          <span>Pareto & Repeat Failures</span>
        </button>
      </div>

      {/* Messages Scroll Area - Soft Light Blue Background */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-[#f0f7ff]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-blue-900 flex items-center gap-1.5">
                  <span>{isBot ? 'AuditSphere Assistant' : 'Auditor'}</span>
                  {isBot && msg.modelUsed && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                      msg.modelUsed.includes('Gemini') 
                        ? 'bg-purple-100 text-purple-700 border-purple-300' 
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {msg.modelUsed}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[92%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                  isBot
                    ? 'bg-white/95 text-slate-800 border-2 border-blue-200 rounded-tl-sm ring-1 ring-blue-500/10'
                    : 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                }`}
              >
                {/* Render formatted message content */}
                <div className="space-y-2 whitespace-pre-line font-medium text-slate-800">
                  {msg.text}
                </div>

                {/* If bot has special structured report data, render highlight cards */}
                {msg.reportData && (
                  <div className="mt-4 pt-3 border-t border-blue-100 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Quantified Loss Summary:</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {msg.reportData.losses.map((loss, lIdx) => (
                        <div key={lIdx} className="p-2.5 rounded-lg bg-[#eaf4ff] border border-blue-200">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{loss.label}</span>
                            <span className="text-amber-700 font-mono">{loss.value}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{loss.detail}</p>
                        </div>
                      ))}
                    </div>

                    {/* Suggestions Section */}
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 pt-2">
                      <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Actionable Loss Mitigation:</span>
                    </div>

                    <div className="space-y-2">
                      {msg.reportData.suggestions.map((sug, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-lg bg-[#eaf8f0] border border-emerald-200 text-emerald-950">
                          <p className="font-semibold text-emerald-900">{sug.priority}</p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">{sug.action}</p>
                          <p className="text-[10px] text-emerald-700 font-mono mt-1 font-semibold">↳ Impact: {sug.expectedSavings}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom toolbar for bot messages */}
                {isBot && (
                  <div className="mt-3 pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="hover:text-blue-700 transition-colors flex items-center gap-1 font-medium"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-blue-600" />
                          <span>Copy Response</span>
                        </>
                      )}
                    </button>

                    {addedMsgIds.has(msg.id) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Added to Audit Deck!</span>
                        </span>
                        {onOpenSlideDeck && (
                          <button
                            onClick={onOpenSlideDeck}
                            className="text-blue-700 hover:text-blue-800 font-semibold underline text-[11px]"
                          >
                            View in Deck
                          </button>
                        )}
                      </div>
                    ) : (
                      onAddObservationToSlide && (
                        <button
                          onClick={() => {
                            onAddObservationToSlide(msg.text, msg.reportData);
                            setAddedMsgIds((prev) => new Set(prev).add(msg.id));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300 font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="Add this AI observation as a slide in the audit presentation"
                        >
                          <Layers className="w-3.5 h-3.5 text-blue-700" />
                          <span>Add to Audit Slides</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-blue-200 w-fit shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-xs text-blue-800 font-medium">AuditSphere Chatbot generating narrative…</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box - Light Blue Footer */}
      <div className="p-3.5 sm:p-4 border-t border-blue-200 bg-[#e0efff] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask AuditSphere Chatbot about ${selectedDoc || 'maintenance files'} or loss suggestions…`}
            className="flex-1 bg-white border-2 border-blue-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 shadow-2xs font-medium"
          />

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`p-2.5 rounded-xl font-semibold transition-all ${
              inputValue.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="mt-2 text-[10px] text-blue-800 font-medium text-center">
          AuditSphere Chatbot grounded exclusively on your session's uploaded Plant Maintenance data.
        </p>
      </div>

      </div>
    </div>
  );
}
