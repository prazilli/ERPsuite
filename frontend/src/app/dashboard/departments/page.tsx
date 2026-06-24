'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Network,
  PlusCircle,
  CheckCircle,
  Loader2,
  Building2,
  Users,
  Layers,
  Zap,
  X,
  Sparkles,
  TrendingUp,
  Shield,
  BarChart3,
  Globe2,
  Cpu,
  Landmark,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

/* ── Department visual config ─────────────────────────── */
interface DeptConfig {
  icon: React.ReactNode;
  bigIcon: React.ReactNode;
  gradient: string;
  cardBg: string;
  iconRing: string;
  badge: string;
  glow: string;
  accent: string;
}

const deptConfigs: Record<string, DeptConfig> = {
  finance: {
    icon: <Zap className="w-6 h-6" />,
    bigIcon: <TrendingUp className="w-16 h-16 opacity-8" />,
    gradient: 'from-emerald-600 via-teal-600 to-green-700',
    cardBg: 'bg-gradient-to-br from-emerald-950/60 via-teal-950/40 to-slate-900/80',
    iconRing: 'bg-emerald-500/15 border-emerald-400/25 text-emerald-400',
    badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    glow: 'shadow-emerald-900/40',
    accent: '#34d399',
  },
  hr: {
    icon: <Users className="w-6 h-6" />,
    bigIcon: <Users className="w-16 h-16 opacity-8" />,
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-700',
    cardBg: 'bg-gradient-to-br from-violet-950/60 via-purple-950/40 to-slate-900/80',
    iconRing: 'bg-violet-500/15 border-violet-400/25 text-violet-400',
    badge: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    glow: 'shadow-violet-900/40',
    accent: '#a78bfa',
  },
  payroll: {
    icon: <Landmark className="w-6 h-6" />,
    bigIcon: <Landmark className="w-16 h-16 opacity-8" />,
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-700',
    cardBg: 'bg-gradient-to-br from-violet-950/60 via-purple-950/40 to-slate-900/80',
    iconRing: 'bg-violet-500/15 border-violet-400/25 text-violet-400',
    badge: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    glow: 'shadow-violet-900/40',
    accent: '#a78bfa',
  },
  supply: {
    icon: <Layers className="w-6 h-6" />,
    bigIcon: <Globe2 className="w-16 h-16 opacity-8" />,
    gradient: 'from-amber-600 via-orange-600 to-yellow-700',
    cardBg: 'bg-gradient-to-br from-amber-950/60 via-orange-950/40 to-slate-900/80',
    iconRing: 'bg-amber-500/15 border-amber-400/25 text-amber-400',
    badge: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    glow: 'shadow-amber-900/40',
    accent: '#fbbf24',
  },
  project: {
    icon: <Sparkles className="w-6 h-6" />,
    bigIcon: <BarChart3 className="w-16 h-16 opacity-8" />,
    gradient: 'from-blue-600 via-indigo-600 to-sky-700',
    cardBg: 'bg-gradient-to-br from-blue-950/60 via-indigo-950/40 to-slate-900/80',
    iconRing: 'bg-blue-500/15 border-blue-400/25 text-blue-400',
    badge: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
    glow: 'shadow-blue-900/40',
    accent: '#60a5fa',
  },
  it: {
    icon: <Cpu className="w-6 h-6" />,
    bigIcon: <Cpu className="w-16 h-16 opacity-8" />,
    gradient: 'from-cyan-600 via-sky-600 to-blue-700',
    cardBg: 'bg-gradient-to-br from-cyan-950/60 via-sky-950/40 to-slate-900/80',
    iconRing: 'bg-cyan-500/15 border-cyan-400/25 text-cyan-400',
    badge: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
    glow: 'shadow-cyan-900/40',
    accent: '#22d3ee',
  },
  executive: {
    icon: <Shield className="w-6 h-6" />,
    bigIcon: <Shield className="w-16 h-16 opacity-8" />,
    gradient: 'from-rose-600 via-pink-600 to-red-700',
    cardBg: 'bg-gradient-to-br from-rose-950/60 via-pink-950/40 to-slate-900/80',
    iconRing: 'bg-rose-500/15 border-rose-400/25 text-rose-400',
    badge: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
    glow: 'shadow-rose-900/40',
    accent: '#fb7185',
  },
};

const defaultConfig: DeptConfig = {
  icon: <Network className="w-6 h-6" />,
  bigIcon: <Building2 className="w-16 h-16 opacity-8" />,
  gradient: 'from-slate-600 via-slate-500 to-slate-700',
  cardBg: 'bg-gradient-to-br from-slate-900/70 via-slate-800/50 to-slate-900/80',
  iconRing: 'bg-slate-500/15 border-slate-400/25 text-slate-400',
  badge: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
  glow: 'shadow-slate-900/40',
  accent: '#94a3b8',
};

