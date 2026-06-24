'use client';

import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Server,
  Terminal,
  CheckCircle
} from 'lucide-react';

/* 1. IT HEAD DASHBOARD */
interface Props {
  metrics: any;
}

export const ITHeadDashboard: React.FC<Props> = ({ metrics }) => {
  const data = metrics || {
    activeSessions: 142,
    unresolvedTickets: 4,
    systemUptime: 99.98,
    securityThreatsBlocked: 254,
    auditRecentActions: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">IT Infrastructure Suite</h2>
          <p className="text-sm text-text-muted">Security firewalls, network nodes, and global login audit trails</p>
        </div>
        <span className="text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          IT Head
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active SSO Sessions', val: data.activeSessions, icon: Cpu, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'System Node Uptime', val: `${data.systemUptime}%`, icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Intrusions Terminated', val: data.securityThreatsBlocked, icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Unresolved Tickets', val: data.unresolvedTickets, icon: AlertTriangle, color: 'text-purple-400', bg: 'bg-purple-500/5' },
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

      {/* Audit Action Log */}
      <div className="glass-panel rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" /> Recent Cluster Actions
        </h3>
        <div className="space-y-3.5">
          {(data.auditRecentActions || []).map((action: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center hover:border-slate-700 transition-all text-sm">
              <div>
                <span className="font-semibold text-white">{action.action}</span>
                <div className="text-sm text-text-muted mt-0.5">Executor: {action.user}</div>
              </div>
              <span className="text-xs text-cyan-400">{action.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/* 2. IT EMPLOYEE DASHBOARD */
export const ITEmployeeDashboard: React.FC = () => {
  const [tickets, setTickets] = useState([
    { id: 'TKT-489', subject: 'LDAP Sync latency exceeding 250ms', severity: 'High', status: 'Assigned' },
    { id: 'TKT-488', subject: 'Re-index login audit logs database tables', severity: 'Medium', status: 'In Progress' },
  ]);

  const handleResolveTicket = (id: string) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: 'Resolved' } : t)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Systems Workspace</h2>
          <p className="text-sm text-text-muted">Assigned tickets, server performance logs, and nodes checkups</p>
        </div>
        <span className="text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          IT Employee
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Assigned support tickets */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">My Assigned Tickets</h3>
          <div className="space-y-3.5">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center hover:border-slate-700 transition-all">
                <div>
                  <div className="text-sm font-bold text-white">{t.subject}</div>
                  <div className="text-sm text-text-muted mt-0.5">Ref: {t.id} | Severity: {t.severity}</div>
                </div>
                <div className="flex items-center gap-3">
                  {t.status !== 'Resolved' ? (
                    <button
                      onClick={() => handleResolveTicket(t.id)}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer transition-all"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded font-bold uppercase">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Monitoring status */}
        <div className="glass-panel rounded-xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Live Node Health</h3>
            <div className="space-y-4 mt-4">
              {[
                { name: 'Gateway Proxy Node', value: 'Healthy' },
                { name: 'SSO Directory Store', value: 'Healthy' },
                { name: 'Backup Chron Job daemon', value: 'Active' },
              ].map((h, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 rounded bg-slate-900 border border-slate-700 text-sm">
                  <span className="text-slate-300">{h.name}</span>
                  <span className="text-emerald-400 font-bold uppercase text-sm flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {h.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 text-xs text-text-muted">
            Telemetry connections are running via secure WebSocket proxies.
          </div>
        </div>

      </div>

    </div>
  );
};
