import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'There are no active records in this section right now.',
  icon = <Inbox className="w-8 h-8 text-slate-500" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
      <div className="p-3 bg-slate-900/60 rounded-full border border-slate-800 mb-3 flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">{message}</p>
    </div>
  );
};
