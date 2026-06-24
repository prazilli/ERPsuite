'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2, RefreshCw, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyOtpForm() {
  const { verifyOtp, resendOtp } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(email, otp, 'registration');
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setError('');
    setSuccess('');
    setResending(true);

    try {
      await resendOtp(email, 'registration');
      setSuccess('A new verification code has been dispatched. Check the backend console output.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-panel rounded-2xl glow-shadow border border-white/5 p-8 relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Verify Your Email</h1>
        <p className="text-sm text-slate-400 mt-2">
          Enter the 6-digit security code sent to <strong className="text-slate-200">{email}</strong>
        </p>
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium flex gap-2 items-center">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-medium flex gap-2 items-center">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
            Enter 6-Digit OTP
          </label>
          <input
            type="text"
            maxLength={6}
            required
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full py-3 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all text-2xl tracking-widest text-center font-bold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            'Confirm Activation'
          )}
        </button>
      </form>

      {/* Resend actions */}
      <div className="mt-6 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {resending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Requesting new OTP...</span>
            </>
          ) : cooldown > 0 ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Code in {cooldown}s</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Verification Code</span>
            </>
          )}
        </button>

        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-all border-t border-white/5 pt-4 w-full justify-center mt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Registration</span>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <Suspense
        fallback={
          <div className="w-full max-w-md glass-panel rounded-2xl glow-shadow border border-white/5 p-8 relative z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-sm text-slate-400 mt-4">Loading verification session...</p>
          </div>
        }
      >
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
