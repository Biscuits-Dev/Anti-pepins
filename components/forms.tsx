'use client';

import React from 'react';
import { Button, Input, TextArea, Select, Checkbox, LinkButton } from '@/components/ui';
import type { ScamType, LossStatus, ScamStatus } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchFormProps {
  readonly searchTerm: string;
  readonly onSearchChange: (value: string) => void;
  readonly onSearchSubmit?: () => void;
}

interface FilterBarProps {
  readonly filterType: string;
  readonly onTypeChange: (value: string) => void;
  readonly filterStatus: string;
  readonly onStatusChange: (value: string) => void;
  readonly sortBy: string;
  readonly onSortChange: (value: string) => void;
}

interface ReportFormProps {
  readonly onSubmit: (data: ReportFormData) => void;
  readonly isLoading?: boolean;
}

interface ContactFormProps {
  readonly onSubmit: (data: ContactFormData) => void;
  readonly isLoading?: boolean;
}

interface ReportFormData {
  readonly scamType: ScamType;
  readonly date: string;
  readonly description: string;
  readonly website: string;
  readonly contact: string;
  readonly loss: LossStatus;
  readonly acknowledgeTruth: boolean;
  readonly shareData: boolean;
}

interface ContactFormData {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
  readonly acceptTerms: boolean;
}

// ─── Données statiques ────────────────────────────────────────────────────────

const SCAM_TYPE_OPTIONS: readonly { value: ScamType; label: string }[] = [
  { value: 'phishing',             label: 'Hameçonnage (Phishing)' },
  { value: 'fake-website',         label: 'Site web frauduleux' },
  { value: 'scam-call',            label: 'Appel frauduleux' },
  { value: 'social-engineering',   label: 'Ingénierie sociale' },
  { value: 'investment',           label: "Arnaque à l'investissement" },
  { value: 'romance',              label: 'Arnaque sentimentale' },
  { value: 'tech-support',         label: 'Support technique frauduleux' },
  { value: 'other',                label: 'Autre' },
] as const;

const LOSS_OPTIONS: readonly { value: LossStatus; label: string }[] = [
  { value: 'yes',       label: 'Oui' },
  { value: 'no',        label: 'Non' },
  { value: 'attempted', label: 'Tentative' },
] as const;

const CONTACT_SUBJECT_OPTIONS = [
  { value: 'question',    label: 'Question générale' },
  { value: 'suggestion',  label: "Suggestion d'amélioration" },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'media',       label: 'Presse / Médias' },
  { value: 'autre',       label: 'Autre' },
] as const;

// ─── SearchForm ───────────────────────────────────────────────────────────────

