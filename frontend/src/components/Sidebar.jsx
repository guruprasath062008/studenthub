import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  Server, 
  BookOpen, 
  X,
  Database,
  Shield,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'analytics', label: 'Analytics & GPA', icon: PieChart },
    { id: 'architecture', label: 'Architecture & Docker', icon: Server }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 md:top-16 z-50 md:z-20
        h-full md:h-[calc(100vh-4rem)] w-64
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 space-y-6">
          
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-100">Navigation Menu</span>
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Main Menu
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Service Mesh Status Badge */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">System Topology</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-blue-500" /> Frontend</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Active: 3000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-indigo-500" /> Auth API</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Active: 5001</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-purple-500" /> Student API</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Active: 5002</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Database className="w-3 h-3 text-amber-500" /> MySQL DB</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Active: 3306</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>StudentHub v1.0.0</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Assessment</span>
        </div>
      </aside>
    </>
  );
}
