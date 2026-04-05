'use client';

import { useState } from 'react';
import { MainLayout, SectionHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';
import ScamTypesSection from '@/components/ScamTypesSection';
import { reportTypes } from '@/lib/scam-types';

interface FormData {
  scamType:     string;
  incidentDate: string;
  description:  string;
  amount:       string;
  contactEmail: string;
  receiveCopy:  boolean;
  needHelp:     boolean;
}

const STEPS = [
  { step: '1', title: "Décrivez l'arnaque",       description: "Expliquez en détail comment l'arnaque s'est produite, les messages reçus et les méthodes utilisées.", icon: '📝' },
  { step: '2', title: 'Joignez les preuves',       description: "Ajoutez des captures d'écran, emails, messages ou tout autre élément pertinent.",                    icon: '📎' },
  { step: '3', title: 'Soumettez votre signalement', description: 'Notre équipe analysera votre cas et vous répondra dans les plus brefs délais.',                    icon: '📤' },
  { step: '4', title: 'Suivi et actions',           description: 'Vous recevrez un retour sur votre signalement et les actions entreprises.',                         icon: '🔍' },
] as const;

const INITIAL_FORM: FormData = {
  scamType:     '',
  incidentDate: '',
  description:  '',
  amount:       '',
  contactEmail: '',
  receiveCopy:  false,
  needHelp:     false,
};

export default function ReportClient(): React.JSX.Element {
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

    if (!formData.scamType) {
      setSubmitStatus('error');
      setErrorMessage("Veuillez sélectionner un type d'arnaque.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.incidentDate) {
      setSubmitStatus('error');
      setErrorMessage("Veuillez indiquer la date de l'incident.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.description || formData.description.trim().length < 20) {
      setSubmitStatus('error');
      setErrorMessage('La description doit contenir au moins 20 caractères.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
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

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="bg-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Signaler une arnaque
              </h1>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                Votre signalement est essentiel pour lutter contre les arnaques en ligne.
                En partageant votre expérience, vous aidez à protéger d&apos;autres personnes
                et contribuez à identifier les escrocs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LinkButton href="#report-form" variant="primary" size="lg">
                  Faire un signalement
                </LinkButton>
                <LinkButton href="/support" variant="outline" size="lg">
                  Besoin d&apos;aide immédiate
                </LinkButton>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-white rounded-full p-8 shadow-2xl border-4 border-emerald-300 text-center">
                  <div className="text-8xl mb-4">🚨</div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">Signalement</div>
                  <div className="text-sm text-slate-600">Anonyme &amp; Sécurisé</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScamTypesSection />

      <section id="report-form" className="py-12 bg-slate-50">
        <SectionHeader
          title="Formulaire de signalement"
          subtitle="Remplissez ce formulaire pour nous aider à comprendre votre situation"
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">

            <p className="text-center text-slate-500 text-sm mb-6">
              Toutes les informations fournies sont traitées de manière confidentielle.
            </p>

            {submitStatus === 'success' && (
              <div role="alert" className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                ✅ Votre signalement a été envoyé avec succès ! Nous l&apos;analyserons dans les plus brefs délais.
              </div>
            )}
            {submitStatus === 'error' && (
              <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                ❌ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              <div>
                <label htmlFor="scamType" className="block text-sm font-semibold text-slate-700 mb-2">
                  Type d&apos;arnaque <span className="text-red-500">*</span>
                </label>
                <select
                  id="scamType"
                  name="scamType"
                  required
                  value={formData.scamType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <option value="">Sélectionnez le type d&apos;arnaque</option>
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="incidentDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  Date de l&apos;incident <span className="text-red-500">*</span>
                </label>
                <input
                  id="incidentDate"
                  name="incidentDate"
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.incidentDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                  Description détaillée <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  required
                  minLength={20}
                  placeholder="Décrivez ce qui s'est passé, comment vous avez été contacté, ce qui vous a été demandé…"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-slate-900 hover:border-slate-400 transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {formData.description.trim().length} / 20 min.
                </p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-2">
                  Montant perdu (si applicable)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">€</span>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email de contact <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="votre@email.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 hover:border-slate-400 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">Pour recevoir un suivi de votre signalement</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-100">
                <label htmlFor="receiveCopy" className="flex items-center gap-3 cursor-pointer">
                  <input
                    id="receiveCopy"
                    name="receiveCopy"
                    type="checkbox"
                    checked={formData.receiveCopy}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Recevoir une copie de confirmation par email
                  </span>
                </label>

                <div>
                  <label htmlFor="needHelp" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="needHelp"
                      name="needHelp"
                      type="checkbox"
                      checked={formData.needHelp}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Je souhaite recevoir de l&apos;aide et un accompagnement
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-8">Notre équipe vous contactera pour vous guider</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 focus:ring-4 focus:ring-emerald-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer mon signalement'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <SectionHeader
          title="Comment fonctionne le signalement ?"
          subtitle="Un processus simple et sécurisé en 4 étapes"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.step}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                  <div className="text-3xl">{step.icon}</div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ensemble, luttons contre les arnaques
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Chaque signalement compte. En partageant votre expérience, vous aidez
            à protéger des milliers de personnes et à rendre internet plus sûr.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/analyze" variant="secondary" size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
              🔍 Analyser un message suspect
            </LinkButton>
            <LinkButton href="/faq" variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-emerald-600">
              Consulter la FAQ
            </LinkButton>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}