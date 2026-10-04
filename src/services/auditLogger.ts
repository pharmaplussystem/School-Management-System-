import { dbSave } from './offlineDb';
import { syncEngine } from './syncEngine';
import { AuditLog, UserRole } from '../types';

export async function logAction(
  userName: string,
  role: UserRole,
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SYNC' | 'CONFIG' | 'EXPORT',
  tableName: string,
  recordId?: string,
  details?: string
): Promise<void> {
  const log: AuditLog = {
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    user_name: userName,
    role,
    action,
    table_name: tableName,
    record_id: recordId,
    details,
    timestamp: new Date().toISOString(),
  };

  try {
    await dbSave('audit_logs', log);
    // Queue for sync without blocking
    syncEngine.enqueue('INSERT', 'audit_logs', log).catch(() => {});
  } catch (err) {
    console.warn('[EduCore Audit] Unable to record log:', err);
  }
}
