import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout, SectionHeader, StatsSection } from '@/components/layout';
import { LinkButton } from '@/components/ui';

export const metadata: Metadata = {
  title:       'Anti-Pépins — Collectif contre les arnaques',
  description: 'Rejoignez notre collectif pour lutter ensemble contre les arnaques en ligne. Partagez, apprenez et protégez-vous avec notre communauté solidaire.',
  openGraph: {
    title:       'Anti-Pépins — Collectif contre les arnaques',
    description: 'Signalez et analysez les arnaques en ligne grâce à nos outils gratuits et intelligents.',
    type:        'website',
  },
};

const FEATURES = [
  {
    icon:        '🚨',
    title:       'Signalement rapide',
    description: 'Partagez votre expérience en quelques clics seulement. Votre témoignage contribue à protéger toute la communauté.',
  },
  {
    icon:        '📚',
    title:       'Base de connaissances',
    description: 'Consultez nos guides et articles pour en savoir plus sur les arnaques courantes et comment vous en protéger.',
  },
  {
    icon:        '🔍',
    title:       'Analyseur de messages',
    description: 'Analysez un message suspect grâce à notre outil intelligent qui détecte les signes d\'arnaque.',
  },
  {
    icon:        '📖',
    title:       'Guides et conseils',
    description: 'Des guides complets et des conseils pratiques pour reconnaître et éviter les arnaques les plus courantes.',
  },
] as const;

const HOW_STEPS = [
  { num: '01', icon: '📝', title: 'Signalez',   body: 'Décrivez l\'arnaque en quelques minutes via notre formulaire sécurisé.'       },
  { num: '02', icon: '🔍', title: 'On analyse', body: 'Nous analysons et traitons chaque signalement reçu.'                      },
  { num: '03', icon: '📢', title: 'On protège', body: 'Les données aident à améliorer nos outils de détection pour protéger les autres.' },
] as const;

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Marie',
    city: 'Lyon',
    scamType: 'Phishing',
    content: "J'ai reçu un email qui semblait provenir de ma banque. J'ai failli donner mes identifiants, mais j'ai vérifié l'URL à temps. Signalez ces tentatives pour protéger les autres !",
    avatar: '👩',
  },
  {
    id: 2,
    name: 'Jean-Pierre',
    city: 'Bordeaux',
    scamType: 'Arnaque sentimentale',
    content: "Après des semaines de conversation sur un site de rencontre, on m'a demandé de l'argent pour un billet d'avion. Ma fille m'a mis en garde avant que je ne tombe dans le piège.",
    avatar: '👨',
  },
  {
    id: 3,
    name: 'Sophie',
    city: 'Paris',
    scamType: 'Faux site e-commerce',
    content: "Des chaussures à -70% sur un site qui semblait professionnel. J'ai payé 120€ et je n'ai jamais rien reçu. Depuis, je vérifie toujours les avis avant d'acheter.",
    avatar: '👩‍🦰',
  },
] as const;

interface TestimonialCardProps {
  readonly name: string;
  readonly city: string;
  readonly scamType: string;
  readonly content: string;
  readonly avatar: string;
}

function TestimonialCard({ name, city, scamType, content, avatar }: TestimonialCardProps): React.JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl" aria-hidden="true">{avatar}</span>
        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{city}</p>
        </div>
      </div>
      <span className="inline-block px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full mb-3">
        {scamType}
      </span>
      <p className="text-slate-600 leading-relaxed italic">&ldquo;{content}&rdquo;</p>
    </div>
  );
}

interface StepCardProps {
  readonly num:   string;
  readonly icon:  string;
  readonly title: string;
  readonly body:  string;
}

function StepCard({ num, icon, title, body }: StepCardProps): React.JSX.Element {
  return (
    <div className="relative flex flex-col items-start gap-4 p-6 bg-white  -2xl border border-slate-100 shadow-sm">
      <span className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-600 text-white text-xs font-bold  -full flex items-center justify-center shadow">
        {num}
      </span>
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function HomePage(): React.JSX.Element {
  return (
    <MainLayout>

      <section className="bg-slate-50 py-16 lg:py-24" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 id="hero-heading" className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Ensemble contre les arnaques
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Notre collectif vous accompagne pour lutter contre les arnaques en ligne.
                Partagez vos expériences, apprenez des autres et protégez-vous ensemble
                grâce à notre communauté solidaire. Une initiative de l&apos;association Biscuits IA.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LinkButton href="/blog" variant="primary" size="lg">
                  Vous informer sur les arnaques
                </LinkButton>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Anti-Pépins logo"
                width={250}
                height={250}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <StatsSection
        stats={[
          { value: '100 %',    label: 'Anonyme' },
          { value: '100 %',   label: 'Gratuit' },
          { value: 'IA',      label: 'Analyse intelligente' },
          { value: 'Open Source', label: 'Projet communautaire' },
        ]}
      />

      <div className="mt-3" />
      <SectionHeader
        title="Nos fonctionnalités principales" 
        subtitle="Des outils simples et efficaces pour vous protéger et protéger les autres"
      />
      <section className="pb-16 bg-white" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Fonctionnalités</h2>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-50  -xl p-8 hover:shadow-md hover:border-emerald-100 transition-all border border-slate-200"
              >
                <div className="text-4xl mb-4" aria-hidden="true">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="how-heading" className="text-3xl font-bold text-slate-900 mb-3">
              Comment ça marche ?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Un processus simple et transparent pour que chaque signalement compte vraiment.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_STEPS.map((step) => (
              <StepCard key={step.num} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="text-3xl font-bold text-slate-900 mb-3">
              Ils ont partagé leur expérience
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Ces témoignages aident des milliers de personnes à reconnaître les arnaques.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.id} {...t} />
            ))}
          </div>
          <div className="text-center">
            <LinkButton href="/temoignage" variant="outline" size="lg">
              Voir tous les témoignages
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white" aria-labelledby="oss-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 id="oss-heading" className="text-3xl font-bold text-slate-900 mb-4">
                Projet open source
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Anti-Pépins est un projet open source développé par notre collectif pour le bien commun.
                Votre engagement peut faire la différence.
              </p>
              <a
                href="https://github.com/biscuits-ia/anti-pepins"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3  -xl hover:bg-slate-700 transition-colors"
              >
                <span aria-hidden="true">Contribuer sur GitHub</span> 
              </a>
            </div>
            <div className="bg-slate-900  -2xl p-8 font-mono text-sm text-slate-300 overflow-x-auto">
              <div className="flex gap-2 mb-4" aria-hidden="true">
                <div className="w-3 h-3  -full bg-rose-500" />
                <div className="w-3 h-3  -full bg-amber-500" />
                <div className="w-3 h-3  -full bg-emerald-500" />
              </div>
              <pre className="whitespace-pre-wrap">{`const reportScam = async (scamData) => {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scamData),
  });
  return response.json();
};`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-emerald-600" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-3xl font-bold text-white mb-4">
            Vous avez été victime ou témoin d&apos;une arnaque&nbsp;?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
            Votre témoignage peut sauver quelqu&apos;un d&apos;autre.
            Partagez votre expérience en moins de 5 minutes.
          </p>
          <Link
            href="/report"
            className="inline-flex items-center justify-center gap-1   font-medium transition-colors bg-emerald-500 text-white hover:bg-emerald-700 border-[3px] border-slate-900 shadow-[4px_4px_0_0_#171717] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wide px-6 py-3 text-lg"
          >
            Signaler une arnaque
          </Link>
        </div>
      </section>

    </MainLayout>
  );
}