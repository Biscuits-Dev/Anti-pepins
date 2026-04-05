// lib/validation/contact.ts
export const CONTACT_CONSTRAINTS = {
  fullname: { min: 2,   max: 100  },
  email:    { min: 5,   max: 254  },
  subject:  { min: 1,   max: 100  },
  message:  { min: 10,  max: 5000 },
} as const;

export const ALLOWED_SUBJECTS = [
  'question',
  'suggestion',
  'partenariat',
  'media',
  'autre',
] as const;

export type AllowedSubject = (typeof ALLOWED_SUBJECTS)[number];

export interface RawContactInput {
  fullname: unknown;
  email:    unknown;
  subject:  unknown;
  message:  unknown;
}

export interface ValidatedContactInput {
  fullname: string;
  email:    string;
  subject:  AllowedSubject;
  message:  string;
}

export type ValidationResult =
  | { ok: true;  data: ValidatedContactInput }
  | { ok: false; errors: string[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeString(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email);
}

function isAllowedSubject(value: unknown): value is AllowedSubject {
  return typeof value === 'string' && (ALLOWED_SUBJECTS as readonly string[]).includes(value);
}

export function isRawContactInput(value: unknown): value is RawContactInput {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return ['fullname', 'email', 'subject', 'message'].every((k) => k in obj);
}

// ─── Validators ───────────────────────────────────────────────────────────────

function validateFullname(v: unknown): string[] {
  if (typeof v !== 'string') return ['Le nom complet doit être une chaîne de caractères.'];
  const s = sanitizeString(v);
  const errs: string[] = [];
  if (s.length < CONTACT_CONSTRAINTS.fullname.min) errs.push(`Le nom doit contenir au moins ${CONTACT_CONSTRAINTS.fullname.min} caractères.`);
  if (s.length > CONTACT_CONSTRAINTS.fullname.max) errs.push(`Le nom ne peut pas dépasser ${CONTACT_CONSTRAINTS.fullname.max} caractères.`);
  return errs;
}

function validateEmail(v: unknown): string[] {
  if (typeof v !== 'string') return ["L'email doit être une chaîne de caractères."];
  const email = v.trim().toLowerCase();
  if (email.length < CONTACT_CONSTRAINTS.email.min) return ['Email trop court.'];
  if (email.length > CONTACT_CONSTRAINTS.email.max) return [`L'email ne peut pas dépasser ${CONTACT_CONSTRAINTS.email.max} caractères.`];
  if (!isValidEmail(email)) return ["Le format de l'email est invalide."];
  return [];
}

function validateSubject(v: unknown): string[] {
  if (isAllowedSubject(v)) return [];
  return [`Le sujet doit être l'une des valeurs suivantes : ${ALLOWED_SUBJECTS.join(', ')}.`];
}

function validateMessage(v: unknown): string[] {
  if (typeof v !== 'string') return ['Le message doit être une chaîne de caractères.'];
  const msg = sanitizeString(v);
  const errs: string[] = [];
  if (msg.length < CONTACT_CONSTRAINTS.message.min) errs.push(`Le message doit contenir au moins ${CONTACT_CONSTRAINTS.message.min} caractères.`);
  if (msg.length > CONTACT_CONSTRAINTS.message.max) errs.push(`Le message ne peut pas dépasser ${CONTACT_CONSTRAINTS.message.max} caractères.`);
  return errs;
}

// ─── Main validator ───────────────────────────────────────────────────────────

export function validateContactInput(raw: RawContactInput): ValidationResult {
  const errors = [
    ...validateFullname(raw.fullname),
    ...validateEmail(raw.email),
    ...validateSubject(raw.subject),
    ...validateMessage(raw.message),
  ];

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      fullname: sanitizeString(raw.fullname as string),
      email:    (raw.email as string).trim().toLowerCase(),
      subject:  raw.subject as AllowedSubject,
      message:  sanitizeString(raw.message as string),
    },
  };
}