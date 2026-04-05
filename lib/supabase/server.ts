import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(`[Config] Variable d'environnement manquante : ${key}`);
  }
  return value.trim();
}

let _client: SupabaseClient<Database> | null = null;

export function createServerSupabaseClient(): SupabaseClient<Database> {
  if (_client) return _client;

  _client = createClient<Database>(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken:   false,
        persistSession:     false,
        detectSessionInUrl: false,
      },
    },
  );

  return _client;
}