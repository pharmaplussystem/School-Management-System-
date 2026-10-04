import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineIndicator: React.FC<{ onOpenSyncCenter: () => void }> = ({ onOpenSyncCenter }) => {
  const { syncState } = useApp();

  if (syncState.effectiveOnline && syncState.pendingCount === 0) {
    return null;
  }

  if (!syncState.effectiveOnline) {
    return (
      <aside aria-label="Offline status banner" className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between border-b border-amber-600 transition-all">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span className="truncate">
            You are working in <strong>OFFLINE MODE</strong>. Changes are being saved safely on this device in IndexedDB and will automatically synchronize when connection returns.
          </span>
          {syncState.pendingCount > 0 && (
            <span className="hidden sm:inline bg-slate-950 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {syncState.pendingCount} pending
            </span>
          )}
        </div>
        <button
          onClick={onOpenSyncCenter}
          className="underline text-slate-950 hover:text-white shrink-0 ml-2 text-xs font-bold"
        >
          View Queue
        </button>
      </aside>
    );
  }

  if (syncState.pendingCount > 0) {
    return (
      <aside aria-label="Pending sync banner" className="bg-blue-600 text-white px-4 py-1.5 text-xs font-semibold shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>
            {syncState.pendingCount} offline record(s) queued for synchronization.
          </span>
        </div>
        <button
          onClick={onOpenSyncCenter}
          className="underline hover:text-amber-200 shrink-0 ml-2 text-xs"
        >
          Sync Now
        </button>
      </aside>
    );
  }

  return null;
};
