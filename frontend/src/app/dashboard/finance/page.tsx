'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  Plus,
  Users,
  CreditCard,
  Briefcase
} from 'lucide-react';

export default function FinancePage() {
  const { user, apiFetch } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'invoices' | 'expenses' | 'bills' | 'vendors'>('analytics');
  const [loading, setLoading] = useState(true);
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States: New Invoice
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invClientId, setInvClientId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  // Form States: New Expense
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState('Software');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Form States: New Bill
  const [showBillModal, setShowBillModal] = useState(false);
  const [billVendorId, setBillVendorId] = useState('');
  const [billNum, setBillNum] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [submittingBill, setSubmittingBill] = useState(false);

  // Form States: New Vendor
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vName, setVName] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [submittingVendor, setSubmittingVendor] = useState(false);

  // Form States: Pay Invoice
  const [payingInvoice, setPayingInvoice] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');

      const listInvs = await apiFetch('/finance/invoices');
      const listExps = await apiFetch('/finance/expenses');
      const listBills = await apiFetch('/finance/vendor-bills');
      const listVends = await apiFetch('/finance/vendors');
      const financialAn = await apiFetch('/finance/analytics');
      const clientsList = await apiFetch('/crm/clients');

      setInvoices(listInvs);
      setExpenses(listExps);
      setBills(listBills);
      setVendors(listVends);
      setAnalytics(financialAn);
      setClients(clientsList);

    } catch (e: any) {
      setError(e.message || 'Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingInvoice(true);
    try {
      await apiFetch('/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({
          clientId: parseInt(invClientId, 10),
          amount: parseFloat(invAmount),
          dueDate: invDueDate,
        })
      });
      setSuccess('Invoice generated and logged successfully.');
      setInvClientId(''); setInvAmount(''); setInvDueDate('');
      setShowInvoiceModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Invoice generation failed.');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingExpense(true);
    try {
      await apiFetch('/finance/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category: expCategory,
          amount: parseFloat(expAmount),
          description: expDesc,
        })
      });
      setSuccess('Expense reimbursement claim submitted to approvals workflow.');
      setExpCategory('Software'); setExpAmount(''); setExpDesc('');
      setShowExpenseModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Expense submission failed.');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingBill(true);
    try {
      await apiFetch('/finance/vendor-bills', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: parseInt(billVendorId, 10),
          billNumber: billNum,
          amount: parseFloat(billAmount),
          dueDate: billDueDate,
        })
      });
      setSuccess('Vendor invoice logged. Sent to executive approvals board.');
      setBillVendorId(''); setBillNum(''); setBillAmount(''); setBillDueDate('');
      setShowBillModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to register vendor bill.');
    } finally {
      setSubmittingBill(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingVendor(true);
    try {
      await apiFetch('/finance/vendors', {
        method: 'POST',
        body: JSON.stringify({
          name: vName,
          email: vEmail,
          phone: vPhone,
        })
      });
      setSuccess(`Vendor "${vName}" registered in compliance registry.`);
      setVName(''); setVEmail(''); setVPhone('');
      setShowVendorModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Vendor registration failed.');
    } finally {
      setSubmittingVendor(false);
    }
  };

  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setError(''); setSuccess(''); setProcessingPayment(true);
    try {
      await apiFetch(`/finance/invoices/${payingInvoice.invoice_id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod: payMethod,
          amount: payingInvoice.amount,
        })
      });
      setSuccess('Payment confirmed and invoice marked as PAID.');
      setPayingInvoice(null);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Payment confirmation failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Syncing general ledger...
      </div>
    );
  }

  const kpis = analytics || { totalRevenue: 0, totalExpenses: 0, apAmount: 0, arAmount: 0, netIncome: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> General Finance & Billing Ledgers
          </h2>
          <p className="text-sm text-text-muted">Accounts receivables, reimbursements workflow, and corporate payables</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'invoices' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Issue Invoice
            </button>
          )}
          {activeTab === 'expenses' && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Claim Reimbursement
            </button>
          )}
          {activeTab === 'bills' && (
            <button
              onClick={() => setShowBillModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Log Vendor Bill
            </button>
          )}
          {activeTab === 'vendors' && (
            <button
              onClick={() => setShowVendorModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Register Vendor
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2 rounded-lg border border-border-color bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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

      {/* Workspace Tabs */}
      <div className="flex border-b border-white/5 gap-4 overflow-x-auto">
        {[
          { key: 'analytics', label: 'Financial Analytics' },
          { key: 'invoices', label: 'Client Invoices' },
          { key: 'expenses', label: 'Operating Expenses' },
          { key: 'bills', label: 'Vendor Bills' },
          { key: 'vendors', label: 'Vendors Directory' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === tab.key ? 'text-emerald-400 font-black' : 'text-text-muted hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Gross Collections', val: `$${kpis.totalRevenue?.toLocaleString()}`, desc: 'Total invoice receipts', icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'Operating Costs', val: `$${kpis.totalExpenses?.toLocaleString()}`, desc: 'Total bills & claims', icon: TrendingDown, color: 'text-red-400' },
              { label: 'Accounts Receivable', val: `$${kpis.arAmount?.toLocaleString()}`, desc: 'Awaiting client transfers', icon: FileSpreadsheet, color: 'text-blue-400' },
              { label: 'Accounts Payable', val: `$${kpis.apAmount?.toLocaleString()}`, desc: 'Awaiting executive approval', icon: FileSpreadsheet, color: 'text-purple-400' },
              { label: 'Net Operating Income', val: `$${kpis.netIncome?.toLocaleString()}`, desc: 'General ledger surplus', icon: DollarSign, color: kpis.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400' },
            ].map((stat, idx) => (
              <div key={idx} className="glass-panel rounded-2xl border border-white/5 p-5 glow-shadow flex flex-col justify-between hover:scale-[1.01] transition-all">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">{stat.label}</span>
                <h3 className={`text-lg font-black mt-2 ${stat.color}`}>{stat.val}</h3>
                <span className="text-xs text-text-muted mt-1 block">{stat.desc}</span>
              </div>
            ))}
          </div>

          {/* Simple Visual Cash Flow Ledger */}
          <div className="glass-panel border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Cash Flow Analysis (Invoices vs Bills)</h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1 bg-slate-900 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-text-muted uppercase">Invoiced Pipeline</span>
                  <h4 className="text-sm font-black text-emerald-400">${(kpis.totalRevenue + kpis.arAmount)?.toLocaleString()}</h4>
                </div>
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-text-muted font-bold text-sm">-</span>
              <div className="flex-1 bg-slate-900 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-text-muted uppercase">Payables Pipeline</span>
                  <h4 className="text-sm font-black text-red-400">${(kpis.totalExpenses + kpis.apAmount)?.toLocaleString()}</h4>
                </div>
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> Client Invoice Directory
            </h3>
          </div>
          
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No invoices generated.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                  <tr>
                    <th className="py-3.5 px-6">Reference ID</th>
                    <th className="py-3.5 px-6">Client Name</th>
                    <th className="py-3.5 px-6">Issue Date</th>
                    <th className="py-3.5 px-6 text-right">Invoice Amount</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.invoice_id} className="hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-6 font-mono font-semibold text-white">INV-{inv.invoice_id}</td>
                      <td className="py-3.5 px-6">{inv.client?.client_name || 'Internal / Unassigned'}</td>
                      <td className="py-3.5 px-6 text-text-muted">{new Date(inv.issue_date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-6 text-right font-bold text-emerald-400">${inv.amount?.toLocaleString()}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {inv.status === 'UNPAID' && (
                          <button
                            onClick={() => setPayingInvoice(inv)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer transition-all"
                          >
                            Collect Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Operating Expenses Claims
            </h3>
          </div>
          
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No operating claims logged.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                  <tr>
                    <th className="py-3.5 px-6">Claimant Name</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6 text-right">Amount Claimed</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((exp) => (
                    <tr key={exp.expense_id} className="hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-6 font-semibold text-white">{exp.user?.first_name} {exp.user?.last_name}</td>
                      <td className="py-3.5 px-6">{exp.category}</td>
                      <td className="py-3.5 px-6 max-w-xs truncate">{exp.description}</td>
                      <td className="py-3.5 px-6 text-right font-bold text-emerald-400">${exp.amount?.toLocaleString()}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          exp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : exp.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> Accounts Payables (Vendor Bills)
            </h3>
          </div>
          
          {bills.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No vendor invoices recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                  <tr>
                    <th className="py-3.5 px-6">Bill Number</th>
                    <th className="py-3.5 px-6">Vendor Company</th>
                    <th className="py-3.5 px-6">Due Date</th>
                    <th className="py-3.5 px-6 text-right">Invoice Amount</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bills.map((bill) => (
                    <tr key={bill.bill_id} className="hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-6 font-mono font-semibold text-white">{bill.bill_number}</td>
                      <td className="py-3.5 px-6">{bill.vendor?.name}</td>
                      <td className="py-3.5 px-6 text-text-muted">{new Date(bill.due_date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-6 text-right font-bold text-emerald-400">${bill.amount?.toLocaleString()}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          bill.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : bill.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" /> Supplier & Vendors Registry
            </h3>
          </div>
          
          {vendors.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No vendors registered.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                  <tr>
                    <th className="py-3.5 px-6">Vendor Name</th>
                    <th className="py-3.5 px-6">Email Contact</th>
                    <th className="py-3.5 px-6">Support Phone</th>
                    <th className="py-3.5 px-6">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vendors.map((v) => (
                    <tr key={v.vendor_id} className="hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-6 font-semibold text-white">
                        {v.name}
                        <span className="block text-xs text-text-muted">ID: #{v.vendor_id}</span>
                      </td>
                      <td className="py-3.5 px-6">{v.email}</td>
                      <td className="py-3.5 px-6">{v.phone || 'No phone'}</td>
                      <td className="py-3.5 px-6 text-text-muted">{new Date(v.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Issue Invoice */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" /> Issue Client Invoice
              </h3>
              
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Select Client Account</label>
                  <select
                    value={invClientId}
                    onChange={(e) => setInvClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    required
                  >
                    <option value="">Select Account</option>
                    {clients.map((c) => (
                      <option key={c.client_id} value={c.client_id}>{c.client_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Due Date</label>
                    <input
                      type="date" required
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Total Amount ($)</label>
                    <input
                      type="number" required
                      placeholder="e.g. 15000"
                      value={invAmount}
                      onChange={(e) => setInvAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvoice}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingInvoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Log Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Claim Reimbursement */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" /> Log Operating Expense
              </h3>
              
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Expense Category</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    >
                      <option value="Software">Software</option>
                      <option value="Travel">Travel</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Utilities">Utilities</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Claim Amount ($)</label>
                    <input
                      type="number" required
                      placeholder="e.g. 250"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Description / Notes</label>
                  <textarea
                    required rows={2}
                    placeholder="Provide details about the spend items..."
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingExpense}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingExpense ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Log Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Vendor Bill */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" /> Log Vendor Bill
              </h3>
              
              <form onSubmit={handleCreateBill} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Select Supplier</label>
                    <select
                      value={billVendorId}
                      onChange={(e) => setBillVendorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map((v) => (
                        <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Bill Reference ID</label>
                    <input
                      type="text" required
                      placeholder="e.g. BILL-9201"
                      value={billNum}
                      onChange={(e) => setBillNum(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Due Date</label>
                    <input
                      type="date" required
                      value={billDueDate}
                      onChange={(e) => setBillDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Total Due ($)</label>
                    <input
                      type="number" required
                      placeholder="e.g. 5200"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBillModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBill}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingBill ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Log Bill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register Vendor */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" /> Register Supplier profile
              </h3>
              
              <form onSubmit={handleCreateVendor} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Supplier Company Name</label>
                  <input
                    type="text" required
                    placeholder="e.g. AWS Cloud Hosting Inc"
                    value={vName}
                    onChange={(e) => setVName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Corporate Email</label>
                    <input
                      type="email" required
                      placeholder="e.g. billing@aws.amazon.com"
                      value={vEmail}
                      onChange={(e) => setVEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Support Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 888-297-1111"
                      value={vPhone}
                      onChange={(e) => setVPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVendorModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingVendor}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingVendor ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Register Vendor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Process Payment */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" /> Collect Payment: INV-{payingInvoice.invoice_id}
              </h3>
              
              <form onSubmit={handlePayInvoice} className="space-y-4">
                <div>
                  <span className="text-sm text-text-muted uppercase block">Invoice Balance</span>
                  <h4 className="text-lg font-black text-emerald-400">${payingInvoice.amount?.toLocaleString()}</h4>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Collection Channel</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                  >
                    <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                    <option value="CREDIT_CARD">Credit / Debit Card</option>
                    <option value="STRIPE">Stripe Payment Gateway</option>
                    <option value="PAYPAL">PayPal Corporate</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayingInvoice(null)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {processingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
