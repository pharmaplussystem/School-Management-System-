import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

export interface StoredDocumentResult {
  fileName: string;
  fileType: string;
  storagePath: string;
  fileSize: string;
  fileUrl: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Uploads a document to Supabase Storage if online/configured,
 * or safely converts to a data URL for offline-first resilience.
 */
export async function uploadDocument(
  file: File,
  folder: 'student_documents' | 'staff_documents' | 'general' = 'student_documents'
): Promise<StoredDocumentResult> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${Date.now()}_${sanitizedName}`;
  const fileSizeStr = formatBytes(file.size);

  const client = getSupabaseClient();

  if (isSupabaseConfigured() && client && navigator.onLine) {
    try {
      const { data, error } = await client.storage
        .from('school_documents')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = client.storage
          .from('school_documents')
          .getPublicUrl(path);

        return {
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          storagePath: path,
          fileSize: fileSizeStr,
          fileUrl: urlData.publicUrl,
        };
      }
    } catch (err) {
      console.warn('[EduCore Storage] Fallback to local storage for:', file.name, err);
    }
  }

  // Offline / local fallback: convert to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        storagePath: `offline://${path}`,
        fileSize: fileSizeStr,
        fileUrl: reader.result as string,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read document file'));
    reader.readAsDataURL(file);
  });
}
