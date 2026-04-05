import type { Metadata } from 'next';
import Image from 'next/image';
import { MainLayout, SectionHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';

const emergencySteps = [
  {
    step: '1',
    title: 'Arrêtez toute communication',
    description: 'Cessez immédiatement tout contact avec la personne ou l\'organisation suspectée d\'être une arnaque.',
    icon: '✋',
  },
  {
    step: '2',
    title: 'Ne transférez rien',
    description: 'Ne versez aucun argent, ne donnez aucun code de carte bancaire ou informations personnelles.',
    icon: '🚫',
  },
  {
    step: '3',
    title: 'Conservez les preuves',
    description: 'Gardez tous les messages, emails, captures d\'écran et informations de contact.',
    icon: '📸',
  },
  {
    step: '4',
    title: 'Signalez rapidement',
    description: 'Contactez-nous immédiatement ou appelez les autorités compétentes.',
    icon: '🚨',
  },
];

const supportServices = [
  {
    id: 'immediate',
    icon: '🆘',
    title: 'Assistance immédiate',
    description: 'Équipe d\'intervention rapide pour les cas urgents en cours.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'investigation',
    icon: '🔍',
    title: 'Enquête approfondie',
    description: 'Analyse détaillée de l\'arnaque et recherche des escrocs.',
    availability: 'Sur demande',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'prevention',
    icon: '🛡️',
    title: 'Prévention personnalisée',
    description: 'Conseils et outils pour éviter les futures arnaques.',
    availability: 'Permanent',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'legal',
    icon: '⚖️',
    title: 'Aide juridique',
    description: 'Orientation vers les services légaux et démarches à suivre.',
    availability: 'Sur rendez-vous',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
];

const resources = [
  {
    title: 'Guide d\'auto-défense numérique',
    description: 'Apprenez à reconnaître et éviter les arnaques en 10 leçons.',
    link: '/resources/guide',
    icon: '📚',
  },
  {
    title: 'Vérificateur d\'arnaque',
    description: 'Vérifiez la fiabilité d\'un message ou d\'une offre suspecte.',
    link: '/verifier',
    icon: '🔍',
  },
  {
    title: 'Témoignages de victimes',
    description: 'Des histoires vraies pour mieux comprendre les arnaques.',
    link: '/temoignages',
    icon: '💬',
  },
  {
    title: 'Alertes en temps réel',
    description: 'Restez informé des nouvelles arnaques repérées.',
    link: '/alertes',
    icon: '⚠️',
  },
];

export const metadata: Metadata = {
  title: 'Soutien & Assistance - Anti Pepins',
  description: 'Besoin d\'aide immédiate ? Notre équipe intervient 48h/24 pour vous aider à faire face aux arnaques en cours.',
};

export default function SupportPage() {
  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Assistance anti pepins
            </h1>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Vous êtes en train de vous faire arnaquer ? Notre collectif d&apos;intervention rapide est là pour vous aider immédiatement.
              Nous intervenons du lundi au vendredi de 9h00 à 18h00 pour stopper les escrocs et vous protéger.
            </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LinkButton href="/report" variant="primary" size="lg">
                  Signaler une arnaque
                </LinkButton>
                <LinkButton href="/contact" variant="outline" size="lg">
                  Échanger avec un membre
                </LinkButton>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-200  -full blur-xl opacity-20"></div>
                  <Image src="/logo.png" alt="Logo Anti Pepins" width={200} height={200} className="mb-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
      <SectionHeader
        title="Que faire en cas d'arnaque en cours ?"
        subtitle="Suivez ces étapes cruciales pour vous protéger et limiter les dégâts"
      />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencySteps.map((step) => (
              <div key={step.step} className="bg-slate-50  -xl p-6 border border-slate-200 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100  -full flex items-center justify-center text-emerald-600 font-bold text-lg">
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

      <section className="py-16 bg-slate-50">
      <SectionHeader
        title="Nos services d'assistance"
        subtitle="Une équipe spécialisée pour chaque type de situation"
      />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {supportServices.map((service) => (
              <div key={service.id} className={` -xl p-8 border-2 ${service.borderColor} ${service.bgColor} hover:shadow-xl transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-4xl ${service.color}`}>{service.icon}</div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-600">{service.availability}</div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-700 mb-6 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">

      <SectionHeader
        title="Ressources utiles"
        subtitle="Des outils et guides pour renforcer votre protection"
      />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map((resource) => (
              <div key={resource.title} className="bg-white  -xl p-6 border border-slate-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-100  -full flex items-center justify-center text-2xl">
                    {resource.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{resource.title}</h3>
                    <p className="text-sm text-slate-600">{resource.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Besoin d&apos;aide immédiate ?
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Notre collectif est prêt à intervenir dès maintenant. Plus vous agissez rapidement,
            plus nous avons de chances de stopper les escrocs et de limiter les dégâts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/report" variant="secondary" size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
              🚨 Signaler une arnaque en cours
            </LinkButton>
            <LinkButton href="/contact" variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-emerald-600">
              Échanger avec un membre
            </LinkButton>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
