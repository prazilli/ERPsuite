'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { DepartmentHeadDashboard } from './components/DepartmentHeadDashboard';
import { CEODashboard } from './components/CEODashboard';
import { AlertCircle } from 'lucide-react';

export default function DashboardPortal() {
  const { user, apiFetch, loading: authLoading } = useAuth();

  // 1. Employee Dashboard query hook
  const {
    data: employeeData,
    isLoading: employeeLoading,
    refetch: refetchEmployee,
    isFetching: isFetchingEmployee,
    error: employeeError,
  } = useQuery({
    queryKey: ['dashboard', 'employee', user?.id],
    queryFn: () => apiFetch('/dashboard/employee'),
    enabled: !!user && user.role === 'Employee',
  });

  // 2. Department Head Dashboard query hook
  const {
    data: deptHeadData,
    isLoading: deptHeadLoading,
    refetch: refetchDeptHead,
    isFetching: isFetchingDeptHead,
    error: deptHeadError,
  } = useQuery({
    queryKey: ['dashboard', 'dept-head', user?.id],
    queryFn: () => apiFetch('/dashboard/department-head'),
    enabled: !!user && (user.role === 'Department Head' || user.role === 'Company Head / CEO'),
  });

  // 3. CEO Dashboard query hook
  const {
    data: ceoData,
    isLoading: ceoLoading,
    refetch: refetchCeo,
    isFetching: isFetchingCeo,
    error: ceoError,
  } = useQuery({
    queryKey: ['dashboard', 'ceo', user?.id],
    queryFn: () => apiFetch('/dashboard/ceo'),
    enabled: !!user && user.role === 'Company Head / CEO',
  });

  // Handle initial session check loading
  if (authLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <span className="text-sm font-semibold tracking-wider block animate-pulse">Authenticating secure session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Layout redirects to login
  }

  // Handle active data query loading
  const isLoading =
    (user.role === 'Employee' && employeeLoading) ||
    (user.role === 'Department Head' && deptHeadLoading) ||
    (user.role === 'Company Head / CEO' && ceoLoading);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Handle general API errors
  const error =
    (user.role === 'Employee' && employeeError) ||
    (user.role === 'Department Head' && deptHeadError) ||
    (user.role === 'Company Head / CEO' && ceoError);

  if (error) {
    return (
      <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-6 text-center space-y-3 max-w-md mx-auto mt-12 animate-fade-in">
        <div className="mx-auto w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <AlertCircle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-rose-200">Failed to Load Dashboard</h4>
          <p className="text-sm text-rose-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {(error as any)?.message || 'An unexpected error occurred while compiling ERP telemetry. Please retry.'}
          </p>
        </div>
        <button
          onClick={() => {
            if (user.role === 'Employee') refetchEmployee();
            else if (user.role === 'Department Head') refetchDeptHead();
            else if (user.role === 'Company Head / CEO') refetchCeo();
          }}
          className="px-3.5 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/20 rounded-lg text-sm font-semibold text-rose-200 cursor-pointer transition-all"
        >
          Retry Fetching Data
        </button>
      </div>
    );
  }

  // Render designated view based on logged in authority level
  switch (user.role) {
    case 'Employee':
      return <EmployeeDashboard data={employeeData} refetch={refetchEmployee} isFetching={isFetchingEmployee} />;

    case 'Department Head':
      return <DepartmentHeadDashboard data={deptHeadData} refetch={refetchDeptHead} isFetching={isFetchingDeptHead} />;

    case 'Company Head / CEO':
      // CEO has access to both Executive center and Department Head overview
      // Let's toggle between the two if they want, or render Executive Dashboard as default
      return <CEODashboard data={ceoData} refetch={refetchCeo} isFetching={isFetchingCeo} />;

    default:
      // Fallback for Super Admin / Auditor
      return <CEODashboard data={ceoData} refetch={refetchCeo} isFetching={isFetchingCeo} />;
  }
}
