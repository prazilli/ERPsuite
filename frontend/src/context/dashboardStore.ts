import { create } from 'zustand';

interface DashboardState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Movable widgets configuration
  widgetLayouts: {
    employee: string[];
    deptHead: string[];
    ceo: string[];
  };
  reorderWidgets: (role: 'employee' | 'deptHead' | 'ceo', startIndex: number, endIndex: number) => void;
  resetLayout: (role: 'employee' | 'deptHead' | 'ceo') => void;

  // Global search & filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: string; // 'all' | 'today' | 'week' | 'month'
  setDateFilter: (filter: string) => void;
}

const DEFAULT_LAYOUTS = {
  employee: [
    'welcome',
    'attendanceActions',
    'statsSummary',
    'salaryWidget',
    'assignedProjects',
    'pendingTasks',
    'leaveBalances',
    'upcomingHolidays',
    'timesheetSummary',
    'assignedAssets',
    'notifications',
    'announcements',
    'upcomingMeetings'
  ],
  deptHead: [
    'teamStats',
    'teamAttendance',
    'pendingApprovals',
    'productivityChart',
    'budgetUtilization',
    'resourceAllocationChart',
    'projectStatusChart',
    'announcements',
    'upcomingMeetings'
  ],
  ceo: [
    'executiveKpis',
    'strategicInsights',
    'riskAlerts',
    'financialAnalytics',
    'departmentMatrix',
    'projectPortfolio',
    'clientPerformance',
    'workforceAnalytics'
  ]
};

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  widgetLayouts: (() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('erp_widget_layouts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // If the saved layout contains old widgets, reset to default to avoid breaking the dashboard
          if (parsed.ceo && parsed.ceo.includes('departmentRequests')) {
             return DEFAULT_LAYOUTS;
          }
          return { ...DEFAULT_LAYOUTS, ...parsed };
        } catch {
          return DEFAULT_LAYOUTS;
        }
      }
    }
    return DEFAULT_LAYOUTS;
  })(),

  reorderWidgets: (role, startIndex, endIndex) => set((state) => {
    const list = [...state.widgetLayouts[role]];
    const [removed] = list.splice(startIndex, 1);
    list.splice(endIndex, 0, removed);
    
    const newLayouts = {
      ...state.widgetLayouts,
      [role]: list,
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('erp_widget_layouts', JSON.stringify(newLayouts));
    }
    return { widgetLayouts: newLayouts };
  }),

  resetLayout: (role) => set((state) => {
    const newLayouts = {
      ...state.widgetLayouts,
      [role]: DEFAULT_LAYOUTS[role],
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('erp_widget_layouts', JSON.stringify(newLayouts));
    }
    return { widgetLayouts: newLayouts };
  }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  dateFilter: 'all',
  setDateFilter: (filter) => set({ dateFilter: filter }),
}));
