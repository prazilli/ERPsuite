'use client';

import React from 'react';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  LineChart,
  Briefcase,
  Activity,
  Award
} from 'lucide-react';

interface Props {
  metrics: any;
}

export const ExecutiveDashboard: React.FC<Props> = ({ metrics }) => {
  const data = metrics || {
    overallNetMargin: 24.5,
    marketGrowth: 15.2,
    globalComplianceRate: 100,
    recentKpis: [
      { label: 'EBITDA Target', target: '2.5M', current: '2.38M', status: 'On Target' },
      { label: 'Customer Retention Rate', target: '95%', current: '96.2%', status: 'Exceeded' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Executive Control Center</h2>
          <p className="text-sm text-text-muted">Corporate oversight and high level performance indicators</p>
        </div>
        <span className="text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2.5 py-1 rounded-full font-bold uppercase">
          Executive Head
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Overall Net Margin', val: `${data.overallNetMargin}%`, icon: Percent, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
          { label: 'Market Growth Index', val: `${data.marketGrowth}%`, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Global Compliance Index', val: `${data.globalComplianceRate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Target Board */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-cyan-400" /> Corporate Goals vs Target
          </h3>
          <div className="space-y-4">
            {(data.recentKpis || []).map((kpi: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-900/40 border border-white/5 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-white">{kpi.label}</div>
                  <div className="text-sm text-text-muted mt-0.5">Target: {kpi.target} | Current: {kpi.current}</div>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  kpi.status === 'Exceeded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {kpi.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Directives */}
        <div className="glass-panel rounded-xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Executive Directives
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Verify monthly budgets across all multi-department nodes. Department requests for new structural units must be approved through the Company Admin portal.
            </p>
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 flex items-center gap-2 text-indigo-400 text-sm">
            <Award className="w-4 h-4" />
            <span className="font-semibold">AI Assistant: Priority operations verified.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
