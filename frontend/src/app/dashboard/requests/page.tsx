'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, FileCode, Check, X, ShieldAlert } from 'lucide-react';

export default function RequestsPage() {
  const { user, apiFetch } = useAuth();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiFetch(`/requests?companyId=${user.companyId}`);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleApprove = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/requests/${id}/approve`, { method: 'POST' });
      setSuccess('Request approved! The department has been created, and the requester upgraded to Department Head.');
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id: number) => {
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/requests/${id}/reject`, { method: 'POST' });
      setSuccess('Request rejected.');
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Rejection failed');
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Fetching requests board...
      </div>
    );
  }

  const isCompanyAdmin = user?.role === 'Company Head / CEO' || user?.role === 'Company Admin' || user?.role === 'Super Admin';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Department Creation Requests</h2>
        <p className="text-sm text-text-muted">Review, approve, or decline proposals for corporate extensions and new departments</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
          {success}
        </div>
      )}

      {/* Requests Registry Card */}
      <div className="glass-panel rounded-2xl border border-white/5 glow-shadow overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Requests Pipeline</h3>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No department creation requests logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                <tr>
                  <th className="py-3.5 px-6">Requester</th>
                  <th className="py-3.5 px-6">Proposed Department Name</th>
                  <th className="py-3.5 px-6">Justification</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  {isCompanyAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-all">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{r.requestedBy?.name}</div>
                      <div className="text-sm text-text-muted">{r.requestedBy?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-cyan-400">{r.departmentName}</td>
                    <td className="py-4 px-6 max-w-xs truncate text-text-muted">{r.description || 'N/A'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        r.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : r.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    {isCompanyAdmin && (
                      <td className="py-4 px-6 text-right">
                        {r.status === 'pending' ? (
                          <div className="flex justify-end gap-2.5">
                            <button
                              onClick={() => handleApprove(r.id)}
                              className="p-1.5 rounded-lg bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white cursor-pointer transition-all flex items-center gap-1 text-sm font-bold"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              className="p-1.5 rounded-lg bg-red-600/15 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer transition-all flex items-center gap-1 text-sm font-bold"
                            >
                              <X className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-text-muted">Processed</span>
                        )}
                      </td>
                    )}
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
