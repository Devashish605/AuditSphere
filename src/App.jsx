import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Step1Process from './components/Step1Process';
import Step2Checkpoints from './components/Step2Checkpoints';
import Step3Upload from './components/Step3Upload';
import Step4Analysis from './components/Step4Analysis';
import Step5Insights from './components/Step5Insights';
import NlgChatbot from './components/NlgChatbot';
import SlideReportModal from './components/SlideReportModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_FILES } from './data/auditData';
import { Bot } from 'lucide-react';

export default function App() {
  // Page routing state: 'launch' -> 'login' -> 'app'
  const [pageState, setPageState] = useState('launch');

  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Workflow steps: 1: Process, 2: Checkpoints, 3: Upload Data, 4: Analysis, 5: Insights
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Selected process (defaults to 'maintenance' which is the active one)
  const [selectedProcess, setSelectedProcess] = useState('maintenance');

  // Step 2: Checkpoints (Strictly the 2 requested: 'pm-compliance' and 'pm-effectiveness')
  const [selectedCheckpoints, setSelectedCheckpoints] = useState([
    'pm-compliance',
    'pm-effectiveness',
  ]);

  // Step 3: Uploaded files (Starts empty by default: 0 files uploaded)
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Chatbot-generated dynamic audit slides
  const [chatbotAuditSlides, setChatbotAuditSlides] = useState([]);

  // Custom uploaded PowerPoint template configuration
  const [pptTemplate, setPptTemplate] = useState({
    name: '',
    isCustom: false,
    companyName: 'AuditSphere Enterprise',
    primaryColor: '1A365D'
  });

  const handleAddObservationToSlide = (text, reportData) => {
    let title = 'Chatbot Observation';
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      const clean = lines[0].replace(/^[#*•\s\d.-]+/, '').trim();
      if (clean.length > 3 && clean.length < 90) {
        title = clean;
      }
    }
    const newSlide = {
      id: `c-slide-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      content: text,
      reportData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatbotAuditSlides(prev => [...prev, newSlide]);
    return newSlide;
  };

  const handleRemoveChatbotSlide = (slideId) => {
    setChatbotAuditSlides(prev => prev.filter(s => s.id !== slideId));
  };

  const handleUploadPptTemplate = (file) => {
    if (!file) return;
    setPptTemplate({
      name: file.name,
      isCustom: true,
      companyName: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
      primaryColor: '1A365D'
    });
  };

  const handleRemovePptTemplate = () => {
    setPptTemplate({
      name: '',
      isCustom: false,
      companyName: '',
      primaryColor: '1A365D'
    });
  };

  // Handler to open chatbot with a specific pre-filled NLG prompt
  const handleTriggerNlgPrompt = (promptText) => {
    setIsChatOpen(true);
  };

  // 1. First: Launch Page
  if (pageState === 'launch') {
    return (
      <LandingPage
        onLaunch={() => setPageState('login')}
      />
    );
  }

  // 2. Then: Login Page
  if (pageState === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setCurrentStep(1); // Always start from Process Selection page
          setPageState('app');
        }}
        onBackToLaunch={() => setPageState('launch')}
      />
    );
  }

  // 3. Process Selection Page onwards (Step 1 -> 5)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        selectedProcess={selectedProcess}
        selectedCheckpoints={selectedCheckpoints}
        onOpenSlide={() => setIsSlideOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onLogout={() => setPageState('login')}
      />

      {/* Main Workflow View with Error Isolation Shield */}
      <ErrorBoundary
        onLoadBenchmark={() => setUploadedFiles(INITIAL_FILES)}
        onNavigateToUpload={() => setCurrentStep(3)}
      >
        <main className="flex-1 pb-16">
          {currentStep === 1 && (
            <Step1Process
              selectedProcess={selectedProcess}
              setSelectedProcess={setSelectedProcess}
              onContinue={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step2Checkpoints
              selectedCheckpoints={selectedCheckpoints}
              setSelectedCheckpoints={setSelectedCheckpoints}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <Step3Upload
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              selectedCheckpoints={selectedCheckpoints}
              onBack={() => setCurrentStep(2)}
              onRunAnalysis={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <Step4Analysis
              uploadedFiles={uploadedFiles}
              onComplete={() => setCurrentStep(5)}
              onCancel={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <Step5Insights
              uploadedFiles={uploadedFiles}
              onRemoveFile={(fileId) => setUploadedFiles(prev => prev.filter(f => f.id !== fileId))}
              onAddFiles={(newDocs) => setUploadedFiles(prev => [...prev, ...newDocs])}
              onOpenSlide={() => setIsSlideOpen(true)}
              onToggleChat={() => setIsChatOpen(true)}
              onTriggerNlgPrompt={handleTriggerNlgPrompt}
              onNavigateToUpload={() => setCurrentStep(3)}
              onLoadBenchmarkData={() => setUploadedFiles(INITIAL_FILES)}
              chatbotAuditSlides={chatbotAuditSlides}
              pptTemplate={pptTemplate}
              onUploadPptTemplate={handleUploadPptTemplate}
              onRemovePptTemplate={handleRemovePptTemplate}
            />
          )}
        </main>
      </ErrorBoundary>

      {/* Floating Action Button for AuditSphere Chatbot if closed */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border-2 border-blue-400 shadow-xl shadow-blue-500/20 flex items-center gap-3 transition-all hover:scale-105 group font-bold"
          title="Open AuditSphere Chatbot"
        >
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide text-blue-900">AuditSphere Chatbot</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>
      )}

      {/* Interactive AuditSphere Chatbot Drawer */}
      <NlgChatbot
        uploadedFiles={uploadedFiles}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onAddObservationToSlide={handleAddObservationToSlide}
        onOpenSlideDeck={() => setIsSlideOpen(true)}
        onLoadBenchmarkData={() => setUploadedFiles(INITIAL_FILES)}
        onNavigateToUpload={() => {
          setCurrentStep(3);
          setIsChatOpen(false);
        }}
      />

      {/* Executive Audit Observation Slide (PPT) Modal */}
      <SlideReportModal
        isOpen={isSlideOpen}
        onClose={() => setIsSlideOpen(false)}
        chatbotAuditSlides={chatbotAuditSlides}
        onRemoveChatbotSlide={handleRemoveChatbotSlide}
        pptTemplate={pptTemplate}
        onUploadTemplate={handleUploadPptTemplate}
        onRemoveTemplate={handleRemovePptTemplate}
        uploadedFiles={uploadedFiles}
      />

    </div>
  );
}