function getDeptConfig(name: string): DeptConfig {
  const lower = (name || '').toLowerCase();
  if (lower.includes('finance')) return deptConfigs.finance;
  if (lower.includes('hr') || lower.includes('human')) return deptConfigs.hr;
  if (lower.includes('payroll')) return deptConfigs.payroll;
  if (lower.includes('supply') || lower.includes('chain')) return deptConfigs.supply;
  if (lower.includes('project')) return deptConfigs.project;
  if (lower.includes('it') || lower.includes('admin') || lower.includes('tech')) return deptConfigs.it;
  if (lower.includes('executive') || lower.includes('management')) return deptConfigs.executive;
  return defaultConfig;
}

/* ── Stat Card ────────────────────────────────────────── */
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white/3 backdrop-blur-sm p-5 flex items-center gap-4`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-white mt-0.5">{value}</p>
      </div>
      {/* Decorative orb */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, currentColor, transparent)' }} />
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function DepartmentsPage() {
  const { user, apiFetch } = useAuth();

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqDesc, setReqDesc] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Additional states for department details and head assignment
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<any | null>(null);
  const [selectedHeadForAssign, setSelectedHeadForAssign] = useState<string>('');
  const [companyEmployees, setCompanyEmployees] = useState<any[]>([]);
  const [assigningHead, setAssigningHead] = useState(false);

  const isCompanyAdmin = user?.role === 'Company Head / CEO' || user?.role === 'Company Admin' || user?.role === 'Super Admin';

  const fetchDepartments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiFetch(`/departments?companyId=${user.companyId}`);
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
      setMounted(true);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [user]);

  // Load company employees when an admin user logs in
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user || !isCompanyAdmin) return;
      try {
        const data = await apiFetch(`/users?companyId=${user.companyId}`);
        setCompanyEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load company employees:', err);
      }
    };
    fetchEmployees();
  }, [user, isCompanyAdmin]);

  const handleAssignHead = async (deptId: string) => {
    if (!selectedHeadForAssign) return;
    setAssigningHead(true);
    setError(''); setSuccess('');
    try {
      await apiFetch(`/departments/${deptId}/assign-head`, {
        method: 'PATCH',
        body: JSON.stringify({ userId: parseInt(selectedHeadForAssign, 10) }),
      });
      setSuccess('Department head assigned successfully.');
      
      // Refresh the department list
      const updatedDepts = await apiFetch(`/departments?companyId=${user?.companyId}`);
      const refreshedDeptList = Array.isArray(updatedDepts) ? updatedDepts : [];
      setDepartments(refreshedDeptList);
      
      // Update the active detail modal state with updated department data
      const updatedDept = refreshedDeptList.find((d: any) => d.department_id?.toString() === deptId);
      if (updatedDept) {
        setSelectedDeptForDetail(updatedDept);
      } else {
        setSelectedDeptForDetail(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to assign department head.');
    } finally {
      setAssigningHead(false);
    }
  };

  const [deletingDept, setDeletingDept] = useState(false);

  const handleDeleteDepartment = async (deptId: string) => {
    if (!window.confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      return;
    }
    setDeletingDept(true);
    setError(''); setSuccess('');
    try {
      await apiFetch(`/departments/${deptId}`, {
        method: 'DELETE',
      });
      setSuccess('Department deleted successfully.');
      setSelectedDeptForDetail(null);
      // Refresh the department list
      fetchDepartments();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete department.');
    } finally {
      setDeletingDept(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await apiFetch(`/requests?companyId=${user?.companyId}`, {
        method: 'POST',
        body: JSON.stringify({ departmentName: reqName, description: reqDesc }),
      });
      setSuccess('Department request submitted. Pending admin approval.');
      setReqName(''); setReqDesc(''); setShowRequestModal(false);
    } catch (err: any) {
      setError(err.message || 'Request submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await apiFetch(`/departments?companyId=${user?.companyId}`, {
        method: 'POST',
        body: JSON.stringify({ name: deptName, description: deptDesc, featuresEnabled: ['analytics', 'tasks'] }),
      });
      setSuccess(`Department "${deptName}" created successfully.`);
      setDeptName(''); setDeptDesc(''); setShowCreateModal(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Creation failed');
    } finally {
      setSubmitting(false);
    }
  };
  const totalFeatures = departments.reduce((acc, d) => acc + (d.features?.length || 0), 0);

  /* ── Loading State ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-blue-900/50 animate-float">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-cyan-500 border-2 border-slate-900 flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">Loading Departments</p>
          <p className="text-sm text-slate-400 mt-1">Fetching your organizational structure...</p>
        </div>
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-white/3 border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="animate-fade-in-up">
        <div className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #0c1a3a 40%, #0a1628 100%)',
            border: '1px solid rgba(99, 119, 168, 0.15)',
          }}
        >
          {/* Background mesh orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: Text */}
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-900/50 animate-float shrink-0">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                  <span className="text-sm font-bold uppercase tracking-widest text-cyan-400">Amdox ERP — Structure</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                  Department Catalog
                </h1>
                <p className="text-base text-slate-400 mt-1.5 leading-relaxed">
                  Organizational divisions, module features & team assignments
                </p>
              </div>
            </div>

            {/* Right: Action button */}
            <div className="flex items-center gap-3 shrink-0">
              {isCompanyAdmin ? (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm transition-all shadow-2xl shadow-blue-900/50 flex items-center gap-2 cursor-pointer animate-gradient"
                >
                  <PlusCircle className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform duration-300" />
                  Create Department
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              ) : (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="group px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-2xl shadow-violet-900/50 flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform duration-300" />
                  Request Department
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <StatCard
          label="Total Departments"
          value={departments.length}
          icon={<Building2 className="w-5 h-5 text-blue-400" />}
          color="bg-blue-500/10 border border-blue-500/20"
        />
        <StatCard
          label="Enabled Modules"
          value={totalFeatures}
          icon={<Layers className="w-5 h-5 text-violet-400" />}
          color="bg-violet-500/10 border border-violet-500/20"
        />
        <StatCard
          label="System Status"
          value="Operational"
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          color="bg-emerald-500/10 border border-emerald-500/20"
        />
      </div>

      {/* ── Alerts ──────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20 text-base text-red-300 animate-fade-in">
          <X className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-base text-emerald-300 animate-fade-in">
          <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────── */}
      {departments.length === 0 && mounted && (
        <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in-up">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/40 flex items-center justify-center animate-float">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">No departments yet</p>
            <p className="text-base text-slate-400 mt-2 max-w-sm">
              {isCompanyAdmin
                ? 'Create your first department to build your organizational structure.'
                : 'Submit a department request and the admin will review it.'}
            </p>
          </div>
          {isCompanyAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            >
              <PlusCircle className="w-4.5 h-4.5" /> Create First Department
            </button>
          )}
        </div>
      )}

      {/* ── Departments Grid ─────────────────────────────── */}
      {departments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
          {departments.map((dept) => {
            const cfg = getDeptConfig(dept.department_name || '');
            const features: any[] = dept.features || [];

            return (
              <div
                key={dept.department_id?.toString() ?? dept.department_name}
                onClick={() => {
                  setSelectedDeptForDetail(dept);
                  setSelectedHeadForAssign(dept.head?.id || '');
                }}
                className={`dept-card animate-fade-in-up relative overflow-hidden rounded-2xl border border-white/6 ${cfg.cardBg} p-6 flex flex-col gap-5 cursor-pointer hover:border-white/20 hover:scale-[1.02] transition-all duration-300 shadow-xl ${cfg.glow}`}
              >
                {/* Decorative background icon */}
                <div className="absolute right-4 bottom-4 opacity-5 text-white pointer-events-none">
                  {cfg.bigIcon}
                </div>

                {/* Gradient accent line at top */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cfg.gradient}`} />

                {/* ── Card Top Row ── */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${cfg.iconRing}`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{dept.department_name}</h3>
                      <span className="text-sm text-slate-500 font-medium mt-0.5 block">
                        Dept #{dept.department_id?.toString()}
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border shrink-0 ${cfg.badge}`}>
                    Active
                  </span>
                </div>

                {/* ── Description ── */}
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {dept.description || 'No description provided for this department unit.'}
                </p>

                {/* ── Feature Chips ── */}
                {features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {features.slice(0, 4).map((f: any, fi: number) => (
                      <span
                        key={fi}
                        className="text-sm font-semibold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-slate-300"
                      >
                        {f.feature_name}
                      </span>
                    ))}
                    {features.length > 4 && (
                      <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-slate-500">
                        +{features.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* ── Footer ── */}
                <div className="border-t border-white/6 pt-4 flex justify-between items-end mt-auto">
                  <div>
                    <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Designated Head</div>
                    <div className="text-sm text-white font-semibold mt-1">
                      {dept.head?.name || 'Vacant / Unassigned'}
                    </div>
                  </div>
                  <div>
                    {dept.is_custom ? (
                      <span className="text-sm font-bold text-amber-400/80 uppercase tracking-wider">Custom</span>
                    ) : (
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">System</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: Request Department ────────────────────── */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-40 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden animate-fade-in-up"
            style={{ background: 'linear-gradient(145deg, #0f1a2e 0%, #0b1523 100%)' }}>
            {/* Modal header stripe */}
            <div className="h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600" />

            <div className="p-7 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-violet-500/15 border border-violet-400/20 flex items-center justify-center text-violet-400">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Request New Department</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Requires Company Administrator approval</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowRequestModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Department Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text" required
                    placeholder="e.g. Operations Management"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder-slate-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Justification & Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required rows={3}
                    placeholder="Provide scope, core functions, and headcount expectations."
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder-slate-500 resize-none transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowRequestModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-violet-900/40">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Submit Request</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Create Department (Admin) ─────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-40 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden animate-fade-in-up"
            style={{ background: 'linear-gradient(145deg, #0f1a2e 0%, #0b1523 100%)' }}>
            <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-600" />

            <div className="p-7 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Create New Department</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Scaffold a department immediately</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Department Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text" required
                    placeholder="e.g. Sales & Marketing"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Core functions of this department unit."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 resize-none transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all cursor-pointer">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Create Now</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}      {/* ── MODAL: Department Details & Assignment ──────── */}
      {selectedDeptForDetail && (() => {
        const cfg = getDeptConfig(selectedDeptForDetail.department_name || '');
        const features = selectedDeptForDetail.features || [];
        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-40 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xl rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden animate-fade-in-up"
              style={{ background: 'linear-gradient(145deg, #0f1a2e 0%, #0b1523 100%)' }}>
              {/* Top gradient stripe matching department theme */}
              <div className={`h-1 bg-gradient-to-r ${cfg.gradient}`} />

              <div className="p-7 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${cfg.iconRing}`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-tight">{selectedDeptForDetail.department_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500 font-mono">ID: #{selectedDeptForDetail.department_id?.toString()}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.badge}`}>
                          {selectedDeptForDetail.is_custom ? 'Custom' : 'System'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeptForDetail(null);
                      setError('');
                      setSuccess('');
                    }}
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-1">
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">About Department</h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 border border-white/5 rounded-xl p-4">
                      {selectedDeptForDetail.description || 'No description provided for this department unit.'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Enabled Features & Modules</h4>
                    {features.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {features.map((f: any, fi: number) => (
                          <span
                            key={fi}
                            className="text-sm font-semibold uppercase tracking-wide px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-slate-300 flex items-center gap-1.5"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            {f.feature_name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No features enabled.</p>
                    )}
                  </div>

                  {/* Assignment Section */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Designated Department Head</h4>
                    
                    {/* Read-Only or Edit view */}
                    {isCompanyAdmin ? (
                      <div className="space-y-4 bg-slate-950/30 border border-white/5 rounded-2xl p-5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Current Assignment:</span>
                          <span className="font-bold text-cyan-400">
                            {selectedDeptForDetail.head?.name || 'Vacant / Unassigned'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-300">
                            Select New Department Head
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <select
                              value={selectedHeadForAssign}
                              onChange={(e) => setSelectedHeadForAssign(e.target.value)}
                              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer min-w-0"
                            >
                              <option value="">Select Employee</option>
                              {companyEmployees
                                .filter((emp) => emp.role?.name !== 'Company Head / CEO' && emp.role?.name !== 'Super Admin')
                                .map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.role?.name || emp.role})
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleAssignHead(selectedDeptForDetail.department_id.toString())}
                              disabled={!selectedHeadForAssign || assigningHead || selectedHeadForAssign === selectedDeptForDetail.head?.id?.toString()}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-white/5 disabled:cursor-not-allowed border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0"
                            >
                              {assigningHead ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  {selectedDeptForDetail.head ? 'Update Head' : 'Assign Head'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl p-4">
                        <UserCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                        <div>
                          <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Department Head</div>
                          <div className="text-sm font-semibold text-white">
                            {selectedDeptForDetail.head?.name || 'Vacant / Unassigned'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                </div>

                {/* Footer Action */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  {isCompanyAdmin ? (
                    <button
                      type="button"
                      disabled={deletingDept}
                      onClick={() => handleDeleteDepartment(selectedDeptForDetail.department_id.toString())}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {deletingDept ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          Delete Department
                        </>
                      )}
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDeptForDetail(null);
                      setError('');
                      setSuccess('');
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
