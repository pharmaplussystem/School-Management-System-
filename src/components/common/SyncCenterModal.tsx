import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Database,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { syncEngine } from '../../services/syncEngine';
import { testSupabaseConnection, isSupabaseConfigured } from '../../services/supabaseClient';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({ isOpen, onClose }) => {
  const { syncState, syncNow, syncQueue, toggleSimulatedOffline, refreshAllData, showToast } = useApp();
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'warning');
      }
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleClearSynced = async () => {
    await syncEngine.clearSyncedItems();
    await refreshAllData();
    showToast('Cleaned up already-synced history from local queue', 'info');
  };

  const pendingCount = syncQueue.filter((i) => i.status === 'pending' || i.status === 'failed').length;
  const syncedCount = syncQueue.filter((i) => i.status === 'synced').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 ${syncState.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Sync Center & Offline Queue
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  Local-First Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                IndexedDB storage layer connected with Supabase cloud backend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Network State</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs">
                {syncState.effectiveOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">ONLINE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">OFFLINE</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Sync</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-base text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>{pendingCount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Synced Items</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-base text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{syncedCount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Supabase Link</span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs text-blue-600 dark:text-blue-400">
                <Database className="w-3.5 h-3.5" />
                <span>{isSupabaseConfigured() ? 'Configured' : 'Local Sandbox'}</span>
              </div>
            </div>
          </div>

          {/* Status Message Banner */}
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{syncState.statusMessage}</p>
              {syncState.lastSyncedAt && (
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  Last successful sync: {new Date(syncState.lastSyncedAt).toLocaleString('en-UG')}
                </p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => syncNow()}
                disabled={syncState.syncStatus === 'syncing'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>

              <button
                onClick={toggleSimulatedOffline}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition ${
                  syncState.isSimulatedOffline
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                {syncState.isSimulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                <span>{syncState.isSimulatedOffline ? 'Resume Online' : 'Simulate Offline'}</span>
              </button>

              <button
                onClick={handleTestConnection}
                disabled={isTestingSupabase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition"
              >
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>{isTestingSupabase ? 'Testing...' : 'Test Supabase'}</span>
              </button>
            </div>

            {syncedCount > 0 && (
              <button
                onClick={handleClearSynced}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Synced History</span>
              </button>
            )}
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Sync Queue Table / List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Local Queue Items ({syncQueue.length})</span>
              <span className="text-[11px] font-normal text-slate-500 lowercase">
                operations queued in IndexedDB
              </span>
            </h4>

            {syncQueue.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                Queue is completely clear. All student, attendance and financial data are in sync!
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs max-h-56 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Table</th>
                      <th className="px-3 py-2">Details</th>
                      <th className="px-3 py-2">Timestamp</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {syncQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-3 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.operation === 'INSERT'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.operation === 'UPDATE'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {item.operation}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px]">{item.table}</td>
                        <td className="px-3 py-2 truncate max-w-[140px] text-slate-500 text-[11px]">
                          {item.record?.full_name ||
                            item.record?.name ||
                            item.record?.receipt_number ||
                            item.record?.title ||
                            item.record?.id}
                        </td>
                        <td className="px-3 py-2 text-slate-400 text-[10px]">
                          {new Date(item.local_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.status === 'synced'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : item.status === 'syncing'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            UUID primary keys guarantee conflict-free synchronization.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
