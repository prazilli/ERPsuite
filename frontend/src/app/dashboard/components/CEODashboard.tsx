'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStore } from '@/context/dashboardStore';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Download,
  AlertTriangle,
  RefreshCw,
  Award,
  ArrowUp,
  ArrowDown,
  Target,
  ShieldAlert,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface CEODashboardProps {
  data: any;
  refetch: () => void;
  isFetching: boolean;
}

// Enterprise Mock Data
const MOCK_DATA = {
  executiveKpis: {
    totalRevenue: { value: 12500000, trend: "+12%" },
    grossProfit: { value: 8500000, trend: "+8%" },
    netProfitMargin: { value: 24.5, trend: "+2.1%" },
    cashPosition: { value: 4200000, trend: "-1.5%" },
    accountsReceivable: { value: 1800000, trend: "+5%" },
    accountsPayable: { value: 950000, trend: "-2%" },
    activeClients: { value: 342, trend: "+15" },
    activeProjects: { value: 89, trend: "+4" },
    employeeCount: { value: 1240, trend: "+45" },
    growthPercentage: { value: 18.2, trend: "+4%" }
  },
  strategicInsights: [
    { month: 'Jan', revenue: 1000000, profit: 200000, cashFlow: 150000 },
    { month: 'Feb', revenue: 1100000, profit: 220000, cashFlow: 180000 },
    { month: 'Mar', revenue: 1050000, profit: 210000, cashFlow: 160000 },
    { month: 'Apr', revenue: 1200000, profit: 250000, cashFlow: 200000 },
    { month: 'May', revenue: 1350000, profit: 290000, cashFlow: 220000 },
    { month: 'Jun', revenue: 1500000, profit: 340000, cashFlow: 280000 },
  ],
  riskAlerts: [
    { id: 1, type: 'Financial', message: '$450k overdue from Acme Corp', severity: 'High' },
    { id: 2, type: 'Project', message: 'Project Phoenix delayed by 3 weeks', severity: 'High' },
    { id: 3, type: 'HR', message: 'Engineering Dept attrition up 4%', severity: 'Medium' },
    { id: 4, type: 'Compliance', message: 'SOC2 Audit preparations lagging', severity: 'Medium' },
    { id: 5, type: 'Budget', message: 'Marketing Q2 spend 15% over budget', severity: 'Low' }
  ],
  projectPortfolio: [
    { name: 'On Track', value: 65, color: '#10b981' },
    { name: 'At Risk', value: 15, color: '#f59e0b' },
    { name: 'Delayed', value: 9, color: '#ef4444' }
  ],
  clientPerformance: [
    { name: 'Global Tech', revenue: 2400000, retention: 98, status: 'Healthy' },
    { name: 'Acme Corp', revenue: 1850000, retention: 95, status: 'At Risk' },
    { name: 'Stark Ind.', revenue: 1200000, retention: 99, status: 'Healthy' },
    { name: 'Wayne Ent.', revenue: 950000, retention: 90, status: 'Review' },
  ],
  departmentMatrix: [
    { dept: 'Engineering', revenue: 0, cost: 3500000, margin: 0, productivity: 92 },
    { dept: 'Sales', revenue: 8500000, cost: 1200000, margin: 85, productivity: 88 },
    { dept: 'Consulting', revenue: 4000000, cost: 1800000, margin: 55, productivity: 95 },
    { dept: 'Marketing', revenue: 0, cost: 900000, margin: 0, productivity: 85 },
  ],
  workforceAnalytics: [
    { month: 'Jan', headCount: 1100, utilization: 82, attrition: 2.1 },
    { month: 'Feb', headCount: 1120, utilization: 84, attrition: 1.8 },
    { month: 'Mar', headCount: 1150, utilization: 85, attrition: 2.2 },
    { month: 'Apr', headCount: 1180, utilization: 87, attrition: 1.5 },
    { month: 'May', headCount: 1210, utilization: 86, attrition: 1.9 },
    { month: 'Jun', headCount: 1240, utilization: 88, attrition: 1.2 },
  ],
  financialAnalytics: {
    receivablesAging: [
      { category: '0-30 Days', amount: 800000 },
      { category: '31-60 Days', amount: 450000 },
      { category: '61-90 Days', amount: 300000 },
      { category: '>90 Days', amount: 250000 },
    ]
  }
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#a78bfa', '#ec4899'];

export const CEODashboard: React.FC<CEODashboardProps> = ({ data, refetch, isFetching }) => {
  const { widgetLayouts, reorderWidgets } = useDashboardStore();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = (format: 'csv' | 'pdf') => {
    setExporting(format);
    setTimeout(() => {
      window.print();
      setExporting(null);
    }, 1500);
  };

  const renderWidget = (widgetId: string, index: number) => {
    const layoutControls = (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700/80 z-10 backdrop-blur-sm">
        <button
          onClick={() => {
            const nextIdx = index - 1;
            if (nextIdx >= 0) reorderWidgets('ceo', index, nextIdx);
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
            if (nextIdx < widgetLayouts.ceo.length) reorderWidgets('ceo', index, nextIdx);
          }}
          disabled={index === widgetLayouts.ceo.length - 1}
          className="text-slate-400 hover:text-cyan-400 disabled:opacity-30 cursor-pointer p-0.5"
          title="Move Down"
        >
          <ArrowDownIcon />
        </button>
      </div>
    );

    // Provide a standardized wrapper for premium cards
    const CardWrapper = ({ children, colSpan = 'col-span-1', minHeight = 'min-h-[300px]' }: any) => (
      <div className={`relative group bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden ${colSpan} ${minHeight}`}>
        {/* Subtle radial gradient background effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        {layoutControls}
        {children}
      </div>
    );

    switch (widgetId) {
      case 'executiveKpis':
        return (
          <div key="executiveKpis" className="col-span-full">
            {/* We don't use CardWrapper here because it's a grid of mini-cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Revenue (YTD)', value: `$${(MOCK_DATA.executiveKpis.totalRevenue.value / 1000000).toFixed(1)}M`, trend: MOCK_DATA.executiveKpis.totalRevenue.trend, icon: DollarSign, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                { label: 'Gross Profit', value: `$${(MOCK_DATA.executiveKpis.grossProfit.value / 1000000).toFixed(1)}M`, trend: MOCK_DATA.executiveKpis.grossProfit.trend, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Net Profit Margin', value: `${MOCK_DATA.executiveKpis.netProfitMargin.value}%`, trend: MOCK_DATA.executiveKpis.netProfitMargin.trend, icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: 'Cash Position', value: `$${(MOCK_DATA.executiveKpis.cashPosition.value / 1000000).toFixed(1)}M`, trend: MOCK_DATA.executiveKpis.cashPosition.trend, icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Enterprise Growth', value: `${MOCK_DATA.executiveKpis.growthPercentage.value}%`, trend: MOCK_DATA.executiveKpis.growthPercentage.trend, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              ].map((kpi, i) => (
                <div key={i} className="relative group bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                  {i === 0 && layoutControls}
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg ${kpi.bg}`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full bg-white/5 ${kpi.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {kpi.trend}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{kpi.label}</h4>
                    <h2 className="text-2xl font-black text-white mt-1">{kpi.value}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'strategicInsights':
        return (
          <CardWrapper key="strategicInsights" colSpan="col-span-full lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Strategic Revenue & Profit Trend</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MOCK_DATA.strategicInsights}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#colorRevenue)" stroke="#6366f1" strokeWidth={3} name="Total Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Net Profit" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardWrapper>
        );

      case 'riskAlerts':
        return (
          <CardWrapper key="riskAlerts" colSpan="col-span-full lg:col-span-1" minHeight="min-h-[300px]">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Enterprise Risk Matrix</h3>
            </div>
            <div className="space-y-3">
              {MOCK_DATA.riskAlerts.map(alert => (
                <div key={alert.id} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors flex items-start gap-3">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${alert.severity === 'High' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : alert.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div>
                    <div className="text-sm font-bold text-slate-400 uppercase">{alert.type}</div>
                    <div className="text-sm font-semibold text-white mt-0.5 leading-snug">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardWrapper>
        );

      case 'financialAnalytics':
        return (
          <CardWrapper key="financialAnalytics" colSpan="col-span-full lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <BarChartIcon className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AR Aging Analysis</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_DATA.financialAnalytics.receivablesAging} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(value) => `$${value / 1000}k`} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} name="Outstanding Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardWrapper>
        );

      case 'departmentMatrix':
        return (
          <CardWrapper key="departmentMatrix" colSpan="col-span-full lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Department Matrix (Rev/Cost)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-sm uppercase text-slate-500 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-2 font-semibold">Department</th>
                    <th className="py-3 px-2 font-semibold text-right">Revenue</th>
                    <th className="py-3 px-2 font-semibold text-right">Cost</th>
                    <th className="py-3 px-2 font-semibold text-center">Margin</th>
                    <th className="py-3 px-2 font-semibold text-center">Productivity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_DATA.departmentMatrix.map((dept, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 text-sm font-bold text-white">{dept.dept}</td>
                      <td className="py-3 px-2 text-sm text-right text-emerald-400">${(dept.revenue / 1000000).toFixed(1)}M</td>
                      <td className="py-3 px-2 text-sm text-right text-rose-400">${(dept.cost / 1000000).toFixed(1)}M</td>
                      <td className="py-3 px-2 text-sm text-center font-semibold text-slate-300">{dept.margin > 0 ? `${dept.margin}%` : '-'}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-slate-400 w-6">{dept.productivity}%</span>
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${dept.productivity}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardWrapper>
        );

      case 'projectPortfolio':
        return (
          <CardWrapper key="projectPortfolio" colSpan="col-span-full md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Portfolio Health</h3>
            </div>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DATA.projectPortfolio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {MOCK_DATA.projectPortfolio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: 'none', color: 'white' }} itemStyle={{ color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">89</span>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/5">
              {MOCK_DATA.projectPortfolio.map((p, i) => (
                <div key={i} className="text-center">
                  <div className="text-sm text-slate-400 font-bold uppercase truncate">{p.name}</div>
                  <div className="text-lg font-black mt-1 drop-shadow-md" style={{ color: p.color }}>{p.value}</div>
                </div>
              ))}
            </div>
          </CardWrapper>
        );

      case 'clientPerformance':
        return (
          <CardWrapper key="clientPerformance" colSpan="col-span-full lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-pink-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Key Client Performance</h3>
            </div>
            <div className="space-y-4">
              {MOCK_DATA.clientPerformance.map((client, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{client.name}</span>
                    <span className="text-sm text-slate-400 uppercase tracking-wide mt-1">Retention: {client.retention}%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-base font-black text-indigo-400">${(client.revenue / 1000000).toFixed(2)}M</span>
                    <span className={`text-sm px-2.5 py-0.5 rounded-full mt-1.5 font-bold uppercase tracking-wider ${client.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : client.status === 'At Risk' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardWrapper>
        );

      case 'workforceAnalytics':
        return (
          <CardWrapper key="workforceAnalytics" colSpan="col-span-full md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workforce Trends</h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA.workforceAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} domain={['dataMin - 50', 'dataMax + 50']} hide />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} hide />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="headCount" stroke="#06b6d4" strokeWidth={3} name="Headcount" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="#a855f7" strokeWidth={3} name="Utilization %" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-sm px-2">
              <div className="text-slate-400 flex flex-col gap-1">
                <span className="text-sm uppercase font-bold">Avg Attrition</span>
                <span className="font-black text-lg text-rose-400">1.8%</span>
              </div>
              <div className="text-slate-400 flex flex-col items-end gap-1">
                <span className="text-sm uppercase font-bold">Avg Utilization</span>
                <span className="font-black text-lg text-purple-400">85%</span>
              </div>
            </div>
          </CardWrapper>
        );

      default:
        return null;
    }
  };

  const ArrowUpIcon = () => <ArrowUp className="w-3.5 h-3.5" />;
  const ArrowDownIcon = () => <ArrowDown className="w-3.5 h-3.5" />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="inline-block text-sm font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-md mb-3 border border-indigo-500/20">
            Enterprise Command
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">Executive Control Center</h2>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Real-time strategic insights, enterprise financial health, and organizational risk matrix.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#111827]/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting !== null}
              className="px-3 py-2 text-sm font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting === 'csv' ? 'Exporting...' : 'Export Data'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="px-3 py-2 text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              <FileText className="w-4 h-4" />
              {exporting === 'pdf' ? 'Generating...' : 'CEO Report'}
            </button>
          </div>
          <button
            onClick={refetch}
            disabled={isFetching}
            className="p-3 border border-white/10 hover:bg-white/5 rounded-xl cursor-pointer transition-all text-slate-400 hover:text-white flex items-center justify-center disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 auto-rows-min">
        {widgetLayouts.ceo.map((wId, idx) => (
          <ErrorBoundary key={wId}>
            {renderWidget(wId, idx)}
          </ErrorBoundary>
        ))}
      </div>
    </div>
  );
};
