'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Server,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  Loader2,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Plus,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export default function AssetsPage() {
  const { user, apiFetch } = useAuth();

  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States: New Asset
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [aName, setAName] = useState('');
  const [aType, setAType] = useState('LAPTOP');
  const [aSerial, setASerial] = useState('');
  const [aCost, setACost] = useState('');
  const [submittingAsset, setSubmittingAsset] = useState(false);

  // Form States: Assign Asset
  const [assigningAsset, setAssigningAsset] = useState<any | null>(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [processingAssignment, setProcessingAssignment] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const list = await apiFetch('/assets');
      const emps = await apiFetch('/hrms/employees');
      const stats = await apiFetch('/assets/analytics');

      setAssets(list);
      setEmployees(emps);
      setAnalytics(stats);
    } catch (e: any) {
      setError(e.message || 'Failed to load asset records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingAsset(true);
    try {
      await apiFetch('/assets', {
        method: 'POST',
        body: JSON.stringify({
          name: aName,
          type: aType,
          serialNumber: aSerial,
          purchaseCost: parseFloat(aCost),
        })
      });
      setSuccess(`Device "${aName}" registered in compliance logs.`);
      setAName(''); setAType('LAPTOP'); setASerial(''); setACost('');
      setShowAssetModal(false);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Asset registration failed.');
    } finally {
      setSubmittingAsset(false);
    }
  };

  const handleAssignAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningAsset) return;
    setError(''); setSuccess(''); setProcessingAssignment(true);
    try {
      await apiFetch(`/assets/${assigningAsset.asset_id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          userId: parseInt(assignUserId, 10),
        })
      });
      setSuccess(`Asset assigned successfully.`);
      setAssignUserId('');
      setAssigningAsset(null);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Asset assignment failed.');
    } finally {
      setProcessingAssignment(false);
    }
  };

  const handleReturnAsset = async (assetId: number) => {
    if (!window.confirm('Confirm device return? This releases the asset back to standard inventory.')) return;
    setError(''); setSuccess('');
    try {
      await apiFetch(`/assets/${assetId}/return`, { method: 'POST' });
      setSuccess('Asset returned and cataloged as AVAILABLE.');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Asset return failed.');
    }
  };

  const handleUpdateCondition = async (assetId: number, cond: string) => {
    setError(''); setSuccess('');
    try {
      await apiFetch(`/assets/${assetId}/condition`, {
        method: 'PATCH',
        body: JSON.stringify({ condition: cond })
      });
      setSuccess(`Asset state updated to ${cond}.`);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Condition update failed.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Syncing hardware registers...
      </div>
    );
  }

  const kpis = analytics || { totalAssets: 0, assignedAssets: 0, availableAssets: 0, repairAssets: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" /> IT hardware & Assets Registry
          </h2>
          <p className="text-sm text-text-muted">Device configurations, employee assignments, and compliance conditions</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssetModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md animate-gradient"
          >
            <PlusCircle className="w-4 h-4" /> Register Hardware
          </button>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Mapped Hardware', val: kpis.totalAssets, icon: Server, color: 'text-blue-400' },
          { label: 'Assigned Out', val: kpis.assignedAssets, icon: Users, color: 'text-cyan-400' },
          { label: 'Available Inventory', val: kpis.availableAssets, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Under Repair', val: kpis.repairAssets, icon: ShieldAlert, color: 'text-red-400' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel rounded-2xl border border-white/5 p-5 glow-shadow flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">{stat.label}</span>
              <h3 className="text-xl font-black text-white mt-1.5">{stat.val}</h3>
            </div>
            <div className="p-2.5 rounded bg-white/5">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Assets Catalog */}
      <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> Device Operations Control
          </h3>
        </div>

        {assets.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No assets registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-sm uppercase text-text-muted border-b border-white/5 bg-slate-900/25">
                <tr>
                  <th className="py-3.5 px-6">Device Name</th>
                  <th className="py-3.5 px-6">Serial Number</th>
                  <th className="py-3.5 px-6">Hardware Type</th>
                  <th className="py-3.5 px-6">Current Holder</th>
                  <th className="py-3.5 px-6 text-center">Condition Status</th>
                  <th className="py-3.5 px-6 text-center">Logistics Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assets.map((asset) => (
                  <tr key={asset.asset_id} className="hover:bg-slate-900/40 transition-all">
                    <td className="py-3.5 px-6 font-semibold text-white">
                      {asset.name}
                      <span className="block text-xs text-text-muted">ID: #{asset.asset_id}</span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-sm">{asset.serial_number}</td>
                    <td className="py-3.5 px-6">{asset.type}</td>
                    <td className="py-3.5 px-6">
                      {asset.condition === 'ASSIGNED' ? (
                        <div className="font-semibold text-white">
                          {asset.assignments?.[0]?.assigned_to?.first_name} {asset.assignments?.[0]?.assigned_to?.last_name}
                          <span className="block text-xs text-text-muted">Since {new Date(asset.assignments?.[0]?.assigned_at).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">In Stock</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        asset.condition === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : asset.condition === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex justify-center gap-1.5">
                        {asset.condition === 'AVAILABLE' && (
                          <button
                            onClick={() => setAssigningAsset(asset)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-white/5 cursor-pointer"
                          >
                            Assign Device
                          </button>
                        )}
                        {asset.condition === 'ASSIGNED' && (
                          <button
                            onClick={() => handleReturnAsset(asset.asset_id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-white/5 cursor-pointer"
                          >
                            Return
                          </button>
                        )}
                        {asset.condition !== 'RETIRED' && (
                          <select
                            onChange={(e) => handleUpdateCondition(asset.asset_id, e.target.value)}
                            value={asset.condition}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-sm cursor-pointer"
                          >
                            <option value="AVAILABLE">Mark Available</option>
                            <option value="UNDER_REPAIR">Mark Repair</option>
                            <option value="RETIRED">Retire</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Register Asset */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" /> Register Hardware Profile
              </h3>
              
              <form onSubmit={handleCreateAsset} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Hardware Label</label>
                    <input
                      type="text" required
                      placeholder="e.g. Macbook Pro M3 Max"
                      value={aName}
                      onChange={(e) => setAName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Hardware Category</label>
                    <select
                      value={aType}
                      onChange={(e) => setAType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    >
                      <option value="LAPTOP">Laptop Computer</option>
                      <option value="DESKTOP">Desktop Terminal</option>
                      <option value="SERVER">Rack Server</option>
                      <option value="MOBILE">Mobile Phone</option>
                      <option value="OTHER">Other Peripherals</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Serial Number / Tag</label>
                    <input
                      type="text" required
                      placeholder="e.g. C02X12345678"
                      value={aSerial}
                      onChange={(e) => setASerial(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Purchase Valuation ($)</label>
                    <input
                      type="number" required
                      placeholder="e.g. 2400"
                      value={aCost}
                      onChange={(e) => setACost(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAssetModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAsset}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingAsset ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Log Hardware'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Asset */}
      {assigningAsset && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Assign Device: {assigningAsset.name}
              </h3>
              
              <form onSubmit={handleAssignAsset} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Select Employee Holder</label>
                  <select
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">Select Holder</option>
                    {employees.map((e) => (
                      <option key={e.user_id} value={e.user_id}>{e.first_name} {e.last_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssigningAsset(null)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingAssignment}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {processingAssignment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Assignment'}
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
