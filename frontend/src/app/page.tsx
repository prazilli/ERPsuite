'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <span className="text-sm font-semibold tracking-wider text-slate-400">Verifying session token...</span>
    </div>
  );
}
