'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building, Settings, CheckCircle, Loader2, AlertCircle, Globe, Shield } from 'lucide-react';
import { useCompanyProfile, useUpdateCompanyProfile } from '@/hooks/useAdminQueries';

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch profile via our react-query hook
  const { data: company, isLoading, error } = useCompanyProfile(user?.companyId ? user.companyId.toString() : '');
  const updateCompanyMutation = useUpdateCompanyProfile(user?.companyId ? user.companyId.toString() : '');

  useEffect(() => {
    if (company) {
      setCompanyName(company.company_name);
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateCompanyMutation.mutateAsync({ companyName });
      setSuccessMsg('Company settings updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update company profile.');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Loading company configurations...
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span>Failed to load company details: {(error as any)?.message || 'Unknown error'}</span>
      </div>
    );
  }

  const isCompanyAdmin = user?.role === 'Company Head / CEO' || user?.role === 'Company Admin' || user?.role === 'Super Admin';

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-cyan-400" />
          <span>Company Settings</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">Configure company-wide policies, profile information, and tenant structures.</p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl border border-white/5 glow-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>General Settings</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  disabled={!isCompanyAdmin}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Company Structure / Type</label>
                <select
                  disabled
                  value={company.company_type}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-400 text-sm focus:outline-none focus:border-cyan-500 cursor-not-allowed"
                >
                  <option value="SINGLE">Single Company Tenant</option>
                  <option value="MULTI">Multi Company Tenant</option>
                </select>
                <p className="text-sm text-slate-500 mt-1">Tenant structure type is locked at onboarding and cannot be changed.</p>
              </div>

              {isCompanyAdmin && (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updateCompanyMutation.isPending}
                    className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {updateCompanyMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>Save Configurations</>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-white/5 glow-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Tenant Metadata</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="pb-2.5 border-b border-white/5">
                <span className="text-sm font-semibold uppercase text-slate-500 block">Tenant Reference ID</span>
                <span className="text-slate-300 font-mono break-all">{company.tenant_id?.toString() || 'System Bound'}</span>
              </div>
              <div className="pb-2.5 border-b border-white/5">
                <span className="text-sm font-semibold uppercase text-slate-500 block">Company Unique ID</span>
                <span className="text-slate-300 font-mono break-all">{company.company_id?.toString()}</span>
              </div>
              <div>
                <span className="text-sm font-semibold uppercase text-slate-500 block">Onboarded Since</span>
                <span className="text-slate-300">{company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/5 glow-shadow p-6 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Shield className="w-4 h-4" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tenant Bound</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your company data is completely isolated under tenant boundaries. Only users authenticated with matching tenant credentials can view these settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
