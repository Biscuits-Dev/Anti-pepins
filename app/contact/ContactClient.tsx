'use client';

import { useState } from 'react';
import { MainLayout, SectionHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';

interface FormData {
  fullname:    string;
  email:       string;
  subject:     string;
  message:     string;
  acceptTerms: boolean;
}


const SUBJECT_OPTIONS = [
  { value: 'question',    label: 'Question générale' },
  { value: 'suggestion',  label: "Suggestion d'amélioration" },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'media',       label: 'Presse / Médias' },
  { value: 'autre',       label: 'Autre' },
] as const;

const FAQS = [
  {
    question: 'Comment signaler une arnaque ?',
    answer:   "Rendez-vous sur la page « Signaler une arnaque » et remplissez le formulaire en indiquant tous les détails de l'arnaque.",
  },
  {
    question: 'Est-ce que mes informations sont sécurisées ?',
    answer:   'Absolument. Nous utilisons les derniers standards de sécurité pour protéger vos données.',
  },
  {
    question: 'Puis-je rester anonyme ?',
    answer:   'Oui, vous pouvez signaler une arnaque de manière anonyme.',
  },
  {
    question: 'Combien de temps pour une réponse ?',
    answer:   'Nous nous engageons à répondre dans un délai de 24 à 48 heures maximum.',
  },
] as const;

const INITIAL_FORM: FormData = {
  fullname:    '',
  email:       '',
  subject:     '',
  message:     '',
  acceptTerms: false,
};

export default function ContactClient(): React.JSX.Element {
  const [formData,     setFormData]     = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    if (!formData.acceptTerms) {
      setSubmitStatus('error');
      setErrorMessage('Veuillez accepter les conditions avant d\'envoyer.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fullname: formData.fullname,
          email:    formData.email,
          subject:  formData.subject,
          message:  formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = Array.isArray(data.details)
          ? data.details.join(' ')
          : data.error ?? "Erreur lors de l'envoi.";
        throw new Error(detail);
      }

      setSubmitStatus('success');
      setFormData(INITIAL_FORM);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="py-12 bg-slate-50" aria-labelledby="form-heading">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            id="form-heading"
            title="Formulaire de contact"
            subtitle="Remplissez le formulaire ci-dessous pour nous envoyer un message directement"
          />

          <div className="bg-white border border-slate-200 rounded-lg p-8">

            {submitStatus === 'success' && (
              <div role="alert" className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                ✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
              </div>
            )}
            {submitStatus === 'error' && (
              <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                ❌ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullname" className="block text-sm font-medium text-slate-700 mb-1">
                    Nom complet <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email <span aria-hidden="true" className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                  Sujet <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white transition-colors"
                >
                  <option value="" disabled>Sélectionnez un sujet</option>
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                  Message <span aria-hidden="true" className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  minLength={10}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 resize-none transition-colors"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 mt-0.5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded shrink-0"
                />
                <span className="text-sm text-slate-700">
                  J&apos;accepte que mes informations soient utilisées pour répondre à ma demande.
                </span>
              </label>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Envoi en cours…' : '📤 Envoyer le message'}
                </button>
                <LinkButton href="/" variant="ghost" className="px-6 py-2">
                  Annuler
                </LinkButton>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            id="faq-heading"
            title="Questions fréquentes"
            subtitle="Retrouvez les réponses aux questions les plus courantes"
          />
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white border border-slate-200 rounded-lg"
              >
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-slate-900">
                  <span>{faq.question}</span>
                  <span className="transition-transform group-open:rotate-45 select-none text-emerald-600 text-xl" aria-hidden="true">+</span>
                </summary>
                <p className="px-6 pb-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}