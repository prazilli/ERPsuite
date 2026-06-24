'use client';

import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  PlusCircle,
  FileCheck2,
  ListTodo
} from 'lucide-react';

export const SupervisorDashboard: React.FC = () => {
  const [reports, setReports] = useState([
    { id: 1, name: 'Alice Smith', role: 'Developer', hoursLogged: '38.5', status: 'Pending Review' },
    { id: 2, name: 'Bob Johnson', role: 'Support Analyst', hoursLogged: '40.0', status: 'Approved' },
  ]);

  const handleApproveTimesheet = (id: number) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Supervisor Control Desk</h2>
          <p className="text-sm text-text-muted">Manage team allocations, log timesheets approvals, and rosters</p>
        </div>
        <span className="text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Team Supervisor
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Direct Reports Active', val: '6 Staff', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Pending Timesheets Review', val: reports.filter((r) => r.status === 'Pending Review').length, icon: FileCheck2, color: 'text-yellow-400', bg: 'bg-yellow-500/5' },
          { label: 'Weekly Team Hours Logged', val: '228.5 Hrs', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
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

      {/* Direct reports list */}
      <div className="glass-panel rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-cyan-400" /> Direct Reports Timesheet Registry
        </h3>
        <div className="space-y-3.5">
          {reports.map((report) => (
            <div key={report.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center hover:border-slate-700 transition-all">
              <div>
                <div className="text-sm font-bold text-white">{report.name}</div>
                <div className="text-sm text-text-muted mt-0.5">Role: {report.role} | Hours Logged: {report.hoursLogged} Hrs</div>
              </div>
              <div className="flex items-center gap-3">
                {report.status === 'Pending Review' ? (
                  <button
                    onClick={() => handleApproveTimesheet(report.id)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer transition-all"
                  >
                    Approve Hours
                  </button>
                ) : (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                    Approved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
