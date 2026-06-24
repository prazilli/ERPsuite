import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-5 border border-slate-800/60 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-800 rounded"></div>
        <div className="h-6 w-6 bg-slate-800 rounded-full"></div>
      </div>
      <div className="h-8 w-32 bg-slate-800 rounded"></div>
      <div className="h-3 w-40 bg-slate-800 rounded"></div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-5 border border-slate-800/60 animate-pulse space-y-4 col-span-2">
      <div className="h-4 w-48 bg-slate-800 rounded"></div>
      <div className="h-48 w-full bg-slate-800/50 rounded flex items-end p-4 gap-2">
        <div className="h-12 w-full bg-slate-800 rounded"></div>
        <div className="h-24 w-full bg-slate-800 rounded"></div>
        <div className="h-36 w-full bg-slate-800 rounded"></div>
        <div className="h-16 w-full bg-slate-800 rounded"></div>
        <div className="h-28 w-full bg-slate-800 rounded"></div>
        <div className="h-40 w-full bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-5 border border-slate-800/60 animate-pulse space-y-4 col-span-full">
      <div className="h-4 w-36 bg-slate-800 rounded"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center border-b border-slate-800/40 py-2">
            <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
            <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
            <div className="h-4 w-1/6 bg-slate-800 rounded"></div>
            <div className="h-4 w-1/12 bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Charts / Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartSkeleton />
        <div className="space-y-6 col-span-1">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      {/* Table Row */}
      <TableSkeleton />
    </div>
  );
};