export function SearchForm({ searchTerm, onSearchChange, onSearchSubmit }: SearchFormProps): React.JSX.Element {
  return (
    <div className="bg-white border border-slate-200  -lg p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Rechercher par mot-clé, URL, type d'arnaque…"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <Button onClick={onSearchSubmit} variant="primary" size="md">
          🔍 Rechercher
        </Button>
      </div>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

export function FilterBar({
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}: FilterBarProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Select
        value={filterType}
        onChange={onTypeChange}
        options={[
          { value: '',           label: 'Tous les types' },
          { value: 'phishing',   label: 'Hameçonnage' },
          { value: 'fake-website', label: 'Site frauduleux' },
          { value: 'scam-call',  label: 'Appel frauduleux' },
          { value: 'investment', label: 'Investissement' },
          { value: 'romance',    label: 'Romance' },
        ]}
      />
      <Select
        value={filterStatus}
        onChange={onStatusChange}
        options={[
          { value: '',            label: 'Tous les statuts' },
          { value: 'confirmé',    label: 'Confirmé' },
          { value: 'non vérifié', label: 'Non vérifié' },
        ]}
      />
      <Select
        value={sortBy}
        onChange={onSortChange}
        options={[
          { value: 'date',    label: 'Date (récent)' },
          { value: 'reports', label: 'Popularité' },
        ]}
      />
    </div>
  );
}

// ─── ReportForm ───────────────────────────────────────────────────────────────

export function ReportForm({ onSubmit, isLoading = false }: ReportFormProps): React.JSX.Element {
  const [loss, setLoss]                         = React.useState<LossStatus>('attempted');
  const [scamType, setScamType]                 = React.useState<ScamType>('phishing');
  const [date, setDate]                         = React.useState('');
  const [description, setDescription]           = React.useState('');
  const [website, setWebsite]                   = React.useState('');
  const [contact, setContact]                   = React.useState('');
  const [acknowledgeTruth, setAcknowledgeTruth] = React.useState(false);
  const [shareData, setShareData]               = React.useState(false);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ scamType, date, description, website, contact, loss, acknowledgeTruth, shareData });
  }

  function isScamType(value: string): value is ScamType {
    return SCAM_TYPE_OPTIONS.some((opt) => opt.value === value);
  }

  function isLossStatus(value: string): value is LossStatus {
    return LOSS_OPTIONS.some((opt) => opt.value === value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Select
        value={scamType}
        onChange={(v) => { if (isScamType(v)) setScamType(v); }}
        options={SCAM_TYPE_OPTIONS}
      />

      <Input type="date" value={date} onChange={setDate} />

      <TextArea
        value={description}
        onChange={setDescription}
        rows={6}
        placeholder="Décrivez ce qui s'est passé…"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input type="url"  placeholder="URL du site web (si applicable)" value={website} onChange={setWebsite} />
        <Input type="text" placeholder="Contact utilisé (email, numéro…)" value={contact} onChange={setContact} />
      </div>

      <fieldset className="border-0 p-0 m-0">
        <legend className="block text-sm font-medium text-slate-700 mb-3">
          Avez-vous perdu de l&apos;argent ?
        </legend>
        <div className="flex flex-col sm:flex-row gap-4">
          {LOSS_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="loss"
                value={option.value}
                checked={loss === option.value}
                onChange={() => { if (isLossStatus(option.value)) setLoss(option.value); }}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-sm text-slate-700">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-2">
          Preuves (captures d&apos;écran, emails, etc.)
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file: -md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="mt-2 text-xs text-slate-500">
          Formats acceptés : JPG, PNG, PDF. Taille max : 5 Mo par fichier.
        </p>
      </div>

      <div className="space-y-3">
        <Checkbox
          checked={acknowledgeTruth}
          onChange={setAcknowledgeTruth}
          label="J'atteste sur l'honneur que les informations fournies sont exactes et que je dispose des droits nécessaires pour les partager."
          required
        />
        <Checkbox
          checked={shareData}
          onChange={setShareData}
          label="J'accepte que mes informations alimentent la base de données publique (anonymisation garantie)."
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
          Soumettre le signalement
        </Button>
        <LinkButton href="/" variant="ghost">
          Annuler
        </LinkButton>
      </div>
    </form>
  );
}

// ─── ContactForm ──────────────────────────────────────────────────────────────

export function ContactForm({ onSubmit, isLoading = false }: ContactFormProps): React.JSX.Element {
  const [name, setName]             = React.useState('');
  const [email, setEmail]           = React.useState('');
  const [subject, setSubject]       = React.useState('');
  const [message, setMessage]       = React.useState('');
  const [acceptTerms, setAcceptTerms] = React.useState(false);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({ name, email, subject, message, acceptTerms });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input type="text"  placeholder="Nom complet *" value={name}  onChange={setName}  required />
        <Input type="email" placeholder="votre@email.com" value={email} onChange={setEmail} required />
      </div>

      <Select
        value={subject}
        onChange={setSubject}
        options={[{ value: '', label: 'Sélectionnez un sujet *' }, ...CONTACT_SUBJECT_OPTIONS]}
        required
      />

      <TextArea
        value={message}
        onChange={setMessage}
        rows={6}
        placeholder="Décrivez votre demande en détail…"
        required
      />

      <Checkbox
        checked={acceptTerms}
        onChange={setAcceptTerms}
        label="J'accepte que mes informations soient utilisées pour répondre à ma demande."
        required
      />

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
          📤 Envoyer le message
        </Button>
        <LinkButton href="/" variant="ghost">
          Annuler
        </LinkButton>
      </div>
    </form>
  );
}

// ─── NewsletterForm ───────────────────────────────────────────────────────────

export function NewsletterForm(): React.JSX.Element {
  const [email, setEmail] = React.useState('');

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input type="email" placeholder="Votre adresse email" value={email} onChange={setEmail} className="flex-1" required />
        <Button type="submit" variant="primary" size="md">
          S&apos;abonner
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Pas de spam, seulement des conseils utiles. Désabonnement à tout moment.
      </p>
    </form>
  );
}

// ─── ScamStatusForm ───────────────────────────────────────────────────────────

interface ScamStatusFormProps {
  readonly onSubmit: (status: ScamStatus) => void;
}

const SCAM_STATUS_OPTIONS: readonly { value: ScamStatus; label: string }[] = [
  { value: 'confirmé',    label: 'Marquer comme confirmé' },
  { value: 'non vérifié', label: 'Marquer comme non vérifié' },
] as const;

function isScamStatus(value: string): value is ScamStatus {
  return SCAM_STATUS_OPTIONS.some((opt) => opt.value === value);
}

export function ScamStatusForm({ onSubmit }: ScamStatusFormProps): React.JSX.Element {
  const [status, setStatus] = React.useState<ScamStatus>('confirmé');

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(status);
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit} noValidate>
      <Select
        value={status}
        onChange={(v) => { if (isScamStatus(v)) setStatus(v); }}
        options={SCAM_STATUS_OPTIONS}
      />
      <Button type="submit" size="sm" variant="primary">
        Mettre à jour
      </Button>
    </form>
  );
}