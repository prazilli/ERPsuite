'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  CheckSquare,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  XCircle,
  FileSpreadsheet,
  Heart,
  MessageSquare
} from 'lucide-react';

export default function ApprovalsPage() {
  const { user, apiFetch } = useAuth();

  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Processing approval modal / comment state
  const [actingApproval, setActingApproval] = useState<any | null>(null);
  const [actType, setActType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadApprovals = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const list = await apiFetch('/approvals/pending');
      setApprovals(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load pending approval list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [user]);

  const openActionModal = (appr: any, action: 'APPROVED' | 'REJECTED') => {
    setActingApproval(appr);
    setActType(action);
    setComments('');
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actingApproval) return;
    setError(''); setSuccess(''); setProcessing(true);
    try {
      await apiFetch(`/approvals/${actingApproval.approval_id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: actType,
          comments: comments || `${actType} via workflow board.`,
        }),
      });
      setSuccess(`Request successfully ${actType.toLowerCase()}.`);
      setActingApproval(null);
      loadApprovals();
    } catch (e: any) {
      setError(e.message || 'Approval action failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Syncing approvals stack...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" /> Executive Workflow & Approvals Board
          </h2>
          <p className="text-sm text-text-muted">Process leave requests, supplier invoices, and reimbursements</p>
        </div>

        <button
          onClick={loadApprovals}
          className="p-2 rounded-lg border border-border-color bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-medium animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-400 font-medium animate-fade-in">
          {success}
        </div>
      )}

      {/* Approvals list */}
      <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pending Action Items ({approvals.length})</h3>
        </div>

        {approvals.length === 0 ? (
          <div className="p-16 text-center text-sm text-text-muted space-y-2">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
            <h4 className="font-bold text-white">All Clear!</h4>
            <p>There are no pending workflow items in your queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {approvals.map((appr) => {
              // Determine card colors and values based on polymorphic module type
              let cardTitle = 'Workflow Request';
              let cardDetails = `Record reference ID: #${appr.record_id}`;
              let Icon = CheckSquare;
              let badgeColor = 'bg-cyan-500/10 text-cyan-400';

              if (appr.module === 'LEAVE_REQUEST') {
                cardTitle = 'Employee Leave Request';
                cardDetails = 'Annual leave allocation request';
                Icon = Heart;
                badgeColor = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
              } else if (appr.module === 'EXPENSE') {
                cardTitle = 'Reimbursement Claim';
                cardDetails = 'Operating software / utilities claim';
                Icon = DollarSign;
                badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              } else if (appr.module === 'VENDOR_BILL') {
                cardTitle = 'Accounts Payable Vendor Bill';
                cardDetails = 'Supplier hosting / services bill';
                Icon = FileSpreadsheet;
                badgeColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
              }

              return (
                <div key={appr.approval_id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/10 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{cardTitle}</h4>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
                          {appr.module}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mt-0.5">{cardDetails}</p>
                      
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-400 font-medium bg-slate-950/20 border border-white/5 rounded px-2.5 py-1">
                        <span>Requester: {appr.requested_by?.first_name || 'Workflow Origin'}</span>
                        <span>|</span>
                        <span>Role: {appr.requested_by?.role?.role_name || appr.requested_by?.role || 'Employee'}</span>
                        <span>|</span>
                        <span>Logged: {new Date(appr.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(appr, 'APPROVED')}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => openEditModal(appr, 'REJECTED')}
                      className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-sm font-bold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Process Action Comments */}
      {actingApproval && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Workflow: {actType === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
              </h3>
              
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1.5">Approver Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Enter compliance or audit notes..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActingApproval(null)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className={`px-5 py-2 rounded-lg text-sm font-bold text-white cursor-pointer flex items-center gap-1.5 ${
                      actType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                    }`}
                  >
                    {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Action'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // Helper alias to use modal trigger state correctly
  function openEditModal(appr: any, action: 'APPROVED' | 'REJECTED') {
    openActionModal(appr, action);
  }
}
