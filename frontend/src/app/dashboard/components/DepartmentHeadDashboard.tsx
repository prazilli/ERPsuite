'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStore } from '@/context/dashboardStore';
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Calendar,
  Megaphone,
  CheckSquare,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface DepartmentHeadDashboardProps {
  data: any;
  refetch: () => void;
  isFetching: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#fbbf24', '#f87171', '#a78bfa'];

export const DepartmentHeadDashboard: React.FC<DepartmentHeadDashboardProps> = ({ data, refetch, isFetching }) => {
  const { apiFetch } = useAuth();
  const { widgetLayouts, reorderWidgets } = useDashboardStore();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const deptName = data?.departmentName || 'My Department';
  const teamMembersCount = data?.teamMembersCount || 0;
  const activeProjectsCount = data?.activeProjectsCount || 0;
  const teamAttendance = data?.teamAttendance || { present: 0, late: 0, absent: 0, totalMembers: 0 };
  const productivity = data?.productivity || { totalHoursLogged: 0, averageHoursPerMember: 0 };
  const budget = data?.budget || { allocated: 0, utilized: 0, utilizationPercent: 0 };
  const pendingLeaves = data?.pendingApprovals?.leaves || [];
  const pendingExpenses = data?.pendingApprovals?.expenses || [];
  const resourceAllocation = data?.resourceAllocation || [];
  const projectStatusChart = data?.projectStatusChart || [];
  const announcements = data?.announcements || [];
  const upcomingMeetings = data?.upcomingMeetings || [];

  const handleAction = async (approvalId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoading(approvalId);
      await apiFetch(`/approvals/${approvalId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, comments: `Processed by Department Head` }),
      });
      refetch();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const renderWidget = (widgetId: string, index: number) => {
    const layoutControls = (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800/80 z-10">
        <button
          onClick={() => {
            const nextIdx = index - 1;
            if (nextIdx >= 0) reorderWidgets('deptHead', index, nextIdx);
          }}
          disabled={index === 0}
          className="text-slate-400 hover:text-cyan-400 disabled:opacity-30 cursor-pointer p-0.5"
          title="Move Up"
        >
          <ArrowUpIcon />
        </button>
        <button
          onClick={() => {
            const nextIdx = index + 1;
            if (nextIdx < widgetLayouts.deptHead.length) reorderWidgets('deptHead', index, nextIdx);
          }}
          disabled={index === widgetLayouts.deptHead.length - 1}
          className="text-slate-400 hover:text-cyan-400 disabled:opacity-30 cursor-pointer p-0.5"
          title="Move Down"
        >
          <ArrowDownIcon />
        </button>
      </div>
    );

    switch (widgetId) {
      case 'teamStats':
        return (
          <div key="teamStats" className="relative group bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/60 rounded-2xl p-6 glow-shadow col-span-full">
            {layoutControls}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm text-cyan-400 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/15">
                  Department Head Workspace
                </span>
                <h1 className="text-2xl font-black text-white mt-3 tracking-tight">
                  Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{deptName}</span> dashboard
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Manage team performance, approvals, budgets and project alignment.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-900/60 border border-slate-800/60 px-4 py-3 rounded-xl text-center min-w-[100px]">
                  <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <span className="text-sm text-slate-400 font-semibold block">Team Size</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{teamMembersCount} Members</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 px-4 py-3 rounded-xl text-center min-w-[100px]">
                  <Briefcase className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <span className="text-sm text-slate-400 font-semibold block">Active Projects</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{activeProjectsCount} Active</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'teamAttendance':
        return (
          <div key="teamAttendance" className="relative group glass-panel rounded-2xl p-6 col-span-1 min-h-[220px]">
            {layoutControls}
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Attendance Today</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                <span className="text-lg font-bold text-emerald-400 block">{teamAttendance.present}</span>
                <span className="text-xs text-slate-400 font-bold uppercase mt-1 block">Present</span>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                <span className="text-lg font-bold text-amber-400 block">{teamAttendance.late}</span>
                <span className="text-xs text-slate-400 font-bold uppercase mt-1 block">Late</span>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                <span className="text-lg font-bold text-rose-400 block">{teamAttendance.absent}</span>
                <span className="text-xs text-slate-400 font-bold uppercase mt-1 block">Absent</span>
              </div>
            </div>
          </div>
        );

      case 'pendingApprovals':
        return (
          <div key="pendingApprovals" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 min-h-[300px] flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pending Team Approvals</h3>
                </div>
                <span className="text-sm bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {pendingLeaves.length + pendingExpenses.length} Total
                </span>
              </div>

              {pendingLeaves.length === 0 && pendingExpenses.length === 0 ? (
                <EmptyState title="No pending approvals" message="All leave and expense requests are processed." icon={<CheckCircle className="w-8 h-8 text-emerald-500" />} />
              ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  {pendingLeaves.map((l: any) => (
                    <div key={l.approvalId} className="flex justify-between items-center p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl">
                      <div>
                        <span className="text-sm font-bold text-slate-200 block">{l.employeeName}</span>
                        <span className="text-xs text-indigo-400 font-bold uppercase">Leave Application</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(l.approvalId, 'APPROVED')}
                          disabled={actionLoading !== null}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer transition-all border border-emerald-500/10"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(l.approvalId, 'REJECTED')}
                          disabled={actionLoading !== null}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer transition-all border border-rose-500/10"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingExpenses.map((e: any) => (
                    <div key={e.approvalId} className="flex justify-between items-center p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl">
                      <div>
                        <span className="text-sm font-bold text-slate-200 block">{e.employeeName}</span>
                        <span className="text-xs text-amber-400 font-bold uppercase">Expense Reimbursement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(e.approvalId, 'APPROVED')}
                          disabled={actionLoading !== null}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer transition-all border border-emerald-500/10"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(e.approvalId, 'REJECTED')}
                          disabled={actionLoading !== null}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer transition-all border border-rose-500/10"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'productivityChart':
        return (
          <div key="productivityChart" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 min-h-[300px]">
            {layoutControls}
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Team Hours Logged (Last 7 Days)</h3>
            </div>
            <div className="text-sm text-slate-400 mb-4">
              Total Logged: <span className="text-white font-bold">{productivity.totalHoursLogged} hrs</span> &bull; Average/Member: <span className="text-white font-bold">{productivity.averageHoursPerMember} hrs</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceAllocation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#1e293b' }} />
                  <Bar dataKey="projectsCount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assigned Projects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'budgetUtilization':
        return (
          <div key="budgetUtilization" className="relative group glass-panel rounded-2xl p-6 col-span-1 min-h-[220px]">
            {layoutControls}
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Budget Utilization</h3>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-slate-400 font-semibold block">Total Dept Budget</span>
                <span className="text-xl font-bold text-white">${budget.allocated.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-sm text-slate-400 font-semibold block">Total Cost Utilized</span>
                <span className="text-xl font-bold text-cyan-400">${budget.utilized.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm font-bold text-slate-300 mb-1">
                  <span>Utilization</span>
                  <span>{budget.utilizationPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full" style={{ width: `${budget.utilizationPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'resourceAllocationChart':
        return (
          <div key="resourceAllocationChart" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 min-h-[300px]">
            {layoutControls}
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Resource Allocation by Projects Count</h3>
            </div>
            {resourceAllocation.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceAllocation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="projectsCount" fill="#10b981" radius={[0, 4, 4, 0]} name="Projects Assigned" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No allocation data" message="Assign team members to projects." />
            )}
          </div>
        );

      case 'projectStatusChart':
        return (
          <div key="projectStatusChart" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 min-h-[300px] flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Projects by Status</h3>
              </div>
              {projectStatusChart.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="h-48 w-48 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusChart}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {projectStatusChart.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#1e293b' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 w-full text-sm">
                    {projectStatusChart.map((entry: any, index: number) => (
                      <div key={entry.status} className="flex justify-between items-center p-2 bg-slate-950/20 border border-slate-800/40 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-slate-300 font-bold uppercase tracking-wider text-xs">{entry.status}</span>
                        </div>
                        <span className="text-white font-bold">{entry.count} Projects</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState title="No projects statuses" message="Configure projects status parameters." />
              )}
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div key="announcements" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Department Announcements</h3>
              </div>
              {announcements.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {announcements.map((a: any) => (
                    <div key={a.announcement_id} className="p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                      <span className="text-sm font-bold text-white block">{a.title}</span>
                      <span className="text-sm text-slate-400 block mt-1 leading-relaxed">{a.content}</span>
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-3 pt-2 border-t border-slate-800/40">
                        <span>Audience: {a.target_audience}</span>
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Quiet department" message="No new notifications for your team." />
              )}
            </div>
          </div>
        );

      case 'upcomingMeetings':
        return (
          <div key="upcomingMeetings" className="relative group glass-panel rounded-2xl p-6 col-span-1 flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Meetings Alignment</h3>
              </div>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {upcomingMeetings.map((m: any) => (
                    <div key={m.meeting_id} className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl space-y-2">
                      <div>
                        <span className="text-sm font-bold text-white block">{m.title}</span>
                        <span className="text-xs text-slate-400 block">{m.description || 'No description'}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Date: {new Date(m.start_time).toLocaleString()}
                      </div>
                      {m.meeting_link && (
                        <a
                          href={m.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block w-full text-center py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-bold tracking-wide"
                        >
                          Join Conference
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No upcoming meetings" message="Focus time scheduled." />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-bold text-slate-400">ROLE: DEPARTMENT HEAD</span>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Operations Overview</h2>
        </div>
        <button
          onClick={refetch}
          disabled={isFetching}
          className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 rounded-lg cursor-pointer transition-all text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {widgetLayouts.deptHead.map((wId, idx) => (
          <ErrorBoundary key={wId}>
            {renderWidget(wId, idx)}
          </ErrorBoundary>
        ))}
      </div>
    </div>
  );
};

// Icons helpers
const ArrowUpIcon = () => <ArrowUp className="w-3.5 h-3.5" />;
const ArrowDownIcon = () => <ArrowDown className="w-3.5 h-3.5" />;
