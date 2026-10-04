import { getDb, dbGetAll, dbSave, dbDelete } from './offlineDb';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { SyncQueueItem, SyncStatus } from '../types';

type SyncListener = (state: SyncEngineState) => void;

export interface SyncEngineState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  statusMessage: string;
}

class SyncEngine {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSimulatedOffline: boolean = false;
  private syncStatus: SyncStatus = 'synced';
  private pendingCount: number = 0;
  private lastSyncedAt: string | null = localStorage.getItem('educore_last_synced_at');
  private statusMessage: string = 'System connected and synchronized.';
  private isSyncing: boolean = false;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
    this.refreshPendingCount();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState(): SyncEngineState {
    const effectiveOnline = this.isOnline && !this.isSimulatedOffline;
    return {
      isOnline: this.isOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      effectiveOnline,
      syncStatus: this.syncStatus,
      pendingCount: this.pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      statusMessage: this.statusMessage,
    };
  }

  public toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    if (this.isSimulatedOffline) {
      this.statusMessage = 'Offline simulation mode active. All actions saved locally in IndexedDB.';
      if (this.pendingCount > 0) {
        this.syncStatus = 'pending';
      }
    } else {
      this.statusMessage = 'Returned online. Automatic synchronization initiated...';
      this.syncNow();
    }
    this.notify();
    return this.isSimulatedOffline;
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    if (online && !this.isSimulatedOffline) {
      this.statusMessage = 'Internet connection detected. Starting synchronization...';
      this.syncNow();
    } else {
      this.statusMessage = 'Device is offline. Changes will be saved locally and synced later.';
      if (this.pendingCount > 0) {
        this.syncStatus = 'pending';
      }
    }
    this.notify();
  }

  public async refreshPendingCount(): Promise<number> {
    try {
      const items = await dbGetAll<SyncQueueItem>('sync_queue');
      const pending = items.filter((i) => i.status === 'pending' || i.status === 'failed');
      this.pendingCount = pending.length;
      if (this.pendingCount > 0 && this.syncStatus !== 'syncing') {
        this.syncStatus = 'pending';
      } else if (this.pendingCount === 0 && this.syncStatus !== 'syncing') {
        this.syncStatus = 'synced';
      }
      this.notify();
      return this.pendingCount;
    } catch {
      return 0;
    }
  }

  public async enqueue(
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    table: string,
    record: any
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: 'sq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      operation,
      table,
      record,
      local_timestamp: new Date().toISOString(),
      status: 'pending',
      retry_count: 0,
    };

    await dbSave('sync_queue', item);
    await this.refreshPendingCount();

    const effectiveOnline = this.isOnline && !this.isSimulatedOffline;
    if (effectiveOnline) {
      // Trigger background sync debounce
      setTimeout(() => this.syncNow(), 400);
    } else {
      this.statusMessage = 'Saved Offline — Pending Sync';
      this.syncStatus = 'pending';
      this.notify();
    }

    return item;
  }

  public async syncNow(): Promise<{ success: boolean; count: number; error?: string }> {
    const effectiveOnline = this.isOnline && !this.isSimulatedOffline;
    if (!effectiveOnline) {
      this.syncStatus = 'pending';
      this.statusMessage = 'Cannot synchronize while offline. Data remains safe locally.';
      this.notify();
      return { success: false, count: 0, error: 'Device is offline' };
    }

    if (this.isSyncing) {
      return { success: false, count: 0, error: 'Sync already in progress' };
    }

    this.isSyncing = true;
    this.syncStatus = 'syncing';
    this.statusMessage = 'Synchronizing pending local changes with cloud database...';
    this.notify();

    try {
      const queue = await dbGetAll<SyncQueueItem>('sync_queue');
      const pendingItems = queue.filter((i) => i.status === 'pending' || i.status === 'failed');

      if (pendingItems.length === 0) {
        this.syncStatus = 'synced';
        this.lastSyncedAt = new Date().toISOString();
        localStorage.setItem('educore_last_synced_at', this.lastSyncedAt);
        this.statusMessage = 'All records up to date. Synced successfully.';
        this.isSyncing = false;
        this.notify();
        return { success: true, count: 0 };
      }

      const client = getSupabaseClient();
      const hasSupabase = isSupabaseConfigured() && client;

      let processedCount = 0;

      for (const item of pendingItems) {
        try {
          if (hasSupabase && client) {
            // Real Supabase remote sync
            if (item.operation === 'INSERT') {
              const { error } = await client.from(item.table).upsert(item.record);
              if (error) throw error;
            } else if (item.operation === 'UPDATE') {
              const { error } = await client.from(item.table).upsert(item.record);
              if (error) throw error;
            } else if (item.operation === 'DELETE') {
              const { error } = await client.from(item.table).delete().eq('id', item.record.id);
              if (error) throw error;
            }
          }

          // Mark item synced in queue
          item.status = 'synced';
          item.error_message = undefined;
          await dbSave('sync_queue', item);
          processedCount++;
        } catch (itemErr: any) {
          item.status = 'failed';
          item.retry_count = (item.retry_count || 0) + 1;
          item.error_message = itemErr?.message || 'Sync failed';
          await dbSave('sync_queue', item);
        }
      }

      // Re-evaluate pending
      await this.refreshPendingCount();

      this.lastSyncedAt = new Date().toISOString();
      localStorage.setItem('educore_last_synced_at', this.lastSyncedAt);

      if (this.pendingCount === 0) {
        this.syncStatus = 'synced';
        this.statusMessage = `Sync Complete! Synchronized ${processedCount} records.`;
      } else {
        this.syncStatus = 'failed';
        this.statusMessage = `Sync Error: ${this.pendingCount} record(s) failed. Retry available.`;
      }

      this.isSyncing = false;
      this.notify();
      return { success: this.pendingCount === 0, count: processedCount };
    } catch (err: any) {
      this.isSyncing = false;
      this.syncStatus = 'failed';
      this.statusMessage = `Synchronization failed: ${err?.message || 'Unknown network error'}. Local data is safe.`;
      this.notify();
      return { success: false, count: 0, error: err?.message };
    }
  }

  public async clearSyncedItems(): Promise<void> {
    const queue = await dbGetAll<SyncQueueItem>('sync_queue');
    for (const item of queue) {
      if (item.status === 'synced') {
        await dbDelete('sync_queue', item.id);
      }
    }
    await this.refreshPendingCount();
  }

  public async clearAllQueue(): Promise<void> {
    const db = await getDb();
    await db.clear('sync_queue');
    await this.refreshPendingCount();
  }
}

export const syncEngine = new SyncEngine();
