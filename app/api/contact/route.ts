import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { sanitizeInput, jsonResponse as json } from '@/lib/api-helpers';

const SUBJECTS = ['question', 'suggestion', 'partenariat', 'media', 'autre'] as const;

const ContactSchema = z.object({
  fullname: z
    .string()
    .min(1,  'Le nom est requis.')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères.')
    .transform(sanitizeInput)
    .refine((v) => v.length >= 1, 'Le nom ne peut pas être vide après nettoyage.'),

  email: z
    .string()
    .max(254, "L'adresse e-mail est trop longue.")
    .pipe(z.email('Adresse e-mail invalide.'))
    .transform((v) => v.toLowerCase().trim()),

  subject: z.enum(SUBJECTS, {
    error: `Le sujet doit être l'une des valeurs : ${SUBJECTS.join(', ')}.`,
  }),

  message: z
    .string()
    .min(10,   'Le message doit contenir au moins 10 caractères.')
    .max(5000, 'Le message ne peut pas dépasser 5000 caractères.')
    .transform(sanitizeInput)
    .refine((v) => v.length >= 10, 'Le message est trop court après nettoyage.'),
});

type ContactInput = z.infer<typeof ContactSchema>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`contact:${ip}`, { max: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return json(
      { error: 'Trop de requêtes. Veuillez patienter avant de réessayer.' },
      429,
      { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    );
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Content-Type invalide. Attendu : application/json.' }, 415);
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength && Number.parseInt(contentLength, 10) > 32_768) {
    return json({ error: 'Payload trop volumineux.' }, 413);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return json({ error: 'Corps de la requête invalide ou malformé.' }, 400);
  }

  const parsed = ContactSchema.safeParse(rawBody);
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    console.warn('[ContactAPI] Validation échouée :', fieldErrors);
    return json({ error: 'Données invalides.', fieldErrors }, 422);
  }

  const data: ContactInput = parsed.data;

  try {
    const supabase = createServerSupabaseClient();

    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
        fullname:   data.fullname,
        email:      data.email,
        subject:    data.subject,
        message:    data.message,
        ip_address: ip,
        user_agent: request.headers.get('user-agent')?.slice(0, 512) ?? null,
      });

    if (dbError) {
      console.error('[ContactAPI] Supabase error :', JSON.stringify(dbError));
      return json({ error: "Erreur lors de l'enregistrement. Veuillez réessayer." }, 500);
    }

    return json({ success: true, message: 'Votre message a bien été envoyé.' }, 201);
  } catch (err) {
    console.error('[ContactAPI] Unexpected error :', err);
    return json({ error: 'Erreur interne. Veuillez réessayer ultérieurement.' }, 500);
  }
}

const METHOD_NOT_ALLOWED = () => json({ error: 'Méthode non autorisée.' }, 405, { Allow: 'POST' });

export const GET    = METHOD_NOT_ALLOWED;
export const PUT    = METHOD_NOT_ALLOWED;
export const DELETE = METHOD_NOT_ALLOWED;
export const PATCH  = METHOD_NOT_ALLOWED;
