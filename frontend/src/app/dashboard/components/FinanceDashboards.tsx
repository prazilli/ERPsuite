'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  PlusCircle,
  CheckCircle,
  Loader2,
  Calendar
} from 'lucide-react';

/* 1. FINANCE HEAD DASHBOARD */
interface Props {
  metrics: any;
}

export const FinanceHeadDashboard: React.FC<Props> = ({ metrics }) => {
  const data = metrics || {
    apAmount: 45000,
    arAmount: 89000,
    budgetAllocated: 500000,
    recentTransactions: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Financial Dashboard</h2>
          <p className="text-sm text-text-muted">Corporate general ledger accounts, AP/AR ledgers, and budgets</p>
        </div>
        <span className="text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Finance Head
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Accounts Receivable (AR)', val: `$${data.arAmount.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Accounts Payable (AP)', val: `$${data.apAmount.toLocaleString()}`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/5' },
          { label: 'Allocated Operations Budget', val: `$${data.budgetAllocated.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/5' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel rounded-xl p-5 border border-white/5 glow-shadow flex items-center justify-between">
            <div>
              <span className="text-sm uppercase font-bold text-text-muted tracking-wider">{kpi.label}</span>
              <h3 className="text-xl font-bold text-white mt-1.5">{kpi.val}</h3>
            </div>
            <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Ledger Transactions */}
      <div className="glass-panel rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" /> Recent Ledger Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
              <tr>
                <th className="py-3 px-4">Transaction Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(data.recentTransactions || []).map((t: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-all">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    {t.date}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{t.desc}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-sm">{t.category}</span>
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

/* 2. FINANCE EMPLOYEE DASHBOARD */
export const FinanceEmployeeDashboard: React.FC = () => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Software');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-004', client: 'Oracle Services Inc', due: '2026-06-30', amount: 15400, status: 'Pending Review' },
    { id: 'INV-2026-003', client: 'SAP License Provider', due: '2026-06-25', amount: 4800, status: 'Assigned to Me' },
  ]);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setSubmitting(true);

    setTimeout(() => {
      setSuccess('Expense request submitted successfully to Department Head for approval.');
      setDesc('');
      setAmount('');
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Finance Workspace</h2>
          <p className="text-sm text-text-muted">Invoices inbox, expense allocations, and ledger entries</p>
        </div>
        <span className="text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Finance Employee
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Invoice Inbox */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Assigned Invoice Actions</h3>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center hover:border-slate-700 transition-all">
                <div>
                  <div className="text-sm font-bold text-white">{inv.client}</div>
                  <div className="text-sm text-text-muted mt-0.5">Due: {inv.due} | Ref: {inv.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">${inv.amount.toLocaleString()}</div>
                  <span className="inline-block text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded mt-1.5 font-bold uppercase">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submit Expense Request */}
        <div className="glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-cyan-400" /> Submit Expense Request
          </h3>

          {success && (
            <div className="mb-4 p-2.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleExpenseSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Production Host Fees"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
                >
                  <option value="Software">Software</option>
                  <option value="Travel">Travel</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all mt-4"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Request Reimbursement <CheckCircle className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
