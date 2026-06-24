'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldCheck, ShieldAlert, Calendar, Laptop, RefreshCw } from 'lucide-react';

export default function AuditPage() {
  const { user, apiFetch } = useAuth();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchLogs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch(`/audit/login-logs?companyId=${user.companyId}`);
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch security audit logs. You may not have access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Compiling audit log registry...
      </div>
    );
  }

  // Display access warning if API failed due to forbidden response
  if (error && error.toLowerCase().includes('forbidden')) {
    return (
      <div className="glass-panel rounded-2xl border border-red-500/20 bg-red-500/5 p-8 max-w-2xl mx-auto text-center space-y-4 my-12">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-2">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">Access Restricted</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Your current user role (<span className="text-red-400 font-bold">{user?.role}</span>) does not possess compliance clearance to view the security audit logs database. If this is an error, please contact your Company Administrator.
        </p>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    if (filterStatus === 'ALL') return true;
    return log.status.toUpperCase() === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Security Auditing</h2>
          <p className="text-sm text-text-muted">Real-time log tracing of SSO login queries, IP registries, and compliance items</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status selector */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border-color bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Log Statuses</option>
            <option value="SUCCESS">Success Logs</option>
            <option value="FAILED">Failed Attempts</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-lg border border-border-color bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-white/5 glow-shadow overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Login Security Trail</h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No security logs recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Identified User</th>
                  <th className="py-3.5 px-6">IP Registry</th>
                  <th className="py-3.5 px-6">Client Browser Agent</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6">Log Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-all">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-text-muted text-sm">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {new Date(log.loginTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-white">{log.user?.name || 'Unregistered Attempt'}</div>
                      <div className="text-sm text-text-muted">{log.emailAttempted}</div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-sm">{log.ipAddress}</td>
                    <td className="py-3.5 px-6 max-w-xs truncate text-sm text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                        {log.userAgent || 'Unknown Client'}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 max-w-xs truncate text-red-400 font-semibold text-sm">
                      {log.failureReason || <span className="text-emerald-400 font-medium">Clear / Authenticated</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
