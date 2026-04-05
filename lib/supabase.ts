import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[Supabase] Variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes en production');
  }
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : {
      auth: {},
      from: () => ({ select: () => [], insert: () => [], update: () => [], delete: () => [] }),
      channel: () => {
        const channel = {
          subscribe: () => channel,
          send: () => true,
          on: () => channel
        };
        return channel;
      }
    } as unknown as ReturnType<typeof createClient<Database>>;