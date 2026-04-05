'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { Button, Input, TextArea, Select } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemoignageFormProps {
  readonly onSuccess?: () => void;
}

type FieldErrors = Partial<Record<
  'prenom' | 'age' | 'scamType' | 'incidentDate' | 'content',
  string[]
>>;

// ─── Schéma client (miroir du schéma serveur, sans transform) ─────────────────

const ClientSchema = z.object({
  prenom:       z.string().min(1, 'Le prénom est requis').max(50, 'Maximum 50 caractères'),
  age:          z.number().int().min(10, 'Âge minimum 10 ans').max(120, 'Âge maximum 120 ans'),
  scamType:     z.string().min(1, 'Veuillez sélectionner un type d\'arnaque'),
  incidentDate: z.string().min(1, 'La date est requise').refine(
    (v) => {
      const d = new Date(v);
      return !Number.isNaN(d.getTime()) && d <= new Date() && d >= new Date('2000-01-01');
    },
    'Date invalide ou dans le futur'
  ),
  content: z.string().min(20, 'Minimum 20 caractères').max(5000, 'Maximum 5000 caractères'),
});

// ─── Options ──────────────────────────────────────────────────────────────────

const SCAM_TYPE_OPTIONS = [
  { value: '',              label: 'Sélectionnez le type d\'arnaque *' },
  { value: 'phishing',     label: 'Hameçonnage (Phishing)' },
  { value: 'romance',      label: 'Arnaque sentimentale' },
  { value: 'fake-shop',    label: 'Faux site e-commerce' },
  { value: 'investment',   label: 'Arnaque à l\'investissement' },
  { value: 'tech-support', label: 'Faux support technique' },
  { value: 'sms-livraison',label: 'SMS de livraison' },
  { value: 'lottery',      label: 'Loterie / Gain frauduleux' },
  { value: 'fake-job',     label: 'Arnaque à l\'emploi' },
  { value: 'identity',     label: 'Usurpation d\'identité' },
  { value: 'harassment',   label: 'Harcèlement' },
  { value: 'autre',        label: 'Autre' },
] as const;

// ─── Composant ────────────────────────────────────────────────────────────────

