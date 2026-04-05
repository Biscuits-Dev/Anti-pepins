'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, TextArea, Select, Input } from '@/components/ui';
import type { AnalysisResult, AnalyzableType, AnalysisContextFields } from '@/lib/analyzer';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface LinkEntry {
  id: string;
  value: string;
}

const ANALYSIS_TYPES: ReadonlyArray<{
  value: AnalyzableType | 'auto';
  label: string;
  icon: string;
  description: string;
}> = [
  { value: 'auto',    icon: '🔍', label: 'Je ne sais pas',     description: 'Type détecté automatiquement' },
  { value: 'url',     icon: '🔗', label: 'Un lien internet',   description: 'http://, https://…' },
  { value: 'email',   icon: '📧', label: 'Un email',           description: 'Message reçu par email' },
  { value: 'message', icon: '💬', label: 'Un message',         description: 'Facebook, WhatsApp, SMS…' },
  { value: 'phone',   icon: '📞', label: 'Un numéro',          description: 'Numéro de téléphone suspect' },
  { value: 'text',    icon: '📝', label: 'Autre chose',        description: 'Texte, pub, courrier…' },
];

const SCAM_TYPE_LABELS: Record<string, string> = {
  'phishing':           'Tentative de vol de mot de passe',
  'fake-website':       'Faux site internet',
  'scam-call':          'Appel frauduleux',
  'investment':         'Arnaque à l\'investissement',
  'romance':            'Arnaque sentimentale',
  'social-engineering': 'Manipulation psychologique',
  'tech-support':       'Faux support informatique',
  'fake-delivery':      'Faux avis de colis',
  'brouteur':           'Arnaque africaine',
  'lottery':            'Fausse loterie',
  'crypto-scam':        'Arnaque cryptomonnaie',
  'impersonation':      'Usurpation d\'identité',
};

const PLATFORM_OPTIONS = [
  { value: '',          label: '-- Choisir --' },
  { value: 'Facebook',  label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp',  label: 'WhatsApp' },
  { value: 'Telegram',  label: 'Telegram' },
  { value: 'SMS',       label: 'SMS (texto)' },
  { value: 'Email',     label: 'Email' },
  { value: 'Tinder',    label: 'Tinder / site de rencontre' },
  { value: 'Leboncoin', label: 'Leboncoin' },
  { value: 'LinkedIn',  label: 'LinkedIn' },
  { value: 'Autre',     label: 'Autre' },
];

const URGENCY_OPTIONS = [
  { value: '', label: '-- Choisir --' },
  { value: 'urgent', label: 'Oui, très urgent ("faites vite !")' },
  { value: 'moderate', label: 'Un peu pressé' },
  { value: 'none', label: 'Pas d\'urgence mentionnée' },
];

const ACTION_REQUESTED_OPTIONS = [
  { value: '', label: '-- Choisir --' },
  { value: 'click-link', label: 'Cliquer sur un lien' },
  { value: 'call-back', label: 'Rappeler un numéro' },
  { value: 'pay-money', label: 'Payer de l\'argent' },
  { value: 'give-info', label: 'Donner des informations personnelles' },
  { value: 'install-app', label: 'Installer une application' },
  { value: 'send-code', label: 'Envoyer un code reçu par SMS' },
  { value: 'other', label: 'Autre action demandée' },
  { value: 'none', label: 'Aucune action demandée' },
];

const CLAIMED_IDENTITY_OPTIONS = [
  { value: '', label: '-- Choisir --' },
  { value: 'bank', label: 'Ma banque' },
  { value: 'government', label: 'Administration / gouvernement' },
  { value: 'police', label: 'Police / gendarmerie' },
  { value: 'laposte', label: 'La Poste / livreur' },
  { value: 'tech-company', label: 'Microsoft, Apple, Google…' },
  { value: 'edf-utilities', label: 'EDF, opérateur téléphonique…' },
  { value: 'health', label: 'Sécurité sociale / assurance' },
  { value: 'amazon', label: 'Amazon / e-commerce' },
  { value: 'unknown-person', label: 'Une personne inconnue' },
  { value: 'known-person', label: 'Quelqu\'un que je connais' },
  { value: 'other', label: 'Autre' },
  { value: 'none', label: 'Pas d\'identité revendiquée' },
];

const HOW_RECEIVED_OPTIONS = [
  { value: '', label: '-- Choisir --' },
  { value: 'unsolicited', label: 'Sans rien demander (spontané)' },
  { value: 'after-action', label: 'Après une action de ma part' },
  { value: 'expected', label: 'Je l\'attendais (commande, rdv…)' },
];

function buildEnrichedContext(params: {
  analysisType: AnalyzableType | 'auto';
  contextFields: AnalysisContextFields;
  enrichedFields: EnrichedFields;
  mainValue: string;
  emailLinks: LinkEntry[];
}): string {
  const { analysisType, enrichedFields, mainValue } = params;
  const parts: string[] = [];

  if (enrichedFields.claimedIdentity) {
    const label = CLAIMED_IDENTITY_OPTIONS.find(o => o.value === enrichedFields.claimedIdentity)?.label;
    parts.push(`L'expéditeur prétend être : ${label ?? enrichedFields.claimedIdentity}`);
  }

  if (enrichedFields.actionRequested) {
    const label = ACTION_REQUESTED_OPTIONS.find(o => o.value === enrichedFields.actionRequested)?.label;
    parts.push(`Action demandée à la victime : ${label ?? enrichedFields.actionRequested}`);
  }

  if (enrichedFields.urgencyLevel) {
    const label = URGENCY_OPTIONS.find(o => o.value === enrichedFields.urgencyLevel)?.label;
    parts.push(`Sentiment d'urgence : ${label ?? enrichedFields.urgencyLevel}`);
  }

  if (enrichedFields.howReceived) {
    const label = HOW_RECEIVED_OPTIONS.find(o => o.value === enrichedFields.howReceived)?.label;
    parts.push(`Comment le message a été reçu : ${label ?? enrichedFields.howReceived}`);
  }

  if (enrichedFields.mentionsMoney !== undefined) {
    parts.push(`Mention d'argent / gain : ${enrichedFields.mentionsMoney ? 'OUI' : 'NON'}`);
  }

  if (enrichedFields.asksForSecrecy !== undefined) {
    parts.push(`Demande de garder le secret : ${enrichedFields.asksForSecrecy ? 'OUI' : 'NON'}`);
  }

  if (analysisType === 'phone' && mainValue.trim()) {
    parts.push(`Texte du SMS accompagnant l'appel :\n${mainValue.trim()}`);
  }

  if (enrichedFields.userComment?.trim()) {
    parts.push(`Note de l'utilisateur :\n${enrichedFields.userComment.trim()}`);
  }

  return parts.join('\n\n');
}

function useClipboard(timeoutMs = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeoutMs);
    });
  }, [timeoutMs]);
  return { copied, copy };
}

