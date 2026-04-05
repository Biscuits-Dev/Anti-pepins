// lib/admin-audit.ts
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function logAdminAction(
  action: string,
  target: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from('admin_audit_log').insert({
      action,
      target,
      details: details ?? null,
      ip_address: ipAddress ?? null,
    });
    if (error) console.error('[AdminAudit] Erreur log:', error);
  } catch (err) {
    console.error('[AdminAudit] Erreur log:', err);
  }
}
