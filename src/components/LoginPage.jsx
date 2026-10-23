import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Building2,
  Check,
  UserPlus,
  X,
  Mail,
  Briefcase,
  Factory
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onBackToLaunch }) {
  const [networkId, setNetworkId] = useState('user@auditsphere.ai');
  const [password, setPassword] = useState('AuditSphere@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Create Profile Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('User');
  const [newProfileEmail, setNewProfileEmail] = useState('user@auditsphere.ai');
  const [newProfileRole, setNewProfileRole] = useState('Plant Maintenance Lead Auditor');
  const [newProfilePlant, setNewProfilePlant] = useState('CHETAK & Enterprise Wide');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 500);
  };

  const handleCreateProfileSubmit = (e) => {
    e.preventDefault();
    setIsCreatingProfile(true);
    setTimeout(() => {
      setIsCreatingProfile(false);
      setShowCreateModal(false);
      setNetworkId(newProfileEmail);
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
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

          <div className="flex items-center gap-2.5">
            {/* Create Profile Button in Header (Button 1) */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-2xs"
              title="Create a new Enterprise Audit Profile"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Create Profile</span>
            </button>

            <button
              onClick={onBackToLaunch}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Launch Page</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          
          {/* Subtle Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20 mb-4">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Enterprise AD Sign In
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              One secure sign-in for your Manufacturing Audit Workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            
            {/* Network ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={networkId}
                  onChange={(e) => setNetworkId(e.target.value)}
                  placeholder="e.g. user@auditsphere.ai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-medium shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-medium font-mono shadow-2xs"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-slate-700">Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset request sent to Enterprise Directory Admin.')}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Dual Action Buttons: Sign in & Create Profile (Button 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-2xs"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Create Profile</span>
              </button>
            </div>

          </form>

          {/* Quick Demo Access Note */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500">
              Demo Credentials pre-filled for <strong className="text-slate-800 font-semibold">User</strong> (<span className="font-mono text-blue-700">user@auditsphere.ai</span>). Click <strong>Sign in</strong> or <strong>Create Profile</strong> to begin.
            </p>
          </div>

        </div>
      </main>

      {/* CREATE PROFILE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Create Audit Profile</h3>
                <p className="text-xs text-slate-500">Register new enterprise auditor credentials for AuditSphere</p>
              </div>
            </div>

            <form onSubmit={handleCreateProfileSubmit} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="User"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium shadow-2xs"
                  />
                </div>
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Corporate Email / Network ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={newProfileEmail}
                    onChange={(e) => setNewProfileEmail(e.target.value)}
                    placeholder="user@auditsphere.ai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium shadow-2xs"
                  />
                </div>
              </div>

              {/* Auditor Role */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Auditor Role / Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newProfileRole}
                    onChange={(e) => setNewProfileRole(e.target.value)}
                    placeholder="Plant Maintenance Lead Auditor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium shadow-2xs"
                  />
                </div>
              </div>

              {/* Plant / Site Assignment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Plant / Division
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Factory className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newProfilePlant}
                    onChange={(e) => setNewProfilePlant(e.target.value)}
                    placeholder="CHETAK & Enterprise Wide"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium shadow-2xs"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProfile}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                >
                  {isCreatingProfile ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      <span>Creating Profile…</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Create Profile & Sign In</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AuditSphere • Enterprise Internal Audit Platform</span>
          <span className="font-mono text-[11px] text-slate-500">Single Sign-On • TLS 1.3 Encryption</span>
        </div>
      </footer>

    </div>
  );
}