interface EnrichedFields {
  claimedIdentity?: string;
  actionRequested?: string;
  urgencyLevel?: string;
  howReceived?: string;
  mentionsMoney?: boolean;
  asksForSecrecy?: boolean;
  userComment?: string;
}

function FormField({
  label,
  htmlFor,
  hint,
  required,
  children,
  badge,
}: Readonly<{
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  badge?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-lg font-semibold text-slate-900">
        {label}
        {required && <span className="ml-2 text-base font-normal text-slate-500">(obligatoire)</span>}
        {badge && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-bold text-orange-700 bg-orange-100 border border-orange-200 rounded-full">
            {badge}
          </span>
        )}
      </label>
      {hint && <p className="text-base text-slate-500 leading-snug">{hint}</p>}
      {children}
    </div>
  );
}

function PrecisionPanel({ children, defaultOpen = false }: Readonly<{ children: React.ReactNode; defaultOpen?: boolean }>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-2 border-orange-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🎯</span>
          <div>
            <p className="text-base font-bold text-orange-900">Améliorer la précision de l&apos;analyse</p>
            <p className="text-sm text-orange-600">Quelques questions rapides pour un meilleur résultat</p>
          </div>
        </div>
        <span className={`text-orange-600 text-xl font-bold transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div className="p-5 bg-white space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}

function BooleanToggle({
  id,
  label,
  hint,
  value,
  onChange,
}: Readonly<{
  id: string;
  label: string;
  hint?: string;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}>) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex gap-2 shrink-0 pt-0.5">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={[
              'px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all',
              value === v
                ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300',
            ].join(' ')}
          >
            {v ? 'Oui' : 'Non'}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor={id} className="block text-base font-semibold text-slate-800">{label}</label>
        {hint && <p className="text-sm text-slate-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function CommonEnrichedFields({
  fields,
  onChange,
}: Readonly<{
  fields: EnrichedFields;
  onChange: (k: keyof EnrichedFields, v: string | boolean) => void;
}>) {
  return (
    <>
      <FormField label="L'expéditeur prétend être…" htmlFor="claimed-identity" hint="Qui dit-il être ? Cela aide beaucoup l'analyse.">
        <Select
          id="claimed-identity"
          value={fields.claimedIdentity ?? ''}
          onChange={(v) => onChange('claimedIdentity', v)}
          options={CLAIMED_IDENTITY_OPTIONS}
        />
      </FormField>

      <FormField label="Que vous demande-t-on de faire ?" htmlFor="action-requested">
        <Select
          id="action-requested"
          value={fields.actionRequested ?? ''}
          onChange={(v) => onChange('actionRequested', v)}
          options={ACTION_REQUESTED_OPTIONS}
        />
      </FormField>

      <FormField label="Y a-t-il un sentiment d'urgence ?" htmlFor="urgency-level">
        <Select
          id="urgency-level"
          value={fields.urgencyLevel ?? ''}
          onChange={(v) => onChange('urgencyLevel', v)}
          options={URGENCY_OPTIONS}
        />
      </FormField>

      <div className="space-y-4 pt-1">
        <BooleanToggle
          id="mentions-money"
          label="Il est question d'argent, de gain ou d'une récompense"
          hint={"Ex : \"vous avez gagné\", \"remboursement de\", \"frais de dossier\"…"}
          value={fields.mentionsMoney}
          onChange={(v) => onChange('mentionsMoney', v)}
        />
        <BooleanToggle
          id="asks-secrecy"
          label="On vous demande de garder ça secret ou de faire vite"
          hint={"Ex : \"n'en parlez à personne\", \"offre valable 24h\"…"}
          value={fields.asksForSecrecy}
          onChange={(v) => onChange('asksForSecrecy', v)}
        />
      </div>

      <FormField
        label="Avez-vous autre chose à ajouter ?"
        htmlFor="user-comment"
        hint="Tout détail qui vous semble important : contexte, sentiment, circonstances…"
      >
        <TextArea
          id="user-comment"
          value={fields.userComment ?? ''}
          onChange={(v) => onChange('userComment', v)}
          rows={3}
          placeholder="Ex : J'avais passé une commande la semaine dernière, je n'attendais pas ce message…"
          hasError={false}
        />
      </FormField>
    </>
  );
}

function UrlForm({
  value, onChange, hasError, enriched, onEnrichedChange,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
  enriched: EnrichedFields;
  onEnrichedChange: (k: keyof EnrichedFields, v: string | boolean) => void;
}>) {
  return (
    <div className="space-y-6">
      <FormField
        label="Collez le lien ici"
        htmlFor="input-url"
        hint="Copiez l'adresse internet que vous avez reçue (commence souvent par http:// ou https://)"
        required
      >
        <Input
          id="input-url"
          value={value}
          onChange={onChange}
          placeholder="Exemple : https://www.site-suspect.com/offre"
          hasError={hasError}
        />
      </FormField>

      <FormField
        label="Où avez-vous trouvé ce lien ?"
        htmlFor="url-source"
        hint="Savoir d'où vient ce lien améliore considérablement l'analyse"
      >
        <Select
          id="url-source"
          value={enriched.claimedIdentity ?? ''}
          onChange={(v) => onEnrichedChange('claimedIdentity', v)}
          options={[
            { value: '', label: '-- Choisir --' },
            { value: 'email', label: 'Dans un email' },
            { value: 'sms', label: 'Dans un SMS' },
            { value: 'social', label: 'Sur les réseaux sociaux' },
            { value: 'qr-code', label: 'Via un QR code' },
            { value: 'found-online', label: 'Trouvé en naviguant' },
            { value: 'ad', label: 'Dans une publicité' },
            { value: 'other', label: 'Autre' },
          ]}
        />
      </FormField>

      <PrecisionPanel>
        <FormField label="Que vous demande ce lien de faire ?" htmlFor="url-action-requested">
          <Select
            id="url-action-requested"
            value={enriched.actionRequested ?? ''}
            onChange={(v) => onEnrichedChange('actionRequested', v)}
            options={ACTION_REQUESTED_OPTIONS}
          />
        </FormField>
        <BooleanToggle
          id="url-mentions-money"
          label="Il est question d'argent, de gain ou d'une récompense"
          value={enriched.mentionsMoney}
          onChange={(v) => onEnrichedChange('mentionsMoney', v)}
        />
        <FormField label="Remarque ou contexte supplémentaire" htmlFor="url-comment">
          <TextArea
            id="url-comment"
            value={enriched.userComment ?? ''}
            onChange={(v) => onEnrichedChange('userComment', v)}
            rows={2}
            placeholder="Tout détail utile…"
            hasError={false}
          />
        </FormField>
      </PrecisionPanel>
    </div>
  );
}

function EmailLinksField({ links, onChange }: Readonly<{ links: LinkEntry[]; onChange: (links: LinkEntry[]) => void }>) {
  const addLink = () => onChange([...links, { id: crypto.randomUUID(), value: '' }]);
  const updateLink = (id: string, v: string) => onChange(links.map((l) => l.id === id ? { ...l, value: v } : l));
  const removeLink = (id: string) => onChange(links.filter((l) => l.id !== id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-semibold text-slate-900">
          Liens trouvés dans l&apos;email{' '}
          <span className="ml-2 text-base font-normal text-slate-500">(optionnel)</span>
        </label>
        <button
          type="button"
          onClick={addLink}
          className="inline-flex items-center gap-2 px-4 py-2 text-base font-semibold text-orange-700 bg-orange-50 border-2 border-orange-300 rounded-xl hover:bg-orange-100 transition-colors"
        >
          <span className="text-lg" aria-hidden="true">+</span> Ajouter un lien
        </button>
      </div>
      <p className="text-base text-slate-500">
        Si l&apos;email contient des boutons ou des liens cliquables, copiez-les ici. C&apos;est souvent là que se cache l&apos;arnaque.
      </p>
      {links.length === 0 ? (
        <button
          type="button"
          onClick={addLink}
          className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-slate-200 text-lg text-slate-400 hover:border-orange-300 hover:text-orange-500 transition-colors min-h-[80px]"
        >
          <span className="text-2xl" aria-hidden="true">🔗</span> Appuyez ici pour ajouter un lien suspect
        </button>
      ) : (
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.id} className="flex items-center gap-3">
              <span className="text-xl shrink-0" aria-hidden="true">🔗</span>
              <Input
                id={`email-link-${link.id}`}
                value={link.value}
                onChange={(v) => updateLink(link.id, v)}
                placeholder="https://lien-suspect.com/action"
              />
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="shrink-0 p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl border-2 border-slate-200 min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="Supprimer le lien"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmailForm({
  fields, body, links, onFieldChange, onBodyChange, onLinksChange,
  enriched, onEnrichedChange, hasError,
}: Readonly<{
  fields: AnalysisContextFields;
  body: string;
  links: LinkEntry[];
  onFieldChange: <K extends keyof AnalysisContextFields>(k: K, v: string) => void;
  onBodyChange: (v: string) => void;
  onLinksChange: (links: LinkEntry[]) => void;
  enriched: EnrichedFields;
  onEnrichedChange: (k: keyof EnrichedFields, v: string | boolean) => void;
  hasError: boolean;
}>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField label="Nom de l'expéditeur" htmlFor="email-sender-name" hint="La personne ou société qui vous a écrit">
          <Input id="email-sender-name" value={fields.senderName ?? ''} onChange={(v) => onFieldChange('senderName', v)} placeholder="Ex : Service Client La Poste" />
        </FormField>
        <FormField label="Son adresse email" htmlFor="email-sender-email" hint="L'adresse email de l'expéditeur">
          <Input id="email-sender-email" type="email" value={fields.senderEmail ?? ''} onChange={(v) => onFieldChange('senderEmail', v)} placeholder="Ex : support@laposte-colis.net" />
        </FormField>
      </div>
      <FormField label="L'objet de l'email" htmlFor="email-subject" hint="Ce qui est écrit dans la ligne « Objet » ou « Sujet »">
        <Input id="email-subject" value={fields.subject ?? ''} onChange={(v) => onFieldChange('subject', v)} placeholder="Ex : Votre colis est bloqué — action requise" />
      </FormField>
      <FormField label="Le texte de l'email" htmlFor="email-body" hint="Copiez tout le texte du message, même si c'est long" required>
        <TextArea id="email-body" value={body} onChange={onBodyChange} rows={7}
          placeholder="Cher client, nous avons détecté une activité suspecte sur votre compte. Veuillez cliquer ici pour confirmer votre identité…"
          hasError={hasError}
        />
      </FormField>
      <EmailLinksField links={links} onChange={onLinksChange} />

      <PrecisionPanel>
        <FormField label="Comment avez-vous reçu cet email ?" htmlFor="email-how-received">
          <Select
            id="email-how-received"
            value={enriched.howReceived ?? ''}
            onChange={(v) => onEnrichedChange('howReceived', v)}
            options={HOW_RECEIVED_OPTIONS}
          />
        </FormField>
        <FormField label="Qui prétend vous envoyer cet email ?" htmlFor="email-claimed-identity">
          <Select
            id="email-claimed-identity"
            value={enriched.claimedIdentity ?? ''}
            onChange={(v) => onEnrichedChange('claimedIdentity', v)}
            options={CLAIMED_IDENTITY_OPTIONS}
          />
        </FormField>
        <FormField label="Que vous demande-t-on ?" htmlFor="email-action-requested">
          <Select
            id="email-action-requested"
            value={enriched.actionRequested ?? ''}
            onChange={(v) => onEnrichedChange('actionRequested', v)}
            options={ACTION_REQUESTED_OPTIONS}
          />
        </FormField>
        <BooleanToggle
          id="email-mentions-money"
          label="Il est question d'argent ou d'une récompense"
          value={enriched.mentionsMoney}
          onChange={(v) => onEnrichedChange('mentionsMoney', v)}
        />
        <BooleanToggle
          id="email-asks-secrecy"
          label="On vous demande d'agir vite ou en secret"
          value={enriched.asksForSecrecy}
          onChange={(v) => onEnrichedChange('asksForSecrecy', v)}
        />
        <FormField label="Remarque supplémentaire" htmlFor="email-comment">
          <TextArea id="email-comment" value={enriched.userComment ?? ''} onChange={(v) => onEnrichedChange('userComment', v)} rows={2} placeholder="Tout détail utile…" hasError={false} />
        </FormField>
      </PrecisionPanel>
    </div>
  );
}

function MessageForm({
  fields, body, onFieldChange, onBodyChange,
  enriched, onEnrichedChange, hasError,
}: Readonly<{
  fields: AnalysisContextFields;
  body: string;
  onFieldChange: <K extends keyof AnalysisContextFields>(k: K, v: string) => void;
  onBodyChange: (v: string) => void;
  enriched: EnrichedFields;
  onEnrichedChange: (k: keyof EnrichedFields, v: string | boolean) => void;
  hasError: boolean;
}>) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField label="Qui vous a écrit ?" htmlFor="msg-sender-name" hint="Le nom affiché de la personne">
          <Input id="msg-sender-name" value={fields.senderName ?? ''} onChange={(v) => onFieldChange('senderName', v)} placeholder="Ex : Jean Dupont, inconnu…" />
        </FormField>
        <FormField label="Sur quelle application ?" htmlFor="msg-platform" hint="D'où vient ce message ?">
          <Select id="msg-platform" value={fields.platform ?? ''} onChange={(v) => onFieldChange('platform', v)} options={PLATFORM_OPTIONS} />
        </FormField>
      </div>
      <FormField label="Le texte du message" htmlFor="msg-body" hint="Copiez le message tel quel, même avec les fautes" required>
        <TextArea id="msg-body" value={body} onChange={onBodyChange} rows={6}
          placeholder="Bonjour ! J'ai vu votre annonce. Pouvez-vous me contacter au plus vite sur ce lien…"
          hasError={hasError}
        />
      </FormField>

      <PrecisionPanel>
        <FormField label="Cette personne prétend être…" htmlFor="msg-claimed-identity">
          <Select id="msg-claimed-identity" value={enriched.claimedIdentity ?? ''} onChange={(v) => onEnrichedChange('claimedIdentity', v)} options={CLAIMED_IDENTITY_OPTIONS} />
        </FormField>
        <FormField label="Que vous demande-t-on ?" htmlFor="msg-action-requested">
          <Select id="msg-action-requested" value={enriched.actionRequested ?? ''} onChange={(v) => onEnrichedChange('actionRequested', v)} options={ACTION_REQUESTED_OPTIONS} />
        </FormField>
        <FormField label="Y a-t-il un sentiment d'urgence ?" htmlFor="msg-urgency">
          <Select id="msg-urgency" value={enriched.urgencyLevel ?? ''} onChange={(v) => onEnrichedChange('urgencyLevel', v)} options={URGENCY_OPTIONS} />
        </FormField>
        <FormField label="Comment ce contact a-t-il commencé ?" htmlFor="msg-how-received">
          <Select id="msg-how-received" value={enriched.howReceived ?? ''} onChange={(v) => onEnrichedChange('howReceived', v)} options={HOW_RECEIVED_OPTIONS} />
        </FormField>
        <BooleanToggle
          id="msg-mentions-money"
          label="Il est question d'argent, d'un gain ou d'une opportunité"
          value={enriched.mentionsMoney}
          onChange={(v) => onEnrichedChange('mentionsMoney', v)}
        />
        <BooleanToggle
          id="msg-asks-secrecy"
          label="On vous demande de garder ça secret ou d'agir vite"
          value={enriched.asksForSecrecy}
          onChange={(v) => onEnrichedChange('asksForSecrecy', v)}
        />
        <FormField label="Contexte ou remarques" htmlFor="msg-comment">
          <TextArea id="msg-comment" value={enriched.userComment ?? ''} onChange={(v) => onEnrichedChange('userComment', v)} rows={2} placeholder="Tout détail utile…" hasError={false} />
        </FormField>
      </PrecisionPanel>
    </div>
  );
}

function PhoneForm({
  fields, body, onFieldChange, onBodyChange,
  enriched, onEnrichedChange, hasError,
}: Readonly<{
  fields: AnalysisContextFields;
  body: string;
  onFieldChange: <K extends keyof AnalysisContextFields>(k: K, v: string) => void;
  onBodyChange: (v: string) => void;
  enriched: EnrichedFields;
  onEnrichedChange: (k: keyof EnrichedFields, v: string | boolean) => void;
  hasError: boolean;
}>) {
  return (
    <div className="space-y-6">
      <FormField label="Le numéro de téléphone suspect" htmlFor="phone-number"
        hint="Le numéro qui vous a appelé ou envoyé un message texte (SMS)" required>
        <Input id="phone-number" type="tel"
          value={fields.senderPhone ?? ''}
          onChange={(v) => onFieldChange('senderPhone', v)}
          placeholder="Ex : +33 6 12 34 56 78 ou 0033612345678"
          hasError={hasError && !fields.senderPhone}
        />
      </FormField>
      <FormField label="Le texte du SMS reçu" htmlFor="phone-sms-body"
        hint="Si vous avez reçu un message texte (SMS) en plus, copiez-le ici — cela aide beaucoup l'analyse">
        <TextArea id="phone-sms-body" value={body} onChange={onBodyChange} rows={5}
          placeholder="Votre colis n°FR456789 est bloqué. Validez la livraison ici : http://…"
          hasError={false}
        />
      </FormField>

      <PrecisionPanel>
        <FormField label="L'appelant prétend être…" htmlFor="phone-claimed-identity">
          <Select id="phone-claimed-identity" value={enriched.claimedIdentity ?? ''} onChange={(v) => onEnrichedChange('claimedIdentity', v)} options={CLAIMED_IDENTITY_OPTIONS} />
        </FormField>
        <FormField label="Que vous a-t-on demandé ?" htmlFor="phone-action-requested">
          <Select id="phone-action-requested" value={enriched.actionRequested ?? ''} onChange={(v) => onEnrichedChange('actionRequested', v)} options={ACTION_REQUESTED_OPTIONS} />
        </FormField>
        <FormField label="Y avait-il un sentiment d'urgence ?" htmlFor="phone-urgency">
          <Select id="phone-urgency" value={enriched.urgencyLevel ?? ''} onChange={(v) => onEnrichedChange('urgencyLevel', v)} options={URGENCY_OPTIONS} />
        </FormField>
        <BooleanToggle
          id="phone-mentions-money"
          label="Il a été question d'argent ou d'une récompense"
          value={enriched.mentionsMoney}
          onChange={(v) => onEnrichedChange('mentionsMoney', v)}
        />
        <BooleanToggle
          id="phone-asks-secrecy"
          label="On vous a demandé de garder ça secret ou d'agir vite"
          value={enriched.asksForSecrecy}
          onChange={(v) => onEnrichedChange('asksForSecrecy', v)}
        />
        <FormField label="Que s'est-il passé / vos impressions ?" htmlFor="phone-comment">
          <TextArea id="phone-comment" value={enriched.userComment ?? ''} onChange={(v) => onEnrichedChange('userComment', v)} rows={3}
            placeholder="Ex : La personne parlait avec un accent étranger, elle connaissait mon nom, elle semblait très insistante…"
            hasError={false}
          />
        </FormField>
      </PrecisionPanel>
    </div>
  );
}

function TextForm({
  value, onChange, hasError, isAuto = false,
  enriched, onEnrichedChange,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
  isAuto?: boolean;
  enriched: EnrichedFields;
  onEnrichedChange: (k: keyof EnrichedFields, v: string | boolean) => void;
}>) {
  return (
    <div className="space-y-6">
      <FormField
        label={isAuto ? 'Collez ici ce qui vous semble suspect' : 'Le texte suspect'}
        htmlFor="input-text"
        hint={isAuto
          ? "Copiez n'importe quoi : un lien, un email, un numéro, un texte… on s'occupe de tout"
          : "Copiez le texte suspect : publicité, courrier, formulaire, message…"
        }
        required
      >
        <TextArea id="input-text" value={value} onChange={onChange} rows={7}
          placeholder={isAuto
            ? "Collez ici ce qui vous paraît louche ou bizarre…"
            : "Collez ici le texte suspect à analyser…"
          }
          hasError={hasError}
        />
      </FormField>

      <PrecisionPanel>
        <CommonEnrichedFields fields={enriched} onChange={onEnrichedChange} />
      </PrecisionPanel>
    </div>
  );
}

function TypeSelector({ value, onChange }: Readonly<{
  value: AnalyzableType | 'auto';
  onChange: (v: AnalyzableType | 'auto') => void;
}>) {
  return (
    <div className="space-y-3">
      <p className="text-xl font-bold text-slate-900">Qu&apos;est-ce que vous voulez vérifier ?</p>
      <p className="text-base text-slate-500">Choisissez le type de contenu suspect :</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ANALYSIS_TYPES.map((t) => {
          const isSelected = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              aria-pressed={isSelected}
              className={[
                'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all min-h-[100px] justify-center',
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200'
                  : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50',
              ].join(' ')}
            >
              <span className="text-3xl" aria-hidden="true">{t.icon}</span>
              <span className={`text-base font-bold leading-tight ${isSelected ? 'text-orange-800' : 'text-slate-700'}`}>
                {t.label}
              </span>
              <span className={`text-xs leading-tight ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>
                {t.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RiskBadge({ risk }: Readonly<{ risk: string }>) {
  const config: Record<string, { label: string; icon: string; cls: string }> = {
    safe:       { label: 'Semble sûr',     icon: '✅', cls: 'bg-green-100 text-green-900 border-green-200' },
    low:        { label: 'Risque faible',   icon: '🟡', cls: 'bg-yellow-100 text-yellow-900 border-yellow-200' },
    suspicious: { label: 'Suspect',         icon: '⚠️', cls: 'bg-orange-100 text-orange-900 border-orange-200' },
    dangerous:  { label: 'Dangereux',       icon: '🚫', cls: 'bg-red-100 text-red-900 border-red-200' },
    critical:   { label: 'Très dangereux',  icon: '🚨', cls: 'bg-red-100 text-red-900 border-red-300' },
  };
  const { label, icon, cls } = config[risk] ?? { label: risk, icon: '❓', cls: 'bg-slate-100 text-slate-900 border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-base font-bold border-2 ${cls}`}>
      <span aria-hidden="true">{icon}</span> {label}
    </span>
  );
}

function ScamTypes({ scamTypes }: { readonly scamTypes: readonly string[] }) {
  const visible = scamTypes.filter((t) => t !== 'unknown');
  if (!visible.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-lg font-bold text-slate-900">Type d&apos;arnaque identifié</h4>
      <div className="flex flex-wrap gap-3">
        {visible.map((type) => (
          <span key={type} className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold bg-orange-100 text-orange-900 border-2 border-orange-200">
            {SCAM_TYPE_LABELS[type] ?? type}
          </span>
        ))}
      </div>
    </div>
  );
}

function RegexTriggers({ result }: { readonly result: AnalysisResult }) {
  const { triggers } = result.regex;
  if (!triggers?.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-lg font-bold text-slate-900">Éléments suspects détectés ({triggers.length})</h4>
      <ul className="space-y-2">
        {triggers.map((trigger, i) => (
          <li key={`${trigger.type}-${i}`} className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <span className="text-2xl shrink-0" aria-hidden="true">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-amber-900">{trigger.type}</p>
              <p className="text-sm text-amber-800 truncate">{trigger.match}</p>
              {trigger.description && <p className="text-sm text-amber-700 mt-1">{trigger.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AIAnalysis({ result }: { readonly result: AnalysisResult }) {
  if (!result.ai) {
    return (
      <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-xl">
        <p className="text-base text-slate-500">Analyse IA non disponible pour ce contenu.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">🤖</span>
        <h4 className="text-lg font-bold text-slate-900">Ce que pense notre IA</h4>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${result.ai.confidence}%` }}
            />
          </div>
          <span className="text-base text-slate-500 font-medium whitespace-nowrap">{result.ai.confidence}%</span>
        </div>
      </div>
      <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-xl">
        <p className="text-lg text-slate-800 leading-relaxed">{result.ai.explanation}</p>
      </div>
      {result.ai.indicators && result.ai.indicators.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-base font-bold text-slate-700">Signaux d&apos;alerte repérés</h5>
          <div className="flex flex-wrap gap-2">
            {result.ai.indicators.map((indicator) => (
              <span key={indicator} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                {indicator}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Recommendation({ result }: { readonly result: AnalysisResult }) {
  const isDangerous = result.risk === 'dangerous' || result.risk === 'critical';
  return (
    <div className={`p-6 rounded-2xl border-4 space-y-4 ${isDangerous ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-200'}`}>
      <h4 className={`text-xl font-black flex items-center gap-2 ${isDangerous ? 'text-red-900' : 'text-orange-900'}`}>
        <span aria-hidden="true">💡</span> Que faire ?
      </h4>
      <p className={`text-lg leading-relaxed font-medium ${isDangerous ? 'text-red-800' : 'text-orange-800'}`}>
        {result.recommendation}
      </p>
      {result.actions.length > 0 && (
        <ul className="space-y-3">
          {result.actions.map((action) => (
            <li key={action} className={`flex items-start gap-3 text-lg font-semibold ${isDangerous ? 'text-red-800' : 'text-orange-800'}`}>
              <span className="shrink-0 text-xl" aria-hidden="true">→</span>
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LinkAnalysis({ linkAnalysis }: {
  readonly linkAnalysis?: Array<{ url: string; risk: string; scamTypes: readonly string[]; recommendation: string }>;
}) {
  if (!linkAnalysis?.length) return null;
  const riskColors: Record<string, string> = {
    safe: 'bg-green-50 border-green-200 text-green-900',
    low: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    suspicious: 'bg-orange-50 border-orange-200 text-orange-900',
    dangerous: 'bg-red-50 border-red-200 text-red-900',
    critical: 'bg-red-50 border-red-300 text-red-900',
  };
  const riskIcons: Record<string, string> = { safe: '✅', low: '⚠️', suspicious: '⚠️', dangerous: '🚫', critical: '🚫' };
  return (
    <div className="space-y-3">
      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span aria-hidden="true">🔗</span> Analyse des liens ({linkAnalysis.length})
      </h4>
      <ul className="space-y-3">
        {linkAnalysis.map((link) => (
          <li key={link.url} className={`p-4 border-2 rounded-xl ${riskColors[link.risk] ?? 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0" aria-hidden="true">{riskIcons[link.risk] ?? '❓'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold truncate">{link.url}</p>
                <p className="text-sm font-semibold mt-1">Risque : {link.risk}</p>
                {link.scamTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {link.scamTypes.filter((t) => t !== 'unknown').map((type) => (
                      <span key={type} className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-white/50">
                        {SCAM_TYPE_LABELS[type] ?? type}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm mt-2 opacity-80">{link.recommendation}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContextFieldsDisplay({ contextFields }: { readonly contextFields?: AnalysisContextFields }) {
  const LABELS: Partial<Record<keyof AnalysisContextFields, string>> = {
    senderName: 'Expéditeur', senderEmail: 'Email expéditeur',
    recipientEmail: 'Email destinataire', senderPhone: 'Numéro',
    platform: 'Application', subject: 'Objet',
  };
  if (!contextFields) return null;
  const entries = (Object.entries(contextFields) as [keyof AnalysisContextFields, string | undefined][]).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-3">
      <h4 className="text-base font-bold text-blue-900">Informations que vous avez fournies</h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <dt className="text-sm font-semibold text-blue-700">{LABELS[key] ?? key}</dt>
            <dd className="text-base text-blue-900 font-medium truncate">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AnalysisResultCard({ result, onCopy, onReport }: {
  readonly result: AnalysisResult & { linkAnalysis?: Array<{ url: string; risk: string; scamTypes: readonly string[]; recommendation: string }> };
  readonly onCopy: () => void;
  readonly onReport: () => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="bg-slate-800 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-black text-white">Résultat de l&apos;analyse</h3>
          <RiskBadge risk={result.risk} />
        </div>
        <div className="flex gap-3">
          <button onClick={onCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold text-slate-200 bg-slate-700 border-2 border-slate-600 rounded-xl hover:bg-slate-600 transition-colors min-h-[48px]"
          >
            <span aria-hidden="true">📋</span> Copier
          </button>
          <button onClick={onReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold text-red-200 bg-red-700 border-2 border-red-600 rounded-xl hover:bg-red-600 transition-colors min-h-[48px]"
          >
            <span aria-hidden="true">🚨</span> Signaler
          </button>
        </div>
      </div>

      {/* Corps */}
      <div className="p-6 space-y-6">
        <ContextFieldsDisplay contextFields={result.contextFields} />
        <LinkAnalysis linkAnalysis={result.linkAnalysis} />
        <ScamTypes scamTypes={result.scamTypes} />
        <RegexTriggers result={result} />
        <AIAnalysis result={result} />
        <Recommendation result={result} />
        <div className="pt-4 border-t-2 border-slate-100 flex flex-wrap gap-4 text-sm text-slate-400 font-medium">
          <span>Référence : {result.analysisId}</span>
          <span>Type : {result.inputType}</span>
          <span>Date : {new Date(result.timestamp).toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AnalyzeClient(): React.JSX.Element {
  const [analysisType, setAnalysisType]   = useState<AnalyzableType | 'auto'>('auto');
  const [status, setStatus]               = useState<AnalysisStatus>('idle');
  const [result, setResult]               = useState<AnalysisResult | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [mainValue, setMainValue]         = useState('');
  const [contextFields, setContextFields] = useState<AnalysisContextFields>({});
  const [emailLinks, setEmailLinks]       = useState<LinkEntry[]>([]);
  const [enrichedFields, setEnrichedFields] = useState<EnrichedFields>({});
  const resultRef                         = useRef<HTMLDivElement>(null);

  const { copied, copy } = useClipboard();

  // Scroll vers le résultat automatiquement
  useEffect(() => {
    if (status === 'success' && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [status]);

  const setField = useCallback(<K extends keyof AnalysisContextFields>(key: K, value: string) => {
    setContextFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setEnrichedField = useCallback((key: keyof EnrichedFields, value: string | boolean) => {
    setEnrichedFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleTypeChange = useCallback((type: AnalyzableType | 'auto') => {
    setAnalysisType(type);
    setMainValue('');
    setContextFields({});
    setEmailLinks([]);
    setEnrichedFields({});
    setError(null);
    setResult(null);
    setStatus('idle');
  }, []);

  const buildRequestBody = useCallback((primaryValue: string) => {
    const body: Record<string, unknown> = { value: primaryValue };
    if (analysisType !== 'auto') body.type = analysisType;

    const hasContext = Object.values(contextFields).some((v) => (v as string)?.trim());
    if (hasContext) body.contextFields = contextFields;

    // Liens email : envoyés comme tableau dédié pour analyse individuelle par l'API
    // On normalise les URLs sans protocole (ex: "site.com" → "https://site.com")
    if (analysisType === 'email' && emailLinks.length > 0) {
      const validLinks = emailLinks
        .map(l => l.value.trim())
        .filter(Boolean)
        .map(url => /^https?:\/\//i.test(url) ? url : `https://${url}`);
      if (validLinks.length > 0) body.emailLinks = validLinks;
    }

    // Construction du contexte enrichi pour l'IA (métadonnées, pas les liens)
    const enrichedContext = buildEnrichedContext({
      analysisType,
      contextFields,
      enrichedFields,
      mainValue,
      emailLinks,
    });

    // Pour les emails : le corps complet va dans le context (pas de limite de taille),
    // les métadonnées enrichies s'y ajoutent aussi.
    if (analysisType === 'email' && mainValue.trim()) {
      const emailBodySection = `Corps de l'email :\n${mainValue.trim()}`;
      body.context = enrichedContext.trim()
        ? `${emailBodySection}\n\n${enrichedContext}`
        : emailBodySection;
    } else if (enrichedContext.trim()) {
      body.context = enrichedContext;
    }

    return body;
  }, [analysisType, contextFields, enrichedFields, mainValue, emailLinks]);

  // Helper functions to reduce cognitive complexity
const getPrimaryValue = useCallback(() => {
  if (analysisType === 'email') {
    return (
      contextFields.senderEmail?.trim() ||
      contextFields.senderName?.trim() ||
      contextFields.subject?.trim() ||
      mainValue.trim().substring(0, 200)
    );
  } else if (analysisType === 'phone') {
    return (contextFields.senderPhone ?? '').trim();
  } else {
    return mainValue.trim();
  }
}, [analysisType, contextFields, mainValue]);

const getErrorMessage = useCallback(() => {
  if (analysisType === 'phone') {
    return 'Veuillez entrer un numéro de téléphone';
  } else if (analysisType === 'email') {
    return "Veuillez remplir au moins l'adresse de l'expéditeur ou le corps de l'email";
  } else {
    return 'Veuillez remplir le champ principal avant de continuer';
  }
}, [analysisType]);

const handleAnalyze = useCallback(async () => {
  const primaryValue = getPrimaryValue();
  const hasEmailBody = analysisType === 'email' && mainValue.trim().length > 0;

  if (!primaryValue && !hasEmailBody) {
    setError(getErrorMessage());
    return;
  }

  const finalPrimaryValue = primaryValue || (hasEmailBody ? mainValue.trim().substring(0, 200) : '');

  setStatus('loading');
  setError(null);
  setResult(null);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildRequestBody(finalPrimaryValue)),
    });

    const data = await response.json().catch(() => ({ error: 'Réponse invalide' }));
    if (!response.ok) throw new Error(data.error ?? `Erreur HTTP ${response.status}`);
    if (!data.success || !data.data) throw new Error('Réponse inattendue du serveur');

    setResult(data.data);
    setStatus('success');
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    setStatus('error');
  }
}, [analysisType, mainValue, buildRequestBody, getPrimaryValue, getErrorMessage]);

  const handleCopyResult = useCallback(() => {
    if (!result) return;
    copy([
      'Analyse Anti-Pépins',
      '==================',
      `Type : ${result.inputType}`,
      `Risque : ${result.risk}`,
      `Contenu : ${result.inputValue}`,
      `Recommandation : ${result.recommendation}`,
      result.actions.length ? `\nActions conseillées :\n${result.actions.map(a => '  → ' + a).join('\n')}` : '',
    ].filter(Boolean).join('\n'));
  }, [result, copy]);

  const handleReport = useCallback(async () => {
    if (!result) return;
    try {
      await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'report', analysisId: result.analysisId, details: "Signalement depuis la page d'analyse" }),
      });
    } catch { /* non-bloquant */ }
  }, [result]);

  const sharedFormProps = { enriched: enrichedFields, onEnrichedChange: setEnrichedField };

  const renderForm = () => {
    switch (analysisType) {
      case 'url':     return <UrlForm value={mainValue} onChange={setMainValue} hasError={status === 'error'} {...sharedFormProps} />;
      case 'email':   return <EmailForm fields={contextFields} body={mainValue} links={emailLinks} onFieldChange={setField} onBodyChange={setMainValue} onLinksChange={setEmailLinks} hasError={status === 'error'} {...sharedFormProps} />;
      case 'message': return <MessageForm fields={contextFields} body={mainValue} onFieldChange={setField} onBodyChange={setMainValue} hasError={status === 'error'} {...sharedFormProps} />;
      case 'phone':   return <PhoneForm fields={contextFields} body={mainValue} onFieldChange={setField} onBodyChange={setMainValue} hasError={status === 'error'} {...sharedFormProps} />;
      case 'text':    return <TextForm value={mainValue} onChange={setMainValue} hasError={status === 'error'} {...sharedFormProps} />;
      default:        return <TextForm value={mainValue} onChange={setMainValue} hasError={status === 'error'} isAuto {...sharedFormProps} />;
    }
  };

  return (
    <MainLayout>
      <div className="bg-slate-100 min-h-screen">

        {/* Hero */}
        <section className="bg-white border-b-4 border-slate-200 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Vérifier un contenu suspect
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Vous avez reçu quelque chose de bizarre ? Copiez-le ici et nous vous dirons
              en quelques secondes si c&apos;est une arnaque.
            </p>
            <p className="text-base text-slate-400">Gratuit · Confidentiel · Sans inscription</p>
          </div>
        </section>

        {/* Contenu */}
        <section className="py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="lg:col-span-4">

                {/* Formulaire */}
                <div className="bg-white border-2 border-slate-200 overflow-hidden rounded-2xl shadow-sm">

                  {/* Sélecteur de type */}
                  <div className="p-6 bg-slate-50 border-b-2 border-slate-200">
                    <TypeSelector value={analysisType} onChange={handleTypeChange} />
                  </div>

                  {/* Champs */}
                  <div className="p-6 space-y-6">
                    {renderForm()}

                    {/* Erreur */}
                    {error && (
                      <div className="flex items-start gap-4 p-5 bg-red-50 border-2 border-red-300 rounded-2xl" role="alert">
                        <span className="text-3xl shrink-0" aria-hidden="true">❌</span>
                        <div>
                          <p className="text-lg font-bold text-red-900">Une erreur s&apos;est produite</p>
                          <p className="text-base text-red-700 mt-1">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex justify-center pt-2">
                      <Button
                        onClick={handleAnalyze}
                        variant="primary"
                        size="lg"
                        isLoading={status === 'loading'}
                        disabled={status === 'loading'}
                      >
                        {status === 'loading' ? (
                          <span className="flex items-center gap-3 text-xl font-black py-1">
                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Analyse en cours… Patientez
                          </span>
                        ) : (
                          <span className="flex items-center gap-3 text-xl font-black py-1">
                            <span aria-hidden="true">🔍</span> Analyser maintenant
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Résultat */}
                {status === 'success' && result && (
                  <div ref={resultRef} className="mt-6">
                    <AnalysisResultCard result={result} onCopy={handleCopyResult} onReport={handleReport} />
                    {copied && (
                      <p className="text-center text-base text-green-700 font-semibold mt-3">
                        ✅ Résultat copié dans le presse-papiers
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}