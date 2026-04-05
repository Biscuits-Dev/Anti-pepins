import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isChatMessage, SENDER_ROLE } from '@/types/chat';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { jsonResponse as json } from '@/lib/api-helpers';

const MESSAGE_MAX_LEN = 2_000;
const ID_RE = /^[\w-]{1,100}$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`chat:${ip}`, { max: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return json(
      { error: 'Trop de requêtes.' },
      429,
      { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    );
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Content-Type invalide.' }, 415);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ error: 'Corps de la requête invalide.' }, 400);
  }

  if (!isChatMessage(rawBody)) {
    return json({ error: 'Structure de données invalide.' }, 400);
  }

  // Réservé aux messages visiteurs anonymes
  if (rawBody.sender !== SENDER_ROLE.USER) {
    return json({ error: 'Non autorisé.' }, 403);
  }

  // Valider l'ID (format) et la longueur du texte
  if (!ID_RE.test(rawBody.id)) {
    return json({ error: 'ID invalide.' }, 400);
  }
  if (rawBody.text.trim().length === 0 || rawBody.text.length > MESSAGE_MAX_LEN) {
    return json({ error: 'Message invalide.' }, 400);
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error: dbError } = await supabase.from('chat_messages').insert({
      id:         rawBody.id,
      session_id: rawBody.sessionId,
      text:       rawBody.text,
      sender:     rawBody.sender,
      timestamp:  new Date().toISOString(), // timestamp généré côté serveur
    });

    if (dbError) {
      console.error('[ChatMessageAPI] Supabase error:', JSON.stringify(dbError));
      return json({ error: 'Erreur lors de la sauvegarde.' }, 500);
    }

    return json({ ok: true }, 201);
  } catch (err) {
    console.error('[ChatMessageAPI] Unexpected error:', err);
    return json({ error: 'Erreur interne.' }, 500);
  }
}

export async function GET():    Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
export async function PUT():    Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
export async function DELETE(): Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
export async function PATCH():  Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
