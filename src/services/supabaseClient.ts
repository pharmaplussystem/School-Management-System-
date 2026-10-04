import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __EDUCORE_CONFIG__?: {
      SUPABASE_URL?: string;
      SUPABASE_PUBLISHABLE_KEY?: string;
      SCHOOL_NAME?: string;
      CURRENCY?: string;
    };
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const localUrl = localStorage.getItem('educore_supabase_url');
  const localKey = localStorage.getItem('educore_supabase_key');

  const windowUrl = window.__EDUCORE_CONFIG__?.SUPABASE_URL;
  const windowKey = window.__EDUCORE_CONFIG__?.SUPABASE_PUBLISHABLE_KEY;

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  const url = (localUrl || windowUrl || envUrl || '').trim();
  const publishableKey = (localKey || windowKey || envKey || '').trim();

  return { url, publishableKey };
}

export function saveSupabaseConfig(url: string, publishableKey: string): void {
  localStorage.setItem('educore_supabase_url', url.trim());
  localStorage.setItem('educore_supabase_key', publishableKey.trim());
  cachedClient = null; // Invalidate cache so client is recreated
  cachedUrl = '';
  cachedKey = '';
}

export function isSupabaseConfigured(): boolean {
  const { url, publishableKey } = getSupabaseConfig();
  return Boolean(
    url &&
    publishableKey &&
    url.startsWith('https://') &&
    publishableKey.length > 20 &&
    !url.includes('your-project-id')
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, publishableKey } = getSupabaseConfig();
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === publishableKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    cachedUrl = url;
    cachedKey = publishableKey;
    return cachedClient;
  } catch (err) {
    console.warn('[EduCore] Error initializing Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL and Anon Key are not yet configured. Local-first offline mode is actively handling all school data.',
    };
  }

  try {
    const { data, error } = await client.from('schools').select('id, name').limit(1);
    if (error) {
      return { success: false, message: `Connected to Supabase, but query returned error: ${error.message}` };
    }
    return {
      success: true,
      message: `Successfully connected to Supabase PostgreSQL! Found ${data?.length || 0} school records.`,
    };
  } catch (err: any) {
    return { success: false, message: `Network / Connection error: ${err?.message || 'Check your internet or Supabase URL'}` };
  }
}
