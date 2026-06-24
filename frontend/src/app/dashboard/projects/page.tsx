'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  PlusCircle,
  Loader2,
  Paperclip,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Plus,
  BookOpen
} from 'lucide-react';

export default function ProjectsPage() {
  const { user, apiFetch } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projDetails, setProjDetails] = useState<any>(null);
  const [projAnalytics, setProjAnalytics] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active Detail Tab
  const [activeTab, setActiveTab] = useState<'tasks' | 'milestones' | 'timesheets' | 'members' | 'docs'>('tasks');

  // Form states: New Project
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pClientId, setPClientId] = useState('');
  const [pBudget, setPBudget] = useState('');
  const [pStartDate, setPStartDate] = useState('');
  const [pEndDate, setPEndDate] = useState('');
  const [submittingProject, setSubmittingProject] = useState(false);

  // Form states: Assign Member
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('Developer');
  const [assigningMember, setAssigningMember] = useState(false);

  // Form states: Add Milestone
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mDueDate, setMDueDate] = useState('');
  const [mTargetCost, setMTargetCost] = useState('');
  const [mTargetRev, setMTargetRev] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Form states: Add Task
  const [tTitle, setTTitle] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tAssigneeId, setTAssigneeId] = useState('');
  const [tPriority, setTPriority] = useState('MEDIUM');
  const [tEstHours, setTEstHours] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Form states: Log Timesheet
  const [selectedTaskForTimesheet, setSelectedTaskForTimesheet] = useState<any | null>(null);
  const [tsHours, setTsHours] = useState('');
  const [tsDesc, setTsDesc] = useState('');
  const [tsDate, setTsDate] = useState('');
  const [loggingTimesheet, setLoggingTimesheet] = useState(false);

  // Form states: Add Document
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [addingDoc, setAddingDoc] = useState(false);

  const loadProjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const list = await apiFetch('/projects');
      setProjects(list);
      
      const emps = await apiFetch('/hrms/employees');
      setEmployees(emps);

      const cls = await apiFetch('/crm/clients');
      setClients(cls);
    } catch (e: any) {
      setError(e.message || 'Failed to load projects list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user]);

  const fetchProjectDetails = async (projId: number) => {
    try {
      setLoadingDetails(true);
      setError('');
      const details = await apiFetch(`/projects/${projId}`);
      const analytics = await apiFetch(`/projects/${projId}/analytics`);
      setProjDetails(details);
      setProjAnalytics(analytics);
    } catch (e: any) {
      setError(e.message || 'Failed to load project workspaces.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const selectProject = (proj: any) => {
    setSelectedProject(proj);
    fetchProjectDetails(proj.project_id);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmittingProject(true);
    try {
      const created = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: pName,
          description: pDesc,
          clientId: pClientId ? parseInt(pClientId, 10) : null,
          budget: parseFloat(pBudget),
          startDate: pStartDate,
          endDate: pEndDate,
        })
      });
      setSuccess(`Project "${pName}" launched successfully.`);
      setPName(''); setPDesc(''); setPClientId(''); setPBudget(''); setPStartDate(''); setPEndDate('');
      setShowCreateModal(false);
      loadProjects();
    } catch (e: any) {
      setError(e.message || 'Failed to launch project.');
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setError(''); setSuccess(''); setAssigningMember(true);
    try {
      await apiFetch(`/projects/${selectedProject.project_id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          userId: parseInt(assignUserId, 10),
          role: assignRole,
        })
      });
      setSuccess('Project assignment logged successfully.');
      setAssignUserId('');
      fetchProjectDetails(selectedProject.project_id);
    } catch (e: any) {
      setError(e.message || 'Assignment failed.');
    } finally {
      setAssigningMember(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setError(''); setSuccess(''); setAddingMilestone(true);
    try {
      await apiFetch(`/projects/${selectedProject.project_id}/milestones`, {
        method: 'POST',
        body: JSON.stringify({
          title: mTitle,
          description: mDesc,
          dueDate: mDueDate,
          targetCost: mTargetCost ? parseFloat(mTargetCost) : 0,
          targetRevenue: mTargetRev ? parseFloat(mTargetRev) : 0,
        })
      });
      setSuccess('Milestone added successfully.');
      setMTitle(''); setMDesc(''); setMDueDate(''); setMTargetCost(''); setMTargetRev('');
      fetchProjectDetails(selectedProject.project_id);
    } catch (e: any) {
      setError(e.message || 'Failed to add milestone.');
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setError(''); setSuccess(''); setAddingTask(true);
    try {
      await apiFetch(`/projects/${selectedProject.project_id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: tTitle,
          description: tDesc,
          assignedToId: tAssigneeId ? parseInt(tAssigneeId, 10) : null,
          priority: tPriority,
          estimatedHours: tEstHours ? parseFloat(tEstHours) : 0,
        })
      });
      setSuccess('Task logged and assigned successfully.');
      setTTitle(''); setTDesc(''); setTAssigneeId(''); setTEstHours('');
      fetchProjectDetails(selectedProject.project_id);
    } catch (e: any) {
      setError(e.message || 'Task addition failed.');
    } finally {
      setAddingTask(false);
    }
  };

  const handleLogTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForTimesheet || !selectedProject) return;
    setError(''); setSuccess(''); setLoggingTimesheet(true);
    try {
      await apiFetch(`/projects/tasks/${selectedTaskForTimesheet.task_id}/timesheets`, {
        method: 'POST',
        body: JSON.stringify({
          hoursLogged: parseFloat(tsHours),
          description: tsDesc,
          date: tsDate,
        })
      });
      setSuccess('Hours logged to timesheet registry.');
      setTsHours(''); setTsDesc(''); setTsDate('');
      setSelectedTaskForTimesheet(null);
      fetchProjectDetails(selectedProject.project_id);
    } catch (e: any) {
      setError(e.message || 'Timesheet logging failed.');
    } finally {
      setLoggingTimesheet(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setError(''); setSuccess(''); setAddingDoc(true);
    try {
      await apiFetch(`/projects/${selectedProject.project_id}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          documentName: docName,
          fileUrl: docUrl,
        })
      });
      setSuccess('Reference document linked.');
      setDocName(''); setDocUrl('');
      fetchProjectDetails(selectedProject.project_id);
    } catch (e: any) {
      setError(e.message || 'Failed to link document.');
    } finally {
      setAddingDoc(false);
    }
  };

  const handleActionMilestone = async (milestoneId: number, status: string) => {
    if (!selectedProject) return;
    setError(''); setSuccess('');
    try {
      await apiFetch(`/projects/milestones/${milestoneId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setSuccess('Milestone status advanced.');
      fetchProjectDetails(selectedProject.project_id);
    } catch (e: any) {
      setError(e.message || 'Milestone update failed.');
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center text-text-muted text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" /> Synced project nodes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" /> Projects Portfolio & Milestones
          </h2>
          <p className="text-sm text-text-muted">Assigned tasks boards, client deliverables, and timesheets</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md animate-gradient"
          >
            <PlusCircle className="w-4 h-4" /> Start Project Node
          </button>
          <button
            onClick={loadProjects}
            className="p-2 rounded-lg border border-border-color bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-400 font-medium">
          {success}
        </div>
      )}

      {/* Split pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Projects lists */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Active Workspace Nodes ({projects.length})</h3>
          <div className="space-y-3">
            {projects.map((proj) => {
              const isSelected = selectedProject?.project_id === proj.project_id;
              return (
                <div
                  key={proj.project_id}
                  onClick={() => selectProject(proj)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                      : 'bg-slate-900/40 border-white/5 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-white leading-tight">{proj.project_name}</h4>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold uppercase ${
                      proj.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed line-clamp-2">{proj.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-sm text-slate-400">
                    <div>
                      <span className="text-text-muted block text-xs uppercase">Budget Limit</span>
                      <span className="font-bold text-emerald-400">${proj.budget?.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-text-muted block text-xs uppercase">Delivery Target</span>
                      <span className="font-bold text-slate-300">{new Date(proj.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2-Span): Detail workspace */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            loadingDetails ? (
              <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center text-sm text-text-muted flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400 mr-2" /> Syncing project logs...
              </div>
            ) : (
              <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl space-y-6">
                
                {/* Workspace Title & Stats */}
                <div className="p-6 border-b border-white/5 bg-slate-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-black text-white">{projDetails?.project_name}</h3>
                    <p className="text-sm text-text-muted mt-0.5">{projDetails?.description}</p>
                  </div>
                  <span className="text-sm bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    Workspace Active
                  </span>
                </div>

                {/* Analytical KPIs row */}
                <div className="px-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Milestone Progress', val: `${projAnalytics?.milestoneCompletionPercentage || 0}%`, icon: Layers, color: 'text-blue-400' },
                    { label: 'Logged Hours', val: `${projAnalytics?.totalHoursLogged || 0} Hrs`, icon: Clock, color: 'text-cyan-400' },
                    { label: 'Operating Cost', val: `$${(projAnalytics?.totalCostSpent || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
                    { label: 'Milestones Completed', val: `${projAnalytics?.completedMilestones || 0}/${projAnalytics?.totalMilestones || 0}`, icon: CheckCircle, color: 'text-purple-400' },
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/30 border border-white/5 flex items-center gap-3">
                      <div className="p-2 rounded bg-white/5 text-slate-300">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div>
                        <span className="text-xs uppercase text-text-muted font-bold block">{stat.label}</span>
                        <h4 className="text-sm font-black text-white mt-0.5">{stat.val}</h4>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tab selections */}
                <div className="px-6 border-b border-white/5 flex gap-4 overflow-x-auto">
                  {[
                    { key: 'tasks', label: 'Tasks Board' },
                    { key: 'milestones', label: 'Milestones' },
                    { key: 'timesheets', label: 'Timesheets' },
                    { key: 'members', label: 'Team Members' },
                    { key: 'docs', label: 'Reference Files' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`pb-3 text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
                        activeTab === tab.key ? 'text-cyan-400' : 'text-text-muted hover:text-white'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Dynamic Tab Body */}
                <div className="p-6">
                  
                  {activeTab === 'tasks' && (
                    <div className="space-y-6">
                      
                      {/* Form: Add Task */}
                      <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Log & Assign New Task</h4>
                        <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Task Name</label>
                            <input
                              type="text" required
                              placeholder="e.g. Design API controller"
                              value={tTitle}
                              onChange={(e) => setTTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Assignee</label>
                            <select
                              value={tAssigneeId}
                              onChange={(e) => setTAssigneeId(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            >
                              <option value="">Unassigned</option>
                              {employees.map((e) => (
                                <option key={e.user_id} value={e.user_id}>{e.first_name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Est Hours</label>
                            <input
                              type="number" required
                              placeholder="8"
                              value={tEstHours}
                              onChange={(e) => setTEstHours(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={addingTask}
                            className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-sm"
                          >
                            {addingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Add Task'}
                          </button>
                        </form>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-3">
                        {(projDetails?.tasks || []).map((task: any) => (
                          <div key={task.task_id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center hover:border-slate-800 transition-all">
                            <div>
                              <h4 className="text-sm font-bold text-white">{task.title}</h4>
                              <div className="flex gap-2.5 text-xs text-text-muted mt-1 font-medium">
                                <span>Assignee: {task.assigned_to?.first_name || 'Unassigned'}</span>
                                <span>|</span>
                                <span>Priority: {task.priority}</span>
                                <span>|</span>
                                <span>Est Hours: {task.estimated_hours}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                                task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                              }`}>
                                {task.status}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedTaskForTimesheet(task);
                                  setTsDate(new Date().toISOString().substring(0, 10));
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded font-semibold border border-white/5 cursor-pointer"
                              >
                                Log Hours
                              </button>
                            </div>
                          </div>
                        ))}
                        {(projDetails?.tasks || []).length === 0 && (
                          <div className="text-center text-sm text-text-muted py-6">No tasks logged in this project workspace.</div>
                        )}
                      </div>

                    </div>
                  )}

                  {activeTab === 'milestones' && (
                    <div className="space-y-6">
                      
                      {/* Form: Add Milestone */}
                      <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Create Project Milestone</h4>
                        <form onSubmit={handleCreateMilestone} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Milestone Title</label>
                            <input
                              type="text" required
                              placeholder="e.g. Phase 1 Release"
                              value={mTitle}
                              onChange={(e) => setMTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Target Date</label>
                            <input
                              type="date" required
                              value={mDueDate}
                              onChange={(e) => setMDueDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={addingMilestone}
                            className="py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
                          >
                            {addingMilestone ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Log Milestone'}
                          </button>
                        </form>
                      </div>

                      {/* Milestones list */}
                      <div className="space-y-3">
                        {(projDetails?.milestones || []).map((milestone: any) => (
                          <div key={milestone.milestone_id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-bold text-white">{milestone.title}</h4>
                              <span className="text-xs text-text-muted mt-1 block">Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                              {milestone.status !== 'COMPLETED' ? (
                                <button
                                  onClick={() => handleActionMilestone(milestone.milestone_id, 'COMPLETED')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded cursor-pointer transition-all"
                                >
                                  Complete
                                </button>
                              ) : (
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {activeTab === 'timesheets' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5"><Clock className="w-4 h-4 text-cyan-400" /> Task Timesheets Trail</h4>
                      <div className="space-y-3">
                        {/* Iterate tasks to extract timesheets */}
                        {(projDetails?.tasks || []).flatMap((t: any) => t.timesheets || []).map((ts: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-950/20 border border-white/5 flex justify-between items-center text-sm">
                            <div>
                              <span className="text-white block font-semibold">{ts.description}</span>
                              <span className="text-xs text-text-muted block mt-0.5">Logged: {new Date(ts.date).toLocaleDateString()}</span>
                            </div>
                            <span className="font-bold text-cyan-400 font-mono">{ts.hours_logged} Hours</span>
                          </div>
                        ))}
                        {!(projDetails?.tasks || []).some((t: any) => t.timesheets?.length > 0) && (
                          <div className="text-center text-sm text-text-muted py-6">No hours logged yet.</div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'members' && (
                    <div className="space-y-6">
                      
                      {/* Form: Assign Member */}
                      <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Assign Team Member</h4>
                        <form onSubmit={handleAssignMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Select User</label>
                            <select
                              value={assignUserId}
                              onChange={(e) => setAssignUserId(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            >
                              <option value="">Select Employee</option>
                              {employees.map((e) => (
                                <option key={e.user_id} value={e.user_id}>{e.first_name} {e.last_name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Project Role</label>
                            <input
                              type="text" required
                              value={assignRole}
                              onChange={(e) => setAssignRole(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={assigningMember}
                            className="py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
                          >
                            {assigningMember ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Assign'}
                          </button>
                        </form>
                      </div>

                      {/* Members List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(projDetails?.members || []).map((m: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-bold text-white">{m.user?.first_name} {m.user?.last_name}</h4>
                              <span className="text-xs text-text-muted mt-0.5 block">{m.user?.email}</span>
                            </div>
                            <span className="text-xs bg-slate-800 text-slate-300 border border-white/5 px-2 py-0.5 rounded font-bold uppercase">
                              {m.role}
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {activeTab === 'docs' && (
                    <div className="space-y-6">
                      
                      {/* Form: Add Document */}
                      <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> Attach Document Link</h4>
                        <form onSubmit={handleAddDocument} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">Document Name</label>
                            <input
                              type="text" required
                              placeholder="e.g. Architecture Spec"
                              value={docName}
                              onChange={(e) => setDocName(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase text-text-muted mb-1 font-bold">URL / Reference Path</label>
                            <input
                              type="text" required
                              placeholder="e.g. /docs/arch-v1.pdf"
                              value={docUrl}
                              onChange={(e) => setDocUrl(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-white/5 text-white text-sm"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={addingDoc}
                            className="py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm"
                          >
                            {addingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Link Doc'}
                          </button>
                        </form>
                      </div>

                      {/* Documents List */}
                      <div className="space-y-3">
                        {(projDetails?.documents || []).map((doc: any) => (
                          <div key={doc.document_id} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center text-sm">
                            <span className="text-white block font-semibold">{doc.document_name}</span>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline text-sm font-bold flex items-center gap-0.5"
                            >
                              Open Attachment <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                </div>

              </div>
            )
          ) : (
            <div className="glass-panel border border-white/5 rounded-2xl p-16 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-slate-900/50 border border-white/5 text-slate-500 mb-2">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Project Selected</h3>
              <p className="text-sm text-text-muted max-w-sm mx-auto">
                Select an active project node from the portfolio index column to load the task boards and milestones tracker.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: New Project */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" /> Start New Project Node
              </h3>
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text" required
                    placeholder="e.g. NextGen ERP Construction"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Description / Project Scope</label>
                  <textarea
                    required rows={3}
                    placeholder="Provide details about the contract scope..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Client Association</label>
                    <select
                      value={pClientId}
                      onChange={(e) => setPClientId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="">Unassigned / Internal</option>
                      {clients.map((c) => (
                        <option key={c.client_id} value={c.client_id}>{c.client_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Budget Allocation ($)</label>
                    <input
                      type="number" required
                      placeholder="e.g. 50000"
                      value={pBudget}
                      onChange={(e) => setPBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date" required
                      value={pStartDate}
                      onChange={(e) => setPStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase text-slate-400 mb-1">End Date</label>
                    <input
                      type="date" required
                      value={pEndDate}
                      onChange={(e) => setPEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProject}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center gap-1.5"
                  >
                    {submittingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Launch Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Timesheet on Task */}
      {selectedTaskForTimesheet && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400 animate-pulse" /> Log Hours: {selectedTaskForTimesheet.title}
              </h3>
              
              <form onSubmit={handleLogTimesheet} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Hours Logged</label>
                  <input
                    type="number" required
                    placeholder="e.g. 4.5"
                    value={tsHours}
                    onChange={(e) => setTsHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Work Date</label>
                  <input
                    type="date" required
                    value={tsDate}
                    onChange={(e) => setTsDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase text-slate-400 mb-1">Description / Notes</label>
                  <textarea
                    required rows={2}
                    placeholder="Describe tasks completed..."
                    value={tsDesc}
                    onChange={(e) => setTsDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForTimesheet(null)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loggingTimesheet}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {loggingTimesheet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Log Hours'}
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
