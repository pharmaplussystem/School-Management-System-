import React from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Menu,
  Shield,
  Layers,
  LogOut,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSyncCenter: () => void;
}

const ROLES_LIST: UserRole[] = [
  'Super Administrator',
  'Administrator',
  'Head Teacher',
  'Deputy Head Teacher',
  'Secretary',
  'Bursar',
  'Teacher',
  'Registrar',
  'Librarian',
  'Storekeeper',
];

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenSyncCenter }) => {
  const {
    schoolProfile,
    currentUser,
    activeRole,
    setActiveRole,
    syncState,
    toggleSimulatedOffline,
    syncNow,
    theme,
    setTheme,
    signOut,
  } = useApp();

  const getStatusBadge = () => {
    if (!syncState.effectiveOnline) {
      return (
        <button
          onClick={onOpenSyncCenter}
          title={syncState.statusMessage}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-500/25 transition cursor-pointer"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>OFFLINE</span>
          {syncState.pendingCount > 0 && (
            <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
              {syncState.pendingCount}
            </span>
          )}
        </button>
      );
    }

    if (syncState.syncStatus === 'syncing') {
      return (
        <button
          onClick={onOpenSyncCenter}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700/50 hover:bg-blue-500/25 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>SYNCING...</span>
        </button>
      );
    }

    if (syncState.pendingCount > 0) {
      return (
        <button
          onClick={onOpenSyncCenter}
          title="Records saved locally waiting to sync"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-500/25 transition cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>PENDING SYNC ({syncState.pendingCount})</span>
        </button>
      );
    }

    if (syncState.syncStatus === 'failed') {
      return (
        <button
          onClick={onOpenSyncCenter}
          title="Sync encountered an issue. Tap to review."
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700/50 hover:bg-red-500/25 transition cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>SYNC ERROR</span>
        </button>
      );
    }

    return (
      <button
        onClick={onOpenSyncCenter}
        title="Connected and in sync"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-500/25 transition cursor-pointer"
      >
        <Wifi className="w-3.5 h-3.5" />
        <span>ONLINE</span>
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu + School Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img
                src="icon.svg"
                alt="EduCore Crest"
                className="w-full h-full object-contain rounded-[10px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  {schoolProfile.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                  UGANDA 🇺🇬
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {schoolProfile.motto} • {schoolProfile.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Status, Simulator, Role Switcher, Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator Pill */}
          {getStatusBadge()}

          {/* Simulate Offline Toggle */}
          <button
            onClick={toggleSimulatedOffline}
            title={
              syncState.isSimulatedOffline
                ? 'Currently simulating OFFLINE. Click to reconnect.'
                : 'Click to test OFFLINE mode (saves to IndexedDB and tests background queue)'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              syncState.isSimulatedOffline
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{syncState.isSimulatedOffline ? 'Offline Mode ON' : 'Simulate Offline'}</span>
          </button>

          {/* Role Switcher Dropdown (Allows testing all 11 roles) */}
          <div className="relative flex items-center">
            <label htmlFor="role-select" className="sr-only">
              Switch Role
            </label>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <select
                id="role-select"
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                title="Switch active role to test access controls"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r} value={r} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Sync Center Icon */}
          <button
            onClick={onOpenSyncCenter}
            aria-label="Open Sync Center"
            title="Open Sync Center"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${syncState.syncStatus === 'syncing' ? 'animate-spin text-blue-600' : ''}`} />
            {syncState.pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle Color Theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Sign Out */}
          <button
            onClick={signOut}
            title={`Signed in as ${currentUser.full_name} (${activeRole}) • Click to Sign Out`}
            className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
