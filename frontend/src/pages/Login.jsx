import React, { useState } from 'react';
import { Lock, Mail, GraduationCap, ArrowRight, AlertCircle, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigateRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(result.error || 'Failed to authenticate.');
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 sm:p-8 transition-all">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome to StudentHub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Secure multi-service academic management authentication
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="mt-6 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Faculty & Assessment Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@studenthub.local', 'Admin@123')}
              className="px-2.5 py-1.5 rounded-xl text-left bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 text-[11px] text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors"
            >
              <div className="font-bold text-blue-600 dark:text-blue-400">Admin Demo</div>
              <div className="text-[10px] text-slate-400">admin@studenthub.local</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('faculty@studenthub.local', 'Faculty@123')}
              className="px-2.5 py-1.5 rounded-xl text-left bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 text-[11px] text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors"
            >
              <div className="font-bold text-indigo-600 dark:text-indigo-400">Faculty Demo</div>
              <div className="text-[10px] text-slate-400">faculty@studenthub.local</div>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@studenthub.local"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle to Register */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Need a new account? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Register new account
          </button>
        </div>

      </div>
    </div>
  );
}
