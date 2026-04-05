'use client';

import React from 'react';
import { Section, CallToAction, FAQItem, SearchBar } from '@/components/ui';
import { Header } from '@/components/layout';

interface FaqEntry {
  readonly question: string;
  readonly answer: React.ReactNode;
}

interface FaqCategory {
  readonly category: string;
  readonly items: readonly FaqEntry[];
}

const FAQ_DATA: readonly FaqCategory[] = [
  {
    category: 'Signalements',
    items: [
      {
        question: 'Comment signaler une arnaque ?',
        answer: (
          <>
            <p className="mb-2">
              Rendez-vous sur la page{' '}
              <a href="/report" className="text-emerald-600 hover:underline">Signalement</a>{' '}
              et remplissez le formulaire avec&nbsp;:
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li>Un titre descriptif</li>
              <li>Une description détaillée</li>
              <li>Des preuves (captures d&#39;écran, emails, etc.)</li>
            </ul>
            <p>Votre signalement sera traité sous 48h par notre équipe de modération.</p>
          </>
        ),
      },
      {
        question: 'Mes données sont-elles sécurisées ?',
        answer: (
          <>
            <p className="mb-2">Oui, nous respectons le RGPD et chiffrons toutes les données sensibles.</p>
            <p>
              Consultez notre{' '}
              <a href="/rgpd" className="text-emerald-600 hover:underline">politique de confidentialité</a>{' '}
              pour plus d&#39;informations.
            </p>
          </>
        ),
      },
      {
        question: 'Comment devenir modérateur ?',
        answer: (
          <>
            <p className="mb-2">
              Envoyez un email à{' '}
              <a href="mailto:contact@biscuits-ia.com" className="text-emerald-600 hover:underline">
                contact@biscuits-ia.com
              </a>{' '}
              avec&nbsp;:
       </p>
            <ul className="list-disc pl-6 mb-2">
              <li>Votre expérience en modération</li>
              <li>Votre motivation</li>
              <li>Votre disponibilité</li>
            </ul>
            <p>Une formation vous sera proposée avant de commencer.</p>
          </>
        ),
      },
      {
        question: 'Comment signaler un problème sur la plateforme ?',
        answer: (
          <p>
            Utilisez le bouton en bas de page ou envoyez un email à{' '}
              <a href="mailto:contact@biscuits-ia.com" className="text-emerald-600 hover:underline">
              contact@biscuits-ia.com
            </a>.
          </p>
        ),
      },
    ],
  },
  {
    category: 'Légal',
    items: [
      {
        question: 'Un signalement peut-il servir en justice ?',
        answer: (
          <p>
            Les signalements publiés sur Anti-Pépins sont des informations publiques destinées
            à informer. Ils ne constituent pas des preuves juridiques. Pour une procédure
            judiciaire, il faut obtenir des preuves officielles (plainte, constats d&#39;huissier, etc.).
          </p>
        ),
      },
      {
        question: 'Qui est responsable des signalements ?',
        answer: (
          <p>
            L&apos;association Biscuits IA est responsable de la plateforme. Les signalements
            sont publiés sous la responsabilité de leurs auteurs, après modération.
          </p>
        ),
      },
      {
        question: 'Comment signaler un contenu illégal ?',
        answer: (
          <>
            <p className="mb-2">
              Contactez-nous immédiatement à&nbsp;
              <a href="mailto:contact@biscuits-ia.com" className="text-emerald-600 hover:underline">
                contact@biscuits-ia.com
              </a>.
            </p>
            <p>
              Nous retirerons le contenu dans les 24h et le signalerons aux autorités
              compétentes si nécessaire.
            </p>
          </>
        ),
      },
    ],
  },
] as const;

export default function FAQClient(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredData = React.useMemo(
    () =>
      FAQ_DATA.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })),
    [searchTerm]
  );

  return (

    <div className="min-h-screen flex flex-col bg-white">
      <Header />
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl text-center font-bold mb-6">Foire Aux Questions</h1>
       <p className="mb-8 text-center text-slate-600">
         Trouvez des réponses aux questions fréquentes sur le fonctionnement d&apos;Anti-Pépins.
         Si vous ne trouvez pas votre réponse, n&apos;hésitez pas à nous contacter.
       </p>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Rechercher dans la FAQ..."
      />

      {filteredData.map((category) => (
        <Section key={category.category} title={category.category} className="mb-12">
          {category.items.length > 0 ? (
            <div className="space-y-2">
              {category.items.map((item) => (
                <FAQItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Aucun résultat pour cette catégorie.</p>
          )}
        </Section>
      ))}

      <CallToAction
        href="mailto:contact@biscuits-ia.com"
        text="Poser une question non répertoriée"
      />

      <p className="text-sm text-slate-500 mt-8">Dernière mise à jour&nbsp;: 31 mars 2026</p>
    </main>
  </div>
  );
}
