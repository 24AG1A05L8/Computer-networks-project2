import React from 'react';
import {
  ShieldAlert,
  Radio,
  CloudUpload,
  Smartphone,
  Database,
  WifiOff,
  Sun,
  Moon,
  Users,
  Compass,
} from 'lucide-react';

export type DashboardTab = 'responder' | 'admin' | 'citizen' | 'topology' | 'sync' | 'android';

interface DashboardLayoutProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  criticalAlertsCount: number;
  totalNodesCount: number;
  totalUsersCount: number;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  criticalAlertsCount,
  totalNodesCount,
  totalUsersCount,
  isDarkTheme,
  onToggleTheme,
  children,
}) => {
  const bgClass = isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const headerBg = isDarkTheme ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-sm';
  const badgeBg = isDarkTheme ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200';

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col font-sans antialiased selection:bg-red-500 selection:text-white transition-colors duration-200`}>
      {/* Top Incident Command Navigation Bar */}
      <header className={`border-b ${headerBg} backdrop-blur-md sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and System Callout */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-900/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-base font-extrabold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    SahaayaNet
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-500 border border-red-500/30 uppercase">
                    EOC Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Internet-Independent Emergency Operations & DTN Mesh
                </p>
              </div>
            </div>

            {/* Status Badges & Theme Toggle */}
            <div className="flex items-center gap-3 text-xs">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badgeBg}`}>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className={isDarkTheme ? 'text-slate-300' : 'text-slate-700'}>Node.js API</span>
              </div>

              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badgeBg}`}>
                <Database className="w-3.5 h-3.5 text-sky-500" />
                <span className={isDarkTheme ? 'text-slate-300' : 'text-slate-700'}>Cloud SQL PostgreSQL</span>
              </div>

              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badgeBg}`}>
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span className={isDarkTheme ? 'text-slate-300' : 'text-slate-700'}>DTN Mesh Armed</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-lg border transition-colors ${
                  isDarkTheme ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
                title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 sm:space-x-2 border-t border-slate-700/30 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => onSelectTab('responder')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'responder'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Responder Dashboard</span>
              {criticalAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-red-600">
                  {criticalAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'admin'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Administrator Dashboard</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                {totalUsersCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('citizen')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'citizen'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Citizen Mobile Experience</span>
            </button>

            <button
              onClick={() => onSelectTab('topology')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'topology'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Mesh Topology</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                {totalNodesCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('sync')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'sync'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CloudUpload className="w-4 h-4" />
              <span>Gateway Sync</span>
            </button>

            <button
              onClick={() => onSelectTab('android')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'android'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : isDarkTheme
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android Kotlin Code Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 text-center text-xs ${isDarkTheme ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
        <p>SahaayaNet Phase 2 • Full-Stack Emergency Communication • Android Kotlin & Jetpack Compose • Node.js & Cloud SQL PostgreSQL</p>
      </footer>
    </div>
  );
};
