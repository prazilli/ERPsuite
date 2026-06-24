'use client';

import React, { useState } from 'react';
import {
  Package,
  Truck,
  FileCheck,
  AlertOctagon,
  RefreshCw,
  CheckSquare,
  Loader2
} from 'lucide-react';

/* 1. SUPPLY CHAIN HEAD DASHBOARD */
interface Props {
  metrics: any;
}

export const SupplyChainHeadDashboard: React.FC<Props> = ({ metrics }) => {
  const data = metrics || {
    stockLevelPercent: 78,
    activeVendors: 14,
    pendingPurchaseOrders: 8,
    logisticsScore: 92.5,
    inventoryAlerts: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Logistics & Supply Chain Hub</h2>
          <p className="text-sm text-text-muted">Inventory warehouses, supplier database, and shipping tracking</p>
        </div>
        <span className="text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Supply Chain Head
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Inventory Stock level', val: `${data.stockLevelPercent}%`, icon: Package, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Active Trade Suppliers', val: data.activeVendors, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Pending Purchase Orders', val: data.pendingPurchaseOrders, icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Average Logistics Rating', val: `${data.logisticsScore}%`, icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/5' },
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

      {/* Stock Alerts table */}
      <div className="glass-panel rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" /> Critical Inventory Alerts
        </h3>
        <div className="space-y-3.5">
          {(data.inventoryAlerts || []).map((alert: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center hover:border-red-500/20 transition-all">
              <div>
                <div className="text-sm font-bold text-white">{alert.item}</div>
                <div className="text-sm text-text-muted mt-0.5">Remaining Stock: {alert.stock} units</div>
              </div>
              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold uppercase border border-red-500/20">
                {alert.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/* 2. SUPPLY CHAIN EMPLOYEE DASHBOARD */
export const SupplyChainEmployeeDashboard: React.FC = () => {
  const [sku, setSku] = useState('');
  const [stockAdd, setStockAdd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Verify cargo dispatch ref: CRG-94', vendor: 'FedEx Freight', status: 'Pending' },
    { id: 2, title: 'Conduct stock tally on rack B4', vendor: 'Warehouse HQ', status: 'Completed' },
  ]);

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setSubmitting(true);

    setTimeout(() => {
      setSuccess(`Inventory updated: added ${stockAdd} units to SKU [${sku}].`);
      setSku('');
      setStockAdd('');
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Logistics Workspace</h2>
          <p className="text-sm text-text-muted">Stock adjustments, receipt validations, and vendor task checklists</p>
        </div>
        <span className="text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Supply Chain Employee
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Vendor Tasks Checklists */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Assigned Vendor Operations</h3>
          <div className="space-y-3.5">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-white">{t.title}</div>
                  <div className="text-sm text-text-muted mt-0.5">Supplier: {t.vendor}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Stock adjustment */}
        <div className="glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" /> Stock Level Adjustment
          </h3>

          {success && (
            <div className="mb-4 p-2.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleStockUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">SKU / Item code</label>
              <input
                type="text"
                required
                placeholder="e.g. SKU-CAT6-CONN"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Quantity to Add</label>
              <input
                type="number"
                required
                placeholder="e.g. 50"
                value={stockAdd}
                onChange={(e) => setStockAdd(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all mt-4"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Commit Stock Adjustment <CheckSquare className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
