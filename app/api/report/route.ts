// app/api/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isRawReportInput, validateReportInput } from '@/lib/validation/report';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { jsonResponse as json } from '@/lib/api-helpers';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`report:${ip}`, { max: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return json(
      { error: 'Trop de requêtes. Veuillez patienter avant de réessayer.' },
      429,
      { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    );
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Content-Type invalide. Attendu : application/json' }, 415);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ error: 'Corps de la requête invalide ou malformé.' }, 400);
  }

  if (!isRawReportInput(rawBody)) {
    return json({ error: 'Structure de données invalide.' }, 400);
  }

  const validation = validateReportInput(rawBody);
  if (!validation.ok) {
    return json({ error: 'Données invalides.', details: validation.errors }, 422);
  }

  const { data } = validation;

  try {
    const supabase = createServerSupabaseClient();

    const { error: dbError } = await supabase
      .from('reports')
      .insert({
        scam_type:     data.scamType,
        incident_date: data.incidentDate,
        description:   data.description,
        amount:        data.amount,
        contact_email: data.contactEmail,
        receive_copy:  data.receiveCopy,
        need_help:     data.needHelp,
        ip_address:    ip,
        user_agent:    request.headers.get('user-agent') ?? null,
      });

    if (dbError) {
      console.error('[ReportAPI] Supabase error:', JSON.stringify(dbError));
      return json({ error: "Erreur lors de l'enregistrement. Veuillez réessayer." }, 500);
    }

    return json({ success: true, message: 'Votre signalement a bien été envoyé.' }, 201);
  } catch (err) {
    console.error('[ReportAPI] Unexpected error:', err);
    return json({ error: 'Erreur interne. Veuillez réessayer ultérieurement.' }, 500);
  }
}

export async function GET():    Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
export async function PUT():    Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
export async function DELETE(): Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
export async function PATCH():  Promise<NextResponse> { return json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' }); }
