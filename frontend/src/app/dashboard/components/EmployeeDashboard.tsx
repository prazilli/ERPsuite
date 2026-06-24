'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStore } from '@/context/dashboardStore';
import {
  Calendar,
  Clock,
  Briefcase,
  CheckCircle,
  AlertCircle,
  FileText,
  HelpCircle,
  Bell,
  Megaphone,
  Laptop,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Coffee,
  CheckSquare,
  ArrowLeft,
  DollarSign
} from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface EmployeeDashboardProps {
  data: any;
  refetch: () => void;
  isFetching: boolean;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ data, refetch, isFetching }) => {
  const { apiFetch, user } = useAuth();
  const { widgetLayouts, reorderWidgets, resetLayout } = useDashboardStore();
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const welcome = data?.welcome || { name: user?.name, designation: 'Associate', department: 'Operations' };
  const attendanceStatus = data?.attendanceStatus || { status: 'ABSENT_OR_UNCHECKED', checkIn: null, checkOut: null };
  const workingHoursToday = data?.workingHoursToday || 0;
  const attendancePercentage = data?.attendancePercentage || 0;
  const assignedProjects = data?.assignedProjects || [];
  const pendingTasks = data?.pendingTasks || [];
  const overdueTasksCount = data?.overdueTasksCount || 0;
  const tasksDueTodayCount = data?.tasksDueTodayCount || 0;
  const leaveBalances = data?.leaveBalances || [];
  const upcomingHolidays = data?.upcomingHolidays || [];
  const timesheets = data?.timesheets || [];
  const assignedAssets = data?.assignedAssets || [];
  const notifications = data?.notifications || [];
  const announcements = data?.announcements || [];
  const upcomingMeetings = data?.upcomingMeetings || [];
  const salaryStructure = data?.salaryStructure || null;
  const recentPayrolls = data?.recentPayrolls || [];

  const handleCheckIn = async () => {
    if (!user) return;
    try {
      setAttendanceLoading(true);
      await apiFetch(`/hrms/employees/${user.id}/check-in`, { method: 'POST' });
      refetch();
    } catch (e: any) {
      alert(e.message || 'Check-in failed');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    try {
      setAttendanceLoading(true);
      await apiFetch(`/hrms/employees/${user.id}/check-out`, { method: 'POST' });
      refetch();
    } catch (e: any) {
      alert(e.message || 'Check-out failed');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Movable actions helper
  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx >= 0 && nextIdx < widgetLayouts.employee.length) {
      reorderWidgets('employee', index, nextIdx);
    }
  };

  const renderWidget = (widgetId: string, index: number) => {
    const layoutControls = (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800/80 z-10">
        <button
          onClick={() => moveWidget(index, 'up')}
          disabled={index === 0}
          className="text-slate-400 hover:text-cyan-400 disabled:opacity-30 cursor-pointer p-0.5"
          title="Move Up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => moveWidget(index, 'down')}
          disabled={index === widgetLayouts.employee.length - 1}
          className="text-slate-400 hover:text-cyan-400 disabled:opacity-30 cursor-pointer p-0.5"
          title="Move Down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );

    switch (widgetId) {
      case 'welcome':
        return (
          <div key="welcome" className="relative group bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/60 rounded-2xl p-6 glow-shadow overflow-hidden col-span-full">
            {layoutControls}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm text-cyan-400 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/15">
                  Workspace Profile
                </span>
                <h1 className="text-2xl font-black text-white mt-3 tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{welcome.name}</span>!
                </h1>
                <p className="text-sm text-slate-400 mt-1.5 font-medium">
                  {welcome.designation} &bull; <span className="text-slate-300">{welcome.department}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/60 px-4 py-2.5 rounded-xl self-start sm:self-center">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-slate-200">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        );

      case 'attendanceActions':
        return (
          <div key="attendanceActions" className="relative group glass-panel rounded-2xl p-6 flex flex-col justify-between col-span-1 min-h-[220px]">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today's Attendance</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  {workingHoursToday} <span className="text-sm font-semibold text-slate-400">HRS</span>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${
                  attendanceStatus.status === 'PRESENT' ? 'bg-emerald-500 animate-pulse' :
                  attendanceStatus.status === 'LATE' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                }`}></span>
                <span className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                  {attendanceStatus.status === 'PRESENT' ? 'Checked In' :
                   attendanceStatus.status === 'LATE' ? 'Checked In (Late)' :
                   attendanceStatus.status === 'ABSENT_OR_UNCHECKED' ? 'Not Checked In' : attendanceStatus.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {attendanceStatus.status === 'ABSENT_OR_UNCHECKED' ? (
                <button
                  onClick={handleCheckIn}
                  disabled={attendanceLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50"
                >
                  {attendanceLoading ? 'Checking in...' : 'Check In'}
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={attendanceStatus.checkOut || attendanceLoading}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700/60 text-white disabled:text-slate-500 rounded-xl text-sm font-bold cursor-pointer transition-all"
                >
                  {attendanceStatus.checkOut ? 'Checked Out' : attendanceLoading ? 'Checking out...' : 'Check Out'}
                </button>
              )}
            </div>
          </div>
        );

      case 'statsSummary':
        return (
          <div key="statsSummary" className="relative group glass-panel rounded-2xl p-6 flex flex-col justify-between col-span-1 min-h-[220px]">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metrics Snapshot</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl">
                  <span className="text-sm text-slate-400 block font-semibold">Today's Tasks</span>
                  <span className="text-xl font-bold text-white mt-1 block">{tasksDueTodayCount}</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl">
                  <span className="text-sm text-slate-400 block font-semibold">Overdue Tasks</span>
                  <span className="text-xl font-bold text-rose-400 mt-1 block">{overdueTasksCount}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-4">
              <span className="text-sm text-slate-400 font-semibold">Monthly Attendance</span>
              <span className="text-sm font-black text-cyan-400">{attendancePercentage}%</span>
            </div>
          </div>
        );

      case 'salaryWidget':
        return (
          <div key="salaryWidget" className="relative group glass-panel rounded-2xl p-6 flex flex-col justify-between col-span-1 min-h-[220px]">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compensation</h3>
              </div>
              {salaryStructure ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                    <span className="text-sm text-slate-400 font-semibold">Base Salary</span>
                    <span className="text-sm font-bold text-white">${salaryStructure.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm px-1 text-slate-400">
                    <span>Allowances</span>
                    <span className="text-emerald-400 font-bold">+ ${salaryStructure.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm px-1 text-slate-400 border-b border-slate-800/40 pb-2">
                    <span>Deductions</span>
                    <span className="text-rose-400 font-bold">- ${salaryStructure.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 px-1">
                    <span className="text-sm font-bold text-slate-300">Net Pay</span>
                    <span className="text-base font-black text-emerald-400">${salaryStructure.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <EmptyState title="No salary set" message="Compensation data is pending." />
              )}
            </div>
          </div>
        );

      case 'assignedProjects':
        return (
          <div key="assignedProjects" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 min-h-[260px] flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Projects</h3>
              </div>
              {assignedProjects.length > 0 ? (
                <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
                  {assignedProjects.map((p: any) => (
                    <div key={p.projectId} className="flex justify-between items-center p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-200 block">{p.name}</span>
                        <span className="text-sm text-slate-400 font-medium">Role: {p.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-bold text-white">{p.completionPercent}%</span>
                          <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full" style={{ width: `${p.completionPercent}%` }}></div>
                          </div>
                        </div>
                        <span className={`text-sm px-2 py-0.5 rounded font-bold uppercase ${
                          p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No assigned projects" message="You aren't active on any projects." />
              )}
            </div>
          </div>
        );

      case 'pendingTasks':
        return (
          <div key="pendingTasks" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 min-h-[300px] flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pending Tasks</h3>
                </div>
                <span className="text-sm bg-slate-800 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded-full font-bold">
                  {pendingTasks.length} Pending
                </span>
              </div>
              {pendingTasks.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {pendingTasks.map((t: any) => (
                    <div key={t.taskId} className="flex justify-between items-center p-3 bg-slate-950/30 border border-slate-800/50 rounded-xl hover:border-slate-700/50 transition-all">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-200 block">{t.name}</span>
                        <span className="text-sm text-slate-400 font-medium">
                          Due Date: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No limit'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm px-2 py-0.5 rounded font-bold uppercase ${
                          t.priority === 'CRITICAL' || t.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>{t.priority}</span>
                        <span className="text-sm bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="All caught up!" message="No pending tasks assigned." icon={<CheckCircle className="w-8 h-8 text-emerald-500" />} />
              )}
            </div>
          </div>
        );

      case 'leaveBalances':
        return (
          <div key="leaveBalances" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Leave Balances</h3>
              </div>
              {leaveBalances.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {leaveBalances.map((l: any) => (
                    <div key={l.balance_id} className="p-3.5 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-sm text-slate-400 font-bold uppercase">{l.leave_type}</span>
                        <span className="text-white font-bold">{l.allocated - l.used} / {l.allocated} Days</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${((l.allocated - l.used) / l.allocated) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No leaves set" message="Leave balance policy has not been configured." />
              )}
            </div>
          </div>
        );

      case 'upcomingHolidays':
        return (
          <div key="upcomingHolidays" className="relative group glass-panel rounded-2xl p-6 flex flex-col justify-between col-span-1">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Holidays</h3>
              </div>
              {upcomingHolidays.length > 0 ? (
                <div className="space-y-3 max-h-44 overflow-y-auto">
                  {upcomingHolidays.map((h: any) => (
                    <div key={h.holiday_id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-white font-semibold block">{h.name}</span>
                        <span className="text-sm text-slate-400">{new Date(h.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No upcoming holidays" message="Check back later." />
              )}
            </div>
          </div>
        );

      case 'timesheetSummary':
        return (
          <div key="timesheetSummary" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Timesheet Log (Recent)</h3>
              </div>
              {timesheets.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {timesheets.map((t: any) => (
                    <div key={t.timesheetId} className="flex justify-between items-center p-3 bg-slate-950/20 border border-slate-800/40 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold text-slate-200 block">{t.taskName}</span>
                        <span className="text-sm text-slate-400 block truncate max-w-[240px] italic">{t.description || 'No summary'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-cyan-400">{t.hoursLogged} hrs</span>
                        <span className="text-sm text-slate-500 block mt-0.5">{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No hours logged" message="Submit timesheets to see them here." />
              )}
            </div>
          </div>
        );

      case 'assignedAssets':
        return (
          <div key="assignedAssets" className="relative group glass-panel rounded-2xl p-6 col-span-1 flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Laptop className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Assets</h3>
              </div>
              {assignedAssets.length > 0 ? (
                <div className="space-y-3">
                  {assignedAssets.map((a: any) => (
                    <div key={a.assetId} className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                      <span className="text-sm font-bold text-white block">{a.name}</span>
                      <div className="flex justify-between text-sm text-slate-400 mt-2">
                        <span>S/N: {a.serialNumber}</span>
                        <span className="text-emerald-400 font-bold uppercase">{a.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No assets assigned" message="Contact IT to request laptop/peripherals." />
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div key="notifications" className="relative group glass-panel rounded-2xl p-6 col-span-1 lg:col-span-2 flex flex-col justify-between">
            {layoutControls}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Inbox</h3>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {notifications.map((n: any) => (
                    <div key={n.notification_id} className={`p-3 rounded-xl border text-sm text-left ${
                      n.is_read ? 'bg-slate-950/10 border-slate-900 opacity-60' : 'bg-indigo-500/5 border-indigo-500/10'
                    }`}>
                      <span className="text-slate-200 font-bold block">{n.title}</span>
                      <span className="text-slate-400 block mt-1 leading-relaxed">{n.message}</span>
                      <span className="text-sm text-slate-500 block mt-1.5">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Inbox clean" message="No new system notifications." />
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
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Announcements</h3>
              </div>
              {announcements.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {announcements.map((a: any) => (
                    <div key={a.announcement_id} className="p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                      <span className="text-sm font-bold text-white block">{a.title}</span>
                      <span className="text-sm text-slate-400 block mt-1 leading-relaxed">{a.content}</span>
                      <div className="flex justify-between items-center text-sm text-slate-500 mt-3 pt-2 border-t border-slate-800/40">
                        <span>Audience: {a.target_audience}</span>
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Quiet office" message="No new company-wide updates." />
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
                <Clock className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Meetings Alignment</h3>
              </div>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {upcomingMeetings.map((m: any) => (
                    <div key={m.meeting_id} className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl space-y-2">
                      <div>
                        <span className="text-sm font-bold text-white block">{m.title}</span>
                        <span className="text-sm text-slate-400 block">{m.description || 'No description'}</span>
                      </div>
                      <div className="text-sm text-slate-500">
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
                <EmptyState title="No meetings today" message="Enjoy the focus time!" />
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
          <span className="text-sm font-bold text-slate-400">ROLE: EMPLOYEE</span>
          <h2 className="text-xl font-bold text-white tracking-tight">Personal Workspace</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => resetLayout('employee')}
            className="px-3 py-1.5 text-sm font-bold border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
          >
            Reset Widgets Layout
          </button>
          <button
            onClick={refetch}
            disabled={isFetching}
            className="p-2 border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 rounded-lg cursor-pointer transition-all text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid containing draggable widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {widgetLayouts.employee.map((wId, idx) => (
          <ErrorBoundary key={wId}>
            {renderWidget(wId, idx)}
          </ErrorBoundary>
        ))}
      </div>
    </div>
  );
};
