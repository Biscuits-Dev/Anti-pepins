import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { jsonResponse as json } from '@/lib/api-helpers';

// Validation simple : UUID-like ou timestamp-based id (alphanumérique + tiret)
const SESSION_ID_RE = /^[\w-]{8,80}$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse> {
  const { sessionId } = await params;

  if (!SESSION_ID_RE.test(sessionId)) {
    return json({ error: 'Identifiant de session invalide.' }, 400);
  }

  const ip = getClientIp(request);
  const rl = await checkRateLimit(`chat-history:${ip}`, { max: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return json({ error: 'Trop de requêtes.' }, 429);
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, session_id, text, sender, timestamp')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('[ChatSessionAPI] Supabase error:', JSON.stringify(error));
      return json({ error: 'Erreur lors du chargement.' }, 500);
    }

    const messages = (data ?? []).map((row) => ({
      id:        row.id,
      sessionId: row.session_id,
      text:      row.text,
      sender:    row.sender,
      timestamp: row.timestamp,
    }));

    return json({ messages }, 200);
  } catch (err) {
    console.error('[ChatSessionAPI] Unexpected error:', err);
    return json({ error: 'Erreur interne.' }, 500);
  }
}

export async function POST():   Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405); }
export async function PUT():    Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405); }
export async function DELETE(): Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405); }
export async function PATCH():  Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405); }
