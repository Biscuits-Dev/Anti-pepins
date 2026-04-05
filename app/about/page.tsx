import type { Metadata } from 'next';
import { MainLayout, SectionHeader } from '@/components/layout';
import { LinkButton } from '@/components/ui';

interface Value {
  readonly title: string;
  readonly description: string;
}

const VALUES: readonly Value[] = [
  { title: 'Transparence', description: 'Nous croyons en une information claire et accessible pour tous.' },
  { title: 'Solidarité',   description: "Chaque signalement contribue à protéger d'autres personnes." },
  { title: 'Expertise',    description: 'Notre équipe combine expérience professionnelle et passion.' },
  { title: 'Indépendance', description: 'Nous ne recevons aucun financement extérieur.' },
] as const;

export const metadata: Metadata = {
  title:       'À propos - Anti Pepins',
  description: 'Une équipe passionnée qui lutte contre les arnaques en ligne pour protéger chaque membre de notre communauté.',
};


function ValuesGrid(): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {VALUES.map((value) => (
        <div key={value.title} className="flex gap-4 items-start">
          <span className="text-2xl leading-none select-none" aria-hidden="true">✨</span>
          <div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">{value.title}</h3>
            <p className="text-slate-600">{value.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage(): React.JSX.Element {
  return (
    <MainLayout>

      <section className="bg-slate-50 py-16" aria-labelledby="about-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 id="about-heading" className="text-4xl font-bold text-slate-900 mb-4">
              À propos d&apos;Anti Pepins
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Une équipe passionnée qui lutte contre les arnaques en ligne.
            </p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <p className="text-lg text-slate-600 leading-relaxed">
            Anti Pepins a été créé avec une mission simple mais essentielle&nbsp;: protéger les
            internautes des arnaques en ligne. Face à l&apos;augmentation exponentielle des fraudes
            numériques, nous avons décidé d&apos;agir en mettant en place une plateforme
            collaborative où chacun peut signaler, consulter et se protéger des arnaques.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mt-4">
            Nous croyons fermement que la meilleure arme contre les arnaqueurs est
            l&apos;information partagée. Plus nous serons nombreux à signaler et à partager nos
            expériences, plus nous serons efficaces.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mt-4">
            Ce collectif est une initiative de l&apos;association Biscuits IA.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-50" aria-labelledby="values-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            id="values-heading"
            title="Nos valeurs"
            subtitle="Les principes qui guident nos actions"
          />
          <ValuesGrid />
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white" aria-labelledby="opensource-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 id="opensource-heading" className="text-2xl font-bold mb-4">
              Projet open source
            </h2>
            <p className="text-slate-300 mb-8">
              Anti Pepins est un projet open source développé par la communauté pour la
              communauté. Tout le code est disponible publiquement, garantissant transparence
              et sécurité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton
                href="https://github.com/Biscuits-Dev/Anti-pepins"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-slate-900"
              >
                <span aria-hidden="true">🐙</span>
                {' '}Voir le code source
              </LinkButton>
              <LinkButton
                href="/contribuer"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-slate-900"
              >
                Contribuer
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

    </MainLayout>
  );
}