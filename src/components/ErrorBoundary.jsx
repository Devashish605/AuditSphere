import React from 'react';
import { AlertTriangle, RefreshCw, Upload, Database, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AuditSphere ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <span className="inline-block text-[10px] font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-rose-100 text-rose-700 mb-3">
              Render Isolation Shield Active
            </span>

            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Audit Data Render Shield Triggered
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              An unexpected column structure or non-standard format in the uploaded document caused a view rendering exception. Your system state is protected and no data was lost.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-slate-900 text-left overflow-x-auto text-xs font-mono text-rose-300">
                <p className="font-bold text-rose-400 mb-1">Exception Details:</p>
                <p className="text-slate-300 break-words">{this.state.error.toString()}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recover &amp; Retry View</span>
              </button>

              {this.props.onLoadBenchmark && (
                <button
                  onClick={() => {
                    this.handleReset();
                    this.props.onLoadBenchmark();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Load Benchmark Data</span>
                </button>
              )}

              {this.props.onNavigateToUpload && (
                <button
                  onClick={() => {
                    this.handleReset();
                    this.props.onNavigateToUpload();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Upload Fresh Document</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