export function TemoignageForm({ onSuccess }: TemoignageFormProps): React.JSX.Element {
  const [prenom,       setPrenom]       = useState('');
  const [age,          setAge]          = useState('');
  const [scamType,     setScamType]     = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [content,      setContent]      = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError,  setGlobalError]  = useState<string | null>(null);
  const [fieldErrors,  setFieldErrors]  = useState<FieldErrors>({});
  const [success,      setSuccess]      = useState(false);

  const contentRemaining = 5000 - content.length;

  function fieldError(field: keyof FieldErrors): string | undefined {
    return fieldErrors[field]?.[0];
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});
    setSuccess(false);

    const ageNum = Number.parseInt(age, 10);

    // Validation client via Zod
    const result = ClientSchema.safeParse({
      prenom,
      age: Number.isNaN(ageNum) ? age : ageNum,
      scamType,
      incidentDate,
      content,
    });

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as FieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/temoignage', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom:       result.data.prenom,
          age:          result.data.age,
          scamType:     result.data.scamType,
          incidentDate: result.data.incidentDate,
          content:      result.data.content,
        }),
      });

      const json = await response.json() as {
        error?: string;
        fieldErrors?: FieldErrors;
        message?: string;
      };

      if (!response.ok) {
        if (json.fieldErrors) {
          setFieldErrors(json.fieldErrors);
        } else {
          setGlobalError(json.error ?? 'Une erreur est survenue.');
        }
        return;
      }

      setSuccess(true);
      setPrenom(''); setAge(''); setScamType(''); setIncidentDate(''); setContent('');
      onSuccess?.();

    } catch {
      setGlobalError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div id="temoignage-form" className="bg-white border-2 border-slate-900 shadow-[4px_4px_0_0_#171717] p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Partager votre témoignage</h2>
      <p className="text-slate-600 mb-6">
        Votre expérience peut aider d&apos;autres personnes à éviter cette arnaque.
        Tous les champs sont obligatoires.
      </p>

      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200" role="alert" aria-live="assertive">
          <p className="text-sm font-semibold text-red-800">⚠️ {globalError}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-emerald-800">
            ✅ Témoignage enregistré avec succès ! Il sera publié après modération.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Prénom & Âge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="temoignage-prenom" className="block text-sm font-semibold text-slate-700 mb-2">
              Prénom *
            </label>
            <Input
              id="temoignage-prenom"
              type="text"
              value={prenom}
              onChange={setPrenom}
              placeholder="Votre prénom"
              aria-describedby={fieldError('prenom') ? 'error-prenom' : undefined}
              required
            />
            {fieldError('prenom') && (
              <p id="error-prenom" className="mt-1 text-xs text-red-600">{fieldError('prenom')}</p>
            )}
          </div>

          <div>
            <label htmlFor="temoignage-age" className="block text-sm font-semibold text-slate-700 mb-2">
              Âge *
            </label>
            <Input
              id="temoignage-age"
              type="number"
              value={age}
              onChange={setAge}
              placeholder="Votre âge"
              aria-describedby={fieldError('age') ? 'error-age' : undefined}
              required
            />
            {fieldError('age') && (
              <p id="error-age" className="mt-1 text-xs text-red-600">{fieldError('age')}</p>
            )}
          </div>
        </div>

        {/* Type d'arnaque */}
        <div>
          <label htmlFor="temoignage-scam-type" className="block text-sm font-semibold text-slate-700 mb-2">
            Type d&apos;arnaque *
          </label>
          <Select
            id="temoignage-scam-type"
            value={scamType}
            onChange={setScamType}
            options={SCAM_TYPE_OPTIONS}
            aria-describedby={fieldError('scamType') ? 'error-scamType' : undefined}
            required
          />
          {fieldError('scamType') && (
            <p id="error-scamType" className="mt-1 text-xs text-red-600">{fieldError('scamType')}</p>
          )}
        </div>

        {/* Date de l'incident */}
        <div>
          <label htmlFor="temoignage-date" className="block text-sm font-semibold text-slate-700 mb-2">
            Date de l&apos;incident *
          </label>
          <Input
            id="temoignage-date"
            type="date"
            value={incidentDate}
            onChange={setIncidentDate}
            aria-describedby={fieldError('incidentDate') ? 'error-date' : undefined}
            required
          />
          {fieldError('incidentDate') && (
            <p id="error-date" className="mt-1 text-xs text-red-600">{fieldError('incidentDate')}</p>
          )}
        </div>

        {/* Contenu */}
        <div>
          <label htmlFor="temoignage-content" className="block text-sm font-semibold text-slate-700 mb-2">
            Votre témoignage *
          </label>
          <TextArea
            id="temoignage-content"
            value={content}
            onChange={setContent}
            rows={8}
            placeholder="Décrivez ce qui s'est passé : comment avez-vous été contacté(e), ce qui vous a mis la puce à l'oreille, comment l'arnaque a été découverte..."
            aria-describedby="content-counter"
            required
          />
          <p
            id="content-counter"
            className={`mt-2 text-xs ${contentRemaining < 0 ? 'text-red-500 font-semibold' : contentRemaining < 200 ? 'text-amber-600' : 'text-slate-500'}`}
          >
            {contentRemaining >= 0
              ? `${contentRemaining} caractères restants (minimum 20)`
              : `Dépassement de ${Math.abs(contentRemaining)} caractères`}
          </p>
          {fieldError('content') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('content')}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : '📤 Envoyer mon témoignage'}
          </Button>
        </div>

        <p className="text-xs text-slate-500">
          Votre témoignage sera examiné avant publication. Nous protégeons la vie privée de chacun :
          seul votre prénom et votre âge seront affichés.
        </p>
      </form>
    </div>
  );
}