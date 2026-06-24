'use client';

import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Heart,
  PlusCircle,
  CheckCircle,
  Loader2,
  FileCheck2
} from 'lucide-react';

/* 1. HR HEAD DASHBOARD */
interface Props {
  metrics: any;
}

export const HRHeadDashboard: React.FC<Props> = ({ metrics }) => {
  const data = metrics || {
    employeesCount: 45,
    leavesPending: 6,
    avgAttendanceRate: 96.4,
    payrollTotal: 185000,
    recentLeaves: [],
  };

  const [leaves, setLeaves] = useState(data.recentLeaves || [
    { id: 1, applicant: 'Sarah Connor', type: 'Sick Leave', duration: '2 days', status: 'Pending' },
    { id: 2, applicant: 'John Doe', type: 'Annual Leave', duration: '5 days', status: 'Pending' },
  ]);

  const handleApproveLeave = (id: number) => {
    setLeaves(leaves.map((l: any) => (l.id === id ? { ...l, status: 'Approved' } : l)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">HR & Payroll Workspace</h2>
          <p className="text-sm text-text-muted">Staff directory administration, leaves review, and payroll audits</p>
        </div>
        <span className="text-sm bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          HR Head
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Head Count', val: data.employeesCount, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Average Attendance', val: `${data.avgAttendanceRate}%`, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Payroll Monthly Budget', val: `$${data.payrollTotal.toLocaleString()}`, icon: FileCheck2, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Leaves Pending', val: leaves.filter((l: any) => l.status === 'Pending').length, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/5' },
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

      {/* Leaves inbox */}
      <div className="glass-panel rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4">Leaves Approval Inbox</h3>
        <div className="space-y-3.5">
          {leaves.map((leave: any) => (
            <div key={leave.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center hover:border-slate-700 transition-all">
              <div>
                <div className="text-sm font-bold text-white">{leave.applicant}</div>
                <div className="text-sm text-text-muted mt-0.5">Type: {leave.type} | Duration: {leave.duration}</div>
              </div>
              <div className="flex items-center gap-3">
                {leave.status === 'Pending' ? (
                  <button
                    onClick={() => handleApproveLeave(leave.id)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold cursor-pointer transition-all"
                  >
                    Approve
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

/* 2. HR EMPLOYEE DASHBOARD */
export const HREmployeeDashboard: React.FC = () => {
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [recentLogs, setRecentLogs] = useState([
    { date: '2026-06-21', checkIn: '09:02 AM', checkOut: '06:00 PM', hours: '8.9' },
    { date: '2026-06-20', checkIn: '08:58 AM', checkOut: '05:30 PM', hours: '8.5' },
  ]);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setSubmitting(true);

    setTimeout(() => {
      setSuccess('Leave request logged. Transmitted to HR Administrator.');
      setDuration('');
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">HR Directory Workspace</h2>
          <p className="text-sm text-text-muted">Attendance registers, leave logs, and payroll items</p>
        </div>
        <span className="text-sm bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          HR Employee
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Attendance Register logs */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">My Attendance Log</h3>
          <div className="space-y-3">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-bold text-white">{log.date}</div>
                  <div className="text-sm text-text-muted mt-0.5">Check-In: {log.checkIn} | Check-Out: {log.checkOut}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{log.hours} Hrs</div>
                  <span className="inline-block text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded mt-1 font-bold uppercase">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submit Leave Request */}
        <div className="glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" /> Apply for Leave
          </h3>

          {success && (
            <div className="mb-4 p-2.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              >
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Casual Leave">Casual Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Duration Details</label>
              <input
                type="text"
                required
                placeholder="e.g. 3 days (June 24 to June 26)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all mt-4"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Log Leave Request <PlusCircle className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
