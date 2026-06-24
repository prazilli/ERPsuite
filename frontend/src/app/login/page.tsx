'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, Lock, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, verifyOtp, requestPasswordReset, confirmPasswordReset } = useAuth();
  const router = useRouter();

  // Screen modes: 'login' | 'verify_registration' | 'forgot_password' | 'verify_reset'
  const [mode, setMode] = useState<'login' | 'verify_registration' | 'forgot_password' | 'verify_reset'>('login');
  
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.verified === false) {
        setSuccess('Please check the backend console for your 6-digit registration OTP.');
        setMode('verify_registration');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await verifyOtp(email, otp, 'registration');
      setSuccess('Account activated! You can now log in.');
      setMode('login');
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess('Reset code dispatched. Please check the backend console log for your 6-digit OTP.');
      setMode('verify_reset');
    } catch (err: any) {
      setError(err.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await confirmPasswordReset({ email, otp, newPassword });
      setSuccess('Password updated successfully. You can now log in.');
      setMode('login');
      setOtp('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#0b0f19] to-black p-4 relative overflow-hidden">
      {/* Technical Grid Overlay */}
      <div className="tech-grid"></div>

      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl glow-shadow border border-white/5 p-8 relative z-10 animate-fade-in-up">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-extrabold uppercase tracking-widest mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            Secure Enterprise Gateway
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/15">
              <div className="h-full w-full rounded-[10px] bg-[#090d16] flex items-center justify-center text-white">
                <KeyRound className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Amdox Technologies
          </h1>
          <p className="text-sm font-bold tracking-widest text-cyan-400/80 uppercase mt-1.5">
            AI-Powered Cloud ERP Suite
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-medium">
            {success}
          </div>
        )}

        {/* 1. Login Mode */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => { setError(''); setSuccess(''); setMode('forgot_password'); }}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* 2. OTP Registration Verification Mode */}
        {mode === 'verify_registration' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-slate-300 text-center mb-4">
              Enter the 6-digit OTP code to verify your administrator account.
            </p>
            <div>
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm tracking-widest text-center font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Verification'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-sm text-slate-400 hover:text-white transition-all mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* 3. Forgot Password Mode */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-slate-300 mb-4">
              Enter your email address and we will dispatch a 6-digit password reset verification code.
            </p>
            <div>
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Reset OTP'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-sm text-slate-400 hover:text-white transition-all mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* 4. Verify Reset Password Mode */}
        {mode === 'verify_reset' && (
          <form onSubmit={handleResetPasswordConfirm} className="space-y-4">
            <p className="text-sm text-slate-300 text-center mb-4">
              Check the backend log console for your OTP and set a new password.
            </p>

            <div>
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Reset Code (OTP)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm tracking-widest text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm New Password'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-center text-sm text-slate-400 hover:text-white transition-all mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Footer Links */}
        {mode === 'login' && (
          <div className="mt-8 border-t border-white/5 pt-6">
            <p className="text-center text-sm text-slate-500 font-bold uppercase tracking-wider mb-3">
              Registration Portals
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/register"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 transition-all text-center group cursor-pointer"
              >
                <span className="text-sm font-bold text-slate-400 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
                  New Tenant
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Register Company
                </span>
              </Link>
              <Link
                href="/join"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 transition-all text-center group cursor-pointer"
              >
                <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors uppercase tracking-wider">
                  Join Workspace
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  Join Company
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
