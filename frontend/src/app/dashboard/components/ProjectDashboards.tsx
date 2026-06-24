'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Trophy,
  Flame,
  LineChart,
  PlusCircle,
  CheckCircle,
  Loader2,
  Calendar
} from 'lucide-react';

/* 1. PROJECT HEAD DASHBOARD */
interface Props {
  metrics: any;
}

export const ProjectHeadDashboard: React.FC<Props> = ({ metrics }) => {
  const data = metrics || {
    activeProjectsCount: 5,
    sprintsCompleted: 24,
    averageBurnRate: 85,
    milestonesAchieved: 18,
    tasksOverview: { todo: 12, inProgress: 8, review: 4, done: 45 },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Project Deliveries board</h2>
          <p className="text-sm text-text-muted">Sprint boards, Gantt timelines, and team budget burn rates</p>
        </div>
        <span className="text-sm bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Project Head
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', val: data.activeProjectsCount, icon: FolderKanban, color: 'text-purple-400', bg: 'bg-purple-500/5' },
          { label: 'Milestones Achieved', val: data.milestonesAchieved, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/5' },
          { label: 'Sprints Completed', val: data.sprintsCompleted, icon: LineChart, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Average Burn Rate', val: `${data.averageBurnRate}%`, icon: Flame, color: 'text-red-400', bg: 'bg-red-500/5' },
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

      {/* Task status summary */}
      <div className="glass-panel rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4">Sprint Task Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'To-Do', count: data.tasksOverview?.todo || 0, color: 'border-slate-700 bg-slate-900/30' },
            { label: 'In Progress', count: data.tasksOverview?.inProgress || 0, color: 'border-blue-500/20 bg-blue-500/5 text-blue-400' },
            { label: 'Review', count: data.tasksOverview?.review || 0, color: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400' },
            { label: 'Done', count: data.tasksOverview?.done || 0, color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' },
          ].map((t, i) => (
            <div key={i} className={`p-4 rounded-xl border text-center ${t.color}`}>
              <div className="text-sm uppercase font-bold text-text-muted">{t.label}</div>
              <h4 className="text-2xl font-bold mt-1">{t.count}</h4>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/* 2. PROJECT EMPLOYEE DASHBOARD */
export const ProjectEmployeeDashboard: React.FC = () => {
  const [taskName, setTaskName] = useState('');
  const [hours, setHours] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [activeTasks, setActiveTasks] = useState([
    { id: 1, name: 'Scaffold Next.js layouts & styling contexts', project: 'Cloud ERP Shell', status: 'In Progress' },
    { id: 2, name: 'Write Prisma database schema mappings', project: 'Cloud ERP Core', status: 'Review' },
  ]);

  const handleTimesheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setSubmitting(true);

    setTimeout(() => {
      setSuccess(`Timesheet logged: ${hours} hours for "${taskName}".`);
      setTaskName('');
      setHours('');
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Project Tasks Board</h2>
          <p className="text-sm text-text-muted">Assigned tickets, sprint planning, and timesheet loggers</p>
        </div>
        <span className="text-sm bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Project Employee
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Active tasks assigned */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">My Sprint Backlog</h3>
          <div className="space-y-3.5">
            {activeTasks.map((task) => (
              <div key={task.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex justify-between items-center hover:border-slate-700 transition-all">
                <div>
                  <div className="text-sm font-bold text-white">{task.name}</div>
                  <div className="text-sm text-text-muted mt-0.5">Project: {task.project}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    task.status === 'Review' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submit Timesheet */}
        <div className="glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Log Timesheet hours
          </h3>

          {success && (
            <div className="mb-4 p-2.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleTimesheetSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Task Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Debugging backend controllers"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wider mb-1.5">Hours Worked</label>
              <input
                type="number"
                required
                step="0.5"
                placeholder="e.g. 4.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all mt-4"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>Log Timesheet Entry <PlusCircle className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
