'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Target,
  Sparkles,
  TrendingUp,
  PlusCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  ChevronRight,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

const STATUS_COLUMNS = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export default function CrmPage() {
  const { user, apiFetch } = useAuth();

  const [activeTab, setActiveTab] = useState<'leads' | 'clients'>('leads');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for New Lead
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadCompanyName, setLeadCompanyName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadValue, setLeadValue] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  // Form states for New Client
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientContractValue, setClientContractValue] = useState('');
  const [submittingClient, setSubmittingClient] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const leadsList = await apiFetch('/crm/leads');
      const clientsList = await apiFetch('/crm/clients');
      setLeads(leadsList);
      setClients(clientsList);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch CRM records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingLead(true);
    try {
      await apiFetch('/crm/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: leadCompanyName ? `${leadName} (${leadCompanyName})` : leadName,
          email: leadEmail,
          phone: leadPhone,
          value: leadValue ? parseFloat(leadValue) : 0,
          status: 'NEW',
        }),
      });
      setSuccess(`Lead for ${leadCompanyName || leadName} created successfully.`);
      setLeadName('');
      setLeadCompanyName('');
      setLeadEmail('');
      setLeadPhone('');
      setLeadValue('');
      setShowLeadModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to create lead.');
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingClient(true);
    try {
      await apiFetch('/crm/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          contract_value: clientContractValue ? parseFloat(clientContractValue) : 0,
        }),
      });
      setSuccess(`Client "${clientName}" registered successfully.`);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientContractValue('');
      setShowClientModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to create client.');
    } finally {
      setSubmittingClient(false);
    }
  };

  const handleUpdateStatus = async (leadId: number, nextStatus: string) => {
    setError(''); setSuccess('');
    try {
      await apiFetch(`/crm/leads/${leadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (nextStatus === 'WON') {
        setSuccess('Lead won! Successfully auto-converted to active Enterprise Client.');
      } else {
        setSuccess(`Lead status updated to ${nextStatus}.`);
      }
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to update status.');
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!window.confirm('Are you sure you want to remove this lead from the pipeline?')) return;
    setError(''); setSuccess('');
    try {
      await apiFetch(`/crm/leads/${leadId}`, { method: 'DELETE' });
      setSuccess('Lead removed successfully.');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to delete lead.');
    }
  };

  const filteredLeads = leads.filter((l) =>
    l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Synced lead registers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex justify-between items-center bg-slate-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-[26px] font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" /> CRM & Client Pipeline
          </h2>
          <p className="text-sm text-slate-300 font-medium mt-1">Lead tracking, proposal valuations, and accounts conversion</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'leads' ? (
            <button
              onClick={() => setShowLeadModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Add Lead Card
            </button>
          ) : (
            <button
              onClick={() => setShowClientModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Add Client Account
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

      {/* Toggles & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'leads' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-text-muted hover:text-white'
            }`}
          >
            Pipeline Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'clients' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-text-muted hover:text-white'
            }`}
          >
            Enterprise Clients ({clients.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'leads' ? 'Search lead cards...' : 'Search enterprise accounts...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-sm"
          />
        </div>
      </div>

      {/* Tabs panels */}
      {activeTab === 'leads' ? (
        /* Leads Column Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((status) => {
            const columnLeads = filteredLeads.filter((l) => l.status === status);
            return (
              <div key={status} className="glass-panel border border-white/5 p-4 rounded-xl flex flex-col gap-3 min-w-[200px]">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[13px] font-semibold uppercase text-slate-300 tracking-wider">{status}</span>
                  <span className="text-[13px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                    {columnLeads.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.lead_id}
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 hover:border-slate-700 transition-all flex flex-col gap-2 relative group"
                    >
                      <button
                        onClick={() => handleDeleteLead(lead.lead_id)}
                        className="absolute top-2 right-2 p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div>
                        <h4 className="text-[15px] font-bold text-white leading-tight">{lead.name}</h4>
                        <span className="text-[13px] text-slate-400 mt-1 block">{lead.source || 'Direct Deal'}</span>
                      </div>

                      <div className="flex flex-col gap-1.5 text-sm text-slate-300">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-text-muted" /> {lead.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-text-muted" /> {lead.phone}</span>
                      </div>

                      <div className="border-t border-white/5 pt-3 flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-emerald-400">${Number(lead.value || 0).toLocaleString()}</span>
                        
                        {/* Action dropdown or quick mover */}
                        <div className="flex gap-1">
                          {status !== 'WON' && status !== 'LOST' && (
                            <button
                              onClick={() => {
                                const nextIdx = STATUS_COLUMNS.indexOf(status) + 1;
                                handleUpdateStatus(lead.lead_id, STATUS_COLUMNS[nextIdx]);
                              }}
                              className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all cursor-pointer"
                              title="Advance status"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {status !== 'WON' && (
                            <button
                              onClick={() => handleUpdateStatus(lead.lead_id, 'WON')}
                              className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer font-bold text-[13px]"
                              title="Mark as WON (Auto-Convert)"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="text-center text-[13px] text-text-muted py-8 italic">No cards.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Clients Accounts view */
        <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Enterprise Clients Register</h3>
          </div>
          
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No clients recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-sm uppercase text-slate-400 border-b border-white/5 bg-slate-900/25">
                  <tr>
                    <th className="py-3.5 px-6">Account Name</th>
                    <th className="py-3.5 px-6">Email Contract</th>
                    <th className="py-3.5 px-6">Direct Line</th>
                    <th className="py-3.5 px-6">Registration Date</th>
                    <th className="py-3.5 px-6 text-right">Contract Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.map((client) => (
                    <tr key={client.client_id} className="hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-6 font-semibold text-white">
                        {client.client_name}
                        <span className="block text-[13px] text-slate-500 mt-0.5">ID: #{client.client_id}</span>
                      </td>
                      <td className="py-3.5 px-6">{client.email}</td>
                      <td className="py-3.5 px-6">{client.phone || 'No phone'}</td>
                      <td className="py-3.5 px-6 text-text-muted">{new Date(client.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-6 text-right font-bold text-emerald-400">
                        ${client.contract_value?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: New Lead */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" /> Create New Lead Card
              </h3>
              
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Company / Org Name</label>
                    <input
                      type="text" required
                      placeholder="e.g. Acme Labs Inc"
                      value={leadCompanyName}
                      onChange={(e) => setLeadCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Lead Contact Name</label>
                    <input
                      type="text" required
                      placeholder="e.g. James Smith"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email" required
                      placeholder="e.g. contact@acmelabs.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Contact Phone</label>
                    <input
                      type="text" required
                      placeholder="e.g. +1 555-0192"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Projected Deal Value ($)</label>
                  <input
                    type="number" required
                    placeholder="e.g. 25000"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLeadModal(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingLead ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Register Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Client */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" /> Create Client Account
              </h3>
              
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Enterprise Client Name</label>
                  <input
                    type="text" required
                    placeholder="e.g. Microsoft Licensing Corp"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Corporate Email</label>
                    <input
                      type="email" required
                      placeholder="e.g. bills@microsoft.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Billing Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 800-426-9400"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold uppercase text-slate-400 mb-1">Agreed Contract Value ($)</label>
                  <input
                    type="number" required
                    placeholder="e.g. 125000"
                    value={clientContractValue}
                    onChange={(e) => setClientContractValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClient}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingClient ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Register Account'}
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
