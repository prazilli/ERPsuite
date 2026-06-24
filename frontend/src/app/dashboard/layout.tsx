'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import {
  LayoutDashboard,
  Network,
  Users,
  Shield,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Command,
  Loader2,
  Heart,
  DollarSign,
  Briefcase,
  Server,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';

import { useDashboardStore } from '@/context/dashboardStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const sidebarOpen = useDashboardStore((state) => state.sidebarOpen);
  const setSidebarOpen = useDashboardStore((state) => state.setSidebarOpen);
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const setSearchQuery = useDashboardStore((state) => state.setSearchQuery);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchPalette, setShowSearchPalette] = useState(false);

  // Dynamic Notifications State
  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadNotifications = useCallback(async () => {
    // Only load notifications if user has an active session token
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const list = await apiFetch('/notifications');
      const countRes = await apiFetch('/notifications/unread-count');
      setDbNotifications(Array.isArray(list) ? list : []);
      setUnreadCount(countRes?.count ?? 0);
    } catch (e: unknown) {
      // Silently swallow notification errors to avoid crashing the layout
      if (process.env.NODE_ENV === 'development') {
        const err = e as Error;
        console.warn('Notifications temporarily unavailable:', err?.message || err);
      }
    }
  }, [apiFetch]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadNotifications();
      const interval = setInterval(() => {
        void loadNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'POST' });
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Search Commands Mock
  const commands = [
    { name: 'Go to Dashboard', href: '/dashboard' },
    { name: 'View Departments List', href: '/dashboard/departments' },
    { name: 'Approve Department Requests', href: '/dashboard/requests' },
    { name: 'Manage User Directory', href: '/dashboard/users' },
    { name: 'Check Security Audit Logs', href: '/dashboard/audit' },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-sm font-semibold tracking-wider text-slate-400">Loading Amdox ERP Suite...</span>
      </div>
    );
  }

  // Sidebar Links based on Roles & Permissions
  const menuItems = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      name: 'HRMS Portal',
      href: '/dashboard/hrms',
      icon: Heart,
      visible: true,
    },
    {
      name: 'CRM Pipeline',
      href: '/dashboard/crm',
      icon: Users,
      visible: true,
    },
    {
      name: 'Projects Hub',
      href: '/dashboard/projects',
      icon: Briefcase,
      visible: true,
    },
    {
      name: 'Finance Ledger',
      href: '/dashboard/finance',
      icon: DollarSign,
      visible: ['Company Head / CEO', 'CEO', 'Company Admin', 'Super Admin', 'Department Head', 'DEPARTMENT_HEAD'].includes(user.role),
    },
    {
      name: 'Asset Registry',
      href: '/dashboard/assets',
      icon: Server,
      visible: true,
    },
    {
      name: 'Approvals Board',
      href: '/dashboard/approvals',
      icon: CheckSquare,
      visible: ['Company Head / CEO', 'CEO', 'Department Head', 'DEPARTMENT_HEAD'].includes(user.role),
    },
    {
      name: 'Departments',
      href: '/dashboard/departments',
      icon: Network,
      visible: ['Company Head / CEO', 'CEO', 'Company Admin', 'Super Admin', 'Department Head', 'DEPARTMENT_HEAD', 'Auditor'].includes(user.role),
    },
    {
      name: 'User Directory',
      href: '/dashboard/users',
      icon: Users,
      visible: ['Company Head / CEO', 'CEO', 'Company Admin', 'Super Admin', 'Department Head', 'DEPARTMENT_HEAD'].includes(user.role),
    },
    {
      name: 'Audit Logs',
      href: '/dashboard/audit',
      icon: Shield,
      visible: ['Company Head / CEO', 'CEO', 'Company Admin', 'Super Admin', 'Auditor'].includes(user.role),
    },
  ];

  // Dynamic Breadcrumb computation
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, idx) => {
      const href = '/' + parts.slice(0, idx + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1);
      return { label, href };
    });
  };

  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex text-foreground transition-all duration-300" style={{ background: 'var(--background)' }}>
      
      {/* 1. SIDEBAR SIDE COMPONENT */}
      <aside
        className={`glass-sidebar h-screen sticky top-0 flex flex-col z-20 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand/Logo */}
        <div className="h-16 px-6 border-b border-border-color flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping"></span>
              <span className="font-extrabold text-sm tracking-widest bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                AMDOX SUITE
              </span>
            </div>
          ) : (
            <span className="h-3 w-3 rounded-full bg-cyan-500 mx-auto"></span>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md border border-border-color bg-card-bg hover:bg-slate-500/10 text-text-muted hover:text-foreground transition-all cursor-pointer"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems
            .filter((item) => item.visible)
            .map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                    active
                      ? 'bg-accent/15 border border-accent/25 text-accent font-semibold'
                      : 'text-text-muted font-medium border border-transparent hover:bg-slate-500/5 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span className="text-sm tracking-wide">{item.name}</span>}
                </Link>
              );
            })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-border-color">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-red-500 border border-transparent hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm tracking-wide font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR HEADER */}
        <header className="h-16 border-b border-border-color bg-card-bg backdrop-blur-md sticky top-0 flex items-center justify-between px-6 z-10">
          
          {/* Left: Breadcrumbs & Command Palette trigger */}
          <div className="flex items-center gap-6 min-w-0">
            {/* Breadcrumb path */}
            <div className="hidden md:flex items-center gap-2 text-sm text-text-muted">
              <Link href="/dashboard" className="hover:text-foreground transition-all">Portal</Link>
              {getBreadcrumbs().map((bc) => (
                <React.Fragment key={bc.href}>
                  <span>/</span>
                  <Link href={bc.href} className="hover:text-foreground transition-all">{bc.label}</Link>
                </React.Fragment>
              ))}
            </div>

            {/* Quick search input */}
            <button
              onClick={() => setShowSearchPalette(true)}
              className="px-3 py-1.5 rounded-lg border border-border-color bg-background/50 hover:border-slate-500/35 text-sm text-text-muted flex items-center gap-2 cursor-pointer transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search commands...</span>
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded border border-border-color bg-card-bg text-sm text-text-muted select-none">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Theme Toggle, Notifications, Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Theme trigger */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border-color bg-background/50 hover:bg-slate-500/5 text-text-muted hover:text-foreground transition-all cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                className="p-2 rounded-lg border border-border-color bg-background/50 hover:bg-slate-500/5 text-text-muted hover:text-foreground relative transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel rounded-xl glow-shadow border border-border-color p-4 z-30 max-h-96 overflow-y-auto">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-color">
                    <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-bold transition-all cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {dbNotifications.length > 0 ? (
                      dbNotifications.map((n) => (
                        <div
                          key={n.notification_id}
                          onClick={() => {
                            handleMarkAsRead(n.notification_id);
                            if (n.title.toLowerCase().includes('approval')) {
                              router.push('/dashboard/approvals');
                              setShowNotifications(false);
                            }
                          }}
                          className={`text-sm p-2.5 rounded-lg transition-all text-left cursor-pointer ${
                            n.is_read ? 'opacity-60 hover:bg-slate-500/5' : 'bg-indigo-500/10 border border-indigo-500/15 hover:bg-indigo-500/20'
                          }`}
                        >
                          <div className="font-bold text-foreground">{n.title}</div>
                          <div className="text-sm text-text-muted mt-0.5 leading-relaxed">{n.message}</div>
                          <div className="text-sm text-cyan-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-text-muted">No notifications in your inbox.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User profile details & menu */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-border-color bg-background/50 hover:bg-slate-500/5 text-text-muted hover:text-foreground cursor-pointer transition-all"
              >
                <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left pr-2">
                  <div className="text-sm font-bold text-foreground leading-none">{user.name}</div>
                  <div className="text-sm text-text-muted mt-0.5">{user.role}</div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 glass-panel rounded-xl glow-shadow border border-border-color p-4 z-30">
                  <div className="mb-3 pb-2 border-b border-border-color">
                    <div className="text-sm font-semibold text-foreground">{user.name}</div>
                    <div className="text-sm text-text-muted">{user.email}</div>
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-sm font-bold uppercase tracking-wider">
                      {user.role}
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2.5 text-red-500 text-sm py-2 hover:bg-red-500/10 rounded-lg px-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Dynamic Inner Panel Viewport */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto" style={{ background: 'transparent' }}>
          {children}
        </main>

      </div>

      {/* 3. COMMAND PALETTE SEARCH TRIGGERED COMPONENT */}
      {showSearchPalette && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-28 px-4">
          <div className="w-full max-w-lg glass-panel border border-border-color rounded-2xl glow-shadow overflow-hidden">
            <div className="p-4 border-b border-border-color flex items-center gap-3">
              <Command className="w-5 h-5 text-text-muted animate-spin" />
              <input
                type="text"
                placeholder="Type a directory path or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => { setShowSearchPalette(false); setSearchQuery(''); }}
                className="p-1 rounded-md hover:bg-slate-500/10 text-text-muted hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-2 max-h-72 overflow-y-auto">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      router.push(c.href);
                      setShowSearchPalette(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 rounded-lg text-sm text-slate-300 hover:bg-cyan-500/15 hover:text-white transition-all cursor-pointer flex justify-between items-center"
                  >
                    <span>{c.name}</span>
                    <span className="text-sm text-cyan-400 font-semibold">{c.href}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-text-muted">No commands match your query.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
