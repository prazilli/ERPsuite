'use client';

import React from 'react';
import {
  ShieldAlert,
  Building,
  Users,
  Server,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles,
  Check,
  Loader2
} from 'lucide-react';

/* 1. PLATFORM SUPER ADMIN DASHBOARD */
export const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Platform Control Room</h2>
          <p className="text-sm text-text-muted">Global analytics across all tenants & servers</p>
        </div>
        <span className="text-sm bg-red-500/10 text-red-400 border border-red-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Super Admin Privilege
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Company Tenants', val: '42', icon: Building, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Global Active Users', val: '1,842', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Server Cluster Status', val: 'Healthy', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Critical System Alerts', val: '0', icon: ShieldAlert, color: 'text-slate-400', bg: 'bg-slate-500/5' },
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

      {/* Database/Cluster Health status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Active System Nodes
          </h3>
          <div className="space-y-4">
            {[
              { node: 'AP-South-1 (Primary MySQL Server)', load: '12%', status: 'Online', latency: '4ms' },
              { node: 'AP-South-2 (Primary Redis Cache Cluster)', load: '4%', status: 'Online', latency: '1ms' },
              { node: 'US-East-1 (Global File storage bucket)', load: '24%', status: 'Online', latency: '45ms' },
            ].map((n, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40 border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">{n.node}</div>
                  <div className="text-sm text-text-muted mt-0.5">CPU Load: {n.load} | Latency: {n.latency}</div>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  {n.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Global Operations Summary</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Platform is currently executing at optimum speed. Automatic seed script checks completed successfully. Next scheduled DB purge in 4 hours.
            </p>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4">
            <div className="text-sm text-cyan-400 font-semibold mb-1">Backup status:</div>
            <div className="text-xs text-text-muted">Last Backup completed at 2026-06-21 00:00 UTC (S3 Sync).</div>
          </div>
        </div>

      </div>

    </div>
  );
};


interface DepartmentEfficiencyChartProps {
  data: any[];
}

const DepartmentEfficiencyChart: React.FC<DepartmentEfficiencyChartProps> = ({ data = [] }) => {
  const [hoveredBar, setHoveredBar] = React.useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-sm py-8 text-center">No efficiency data available</div>;
  }

  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Render grid lines for 0%, 25%, 50%, 75%, 100%
  const gridTicks = [0, 25, 50, 75, 100];

  const getBarX = (index: number) => {
    const numBars = data.length;
    const spacing = chartWidth / numBars;
    const barWidth = Math.min(32, spacing * 0.45);
    const x = paddingLeft + index * spacing + (spacing - barWidth) / 2;
    return { x, barWidth };
  };

  const getBarY = (efficiency: number) => {
    const ratio = efficiency / 100;
    const y = paddingTop + chartHeight * (1 - ratio);
    const h = chartHeight * ratio;
    return { y, h };
  };

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.15} />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.4} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid lines */}
        {gridTicks.map((tick) => {
          const y = paddingTop + chartHeight * (1 - tick / 100);
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={1}
                strokeDasharray={tick === 0 || tick === 100 ? undefined : "3,3"}
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-sm fill-slate-500 font-bold font-mono"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Axis line */}
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={1}
        />

        {/* Bars */}
        {data.map((dept, idx) => {
          const { x, barWidth } = getBarX(idx);
          const { y, h } = getBarY(dept.efficiency);
          const isHovered = hoveredBar === idx;

          // Short name for visual clarity on smaller SVG text
          const displayNames: Record<string, string> = {
            'Executive Management': 'Exec Mgmt',
            'Finance': 'Finance',
            'HR & Payroll': 'HR & Payroll',
            'Supply Chain': 'Supply Chain',
            'Project Management': 'Projects',
            'IT Administration': 'IT Admin',
          };
          const label = displayNames[dept.name] || dept.name;

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Invisible interactive background wide rect to make hover easy */}
              <rect
                x={x - barWidth}
                y={paddingTop}
                width={barWidth * 3}
                height={chartHeight}
                fill="transparent"
              />

              {/* Background shadow/glow for hovered bar */}
              {isHovered && (
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  fill="#22d3ee"
                  opacity={0.15}
                  rx={4}
                  filter="url(#glow)"
                />
              )}

              {/* The Actual Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                stroke={isHovered ? "#38bdf8" : "#22d3ee"}
                strokeWidth={isHovered ? 1.5 : 1}
                strokeOpacity={isHovered ? 0.9 : 0.4}
                rx={4}
                className="transition-all duration-300"
              />

              {/* Value on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className={`text-sm font-bold ${isHovered ? 'fill-cyan-400 font-extrabold' : 'fill-slate-300 font-semibold'}`}
              >
                {dept.efficiency}%
              </text>

              {/* X Axis Labels */}
              <text
                x={x + barWidth / 2}
                y={paddingTop + chartHeight + 16}
                textAnchor="middle"
                className={`text-xs font-bold tracking-tight transition-colors duration-250 ${
                  isHovered ? 'fill-white' : 'fill-slate-400'
                }`}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating HTML tooltip */}
      {hoveredBar !== null && (
        <div
          className="absolute z-10 bg-slate-950/95 border border-cyan-500/30 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl pointer-events-none text-sm transition-all duration-150 animate-fade-in"
          style={{
            left: `${((getBarX(hoveredBar).x + getBarX(hoveredBar).barWidth / 2) / width) * 100}%`,
            top: `${((getBarY(data[hoveredBar].efficiency).y - 20) / height) * 100}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-bold text-white whitespace-nowrap">{data[hoveredBar].name}</div>
          <div className="flex justify-between items-center gap-4 mt-1">
            <span className="text-sm text-slate-400">Efficiency Score:</span>
            <span className="font-black text-cyan-400 font-mono">{data[hoveredBar].efficiency}%</span>
          </div>
          {data[hoveredBar].budgetUtilization !== undefined && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-slate-400">Budget Utilized:</span>
              <span className="font-semibold text-emerald-400 font-mono">{data[hoveredBar].budgetUtilization}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



/* 2. COMPANY ADMIN DASHBOARD */
interface CompanyAdminProps {
  analytics: any;
  companyName: string;
  user: any;
  apiFetch: any;
}

export const CompanyAdminDashboard: React.FC<CompanyAdminProps> = ({ analytics, companyName, user, apiFetch }) => {
  const kpis = analytics?.kpis || {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    attendancePercentage: 96,
    employeesOnLeave: 0,
    totalClients: 0,
    activeClients: 0,
    totalLeads: 0,
    leadConversionRate: 25,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    delayedProjects: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    payrollCost: 0,
    vendorPayables: 0,
    invoiceReceivables: 0,
    netProfit: 0,
    profitMargin: 0,
    assetUtilization: 0,
  };

  const trends = analytics?.trends || {
    monthlyRevenueTrend: [],
    employeeGrowthTrend: [],
    leadFunnel: [],
    projectStatusDistribution: [],
    departmentEmployeeDistribution: [],
  };

  const tables = analytics?.tables || {
    topProjects: [],
    pendingInvoices: [],
    pendingVendorBills: [],
  };

  const alerts = analytics?.alerts || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header */}
      <div className="flex justify-between items-center bg-slate-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Enterprise Command Suite</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{companyName} Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time organizational audit, CRM pipelines, and financial ledger logs</p>
        </div>
        <span className="text-sm bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-400 border border-cyan-500/25 px-4 py-2 rounded-xl font-bold uppercase tracking-wider shadow-lg">
          Company Head / CEO
        </span>
      </div>

      {/* 2. Operations & Critical Alerts */}
      {alerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm space-y-2.5">
          <h3 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Operational Attention Logs
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            {alerts.map((alert: string, idx: number) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Executive KPI Cards */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">General Operations KPIs</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Staff Count (Active/Total)', val: `${kpis.activeEmployees}/${kpis.totalEmployees}`, desc: 'Employees active in directory', icon: Users, color: 'text-blue-400' },
            { label: 'Attendance / On Leave', val: `${Number(kpis.attendancePercentage).toFixed(1)}% / ${kpis.employeesOnLeave}`, desc: 'Today check-in & active leaves', icon: UserCheck, color: 'text-cyan-400' },
            { label: 'CRM Leads (Conversion)', val: `${kpis.totalLeads} (${Number(kpis.leadConversionRate).toFixed(0)}%)`, desc: `Active clients count: ${kpis.totalClients}`, icon: Building, color: 'text-purple-400' },
            { label: 'Projects (Active/Delayed)', val: `${kpis.activeProjects}/${kpis.delayedProjects}`, desc: `Total mapped projects: ${kpis.totalProjects}`, icon: Layers, color: 'text-amber-400' },
          ].map((kpi, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 hover:scale-[1.01] hover:border-white/10 transition-all duration-300 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm uppercase font-bold text-slate-400 tracking-wider">{kpi.label}</span>
                  <h3 className="text-xl font-black text-white mt-1.5 tracking-tight">{kpi.val}</h3>
                  <p className="text-sm text-text-muted mt-1">{kpi.desc}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${kpi.color}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Financial KPI Cards */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Financial Ledgers</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Gross Revenue', val: `$${Number(kpis.totalRevenue).toLocaleString()}`, desc: 'Paid invoice collections', icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Payroll & Operating Expenses', val: `$${(Number(kpis.totalExpenses) + Number(kpis.payrollCost)).toLocaleString()}`, desc: `Payroll cost: $${Number(kpis.payrollCost).toLocaleString()}`, icon: TrendingUp, color: 'text-red-400' },
            { label: 'Net Profit', val: `$${Number(kpis.netProfit).toLocaleString()}`, desc: `Profit Margin: ${Number(kpis.profitMargin).toFixed(1)}%`, icon: DollarSign, color: kpis.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Payables / Receivables', val: `$${Number(kpis.vendorPayables).toLocaleString()} / $${Number(kpis.invoiceReceivables).toLocaleString()}`, desc: 'Unpaid bills vs unpaid invoices', icon: FileSpreadsheet, color: 'text-cyan-400' },
          ].map((kpi, idx) => (
            <div key={idx} className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md p-6 hover:scale-[1.01] hover:border-white/10 transition-all duration-300 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm uppercase font-bold text-slate-400 tracking-wider">{kpi.label}</span>
                  <h3 className="text-xl font-black text-white mt-1.5 tracking-tight">{kpi.val}</h3>
                  <p className="text-sm text-text-muted mt-1">{kpi.desc}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${kpi.color}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending invoices */}
        <div className="glass-panel rounded-2xl border border-white/5 p-5">
          <h4 className="text-sm font-bold text-white mb-3.5 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> Unpaid Client Invoices
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="uppercase text-xs text-text-muted border-b border-white/5 bg-slate-900/25">
                <tr>
                  <th className="py-2 px-4">Invoice #</th>
                  <th className="py-2 px-4">Client</th>
                  <th className="py-2 px-4 text-right">Amount</th>
                  <th className="py-2 px-4 text-center">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tables.pendingInvoices.length > 0 ? (
                  tables.pendingInvoices.map((inv: any) => (
                    <tr key={inv.invoice_id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 font-bold text-white">{inv.invoice_number}</td>
                      <td className="py-2.5 px-4">{inv.client?.name}</td>
                      <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">${Number(inv.amount).toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-center text-text-muted">{new Date(inv.due_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">No unpaid invoices</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending vendor bills */}
        <div className="glass-panel rounded-2xl border border-white/5 p-5">
          <h4 className="text-sm font-bold text-white mb-3.5 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-red-400" /> Pending Vendor Bills
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="uppercase text-xs text-text-muted border-b border-white/5 bg-slate-900/25">
                <tr>
                  <th className="py-2 px-4">Bill #</th>
                  <th className="py-2 px-4">Vendor</th>
                  <th className="py-2 px-4 text-right">Amount</th>
                  <th className="py-2 px-4 text-center">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tables.pendingVendorBills.length > 0 ? (
                  tables.pendingVendorBills.map((bill: any) => (
                    <tr key={bill.bill_id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 font-bold text-white">{bill.bill_number}</td>
                      <td className="py-2.5 px-4">{bill.vendor?.name}</td>
                      <td className="py-2.5 px-4 text-right text-red-400 font-semibold">${Number(bill.amount).toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-center text-text-muted">{new Date(bill.due_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">No pending vendor bills</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 3. AUDITOR DASHBOARD */
export const AuditorDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Auditing & Compliance Control</h2>
          <p className="text-sm text-text-muted">Independent read-only audit log verification</p>
        </div>
        <span className="text-sm bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          External Auditor Account
        </span>
      </div>

      {/* Auditor KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Security Audit logs verified', val: '24,842', icon: FileSpreadsheet, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Company compliance rate', val: '100%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Total Transaction audits', val: '142', icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          { label: 'Integrity concerns raised', val: '0', icon: AlertTriangle, color: 'text-slate-400', bg: 'bg-slate-500/5' },
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

      <div className="glass-panel rounded-xl p-6 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-4">Auditor Review Directives</h3>
        <p className="text-sm text-text-muted leading-relaxed">
          You are logged in with **Read-Only** auditing credentials. Under security guidelines, all database operations query dynamically from isolated tenant tables. You can review all system configurations, departments list, and security logs, but creation or modification options are blocked.
        </p>
      </div>

    </div>
  );
};
