import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité",
  description: "Déclaration d'accessibilité RGAA 4.1 d'Anti-Pépins. État de conformité partielle et voies de recours.",
};

export default function AccessibilitePage(): React.JSX.Element {
  return (
    <MainLayout>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Déclaration d&rsquo;accessibilité</h1>
        <p className="text-slate-500 text-sm mb-10">Établie le 5 avril 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">État de conformité</h2>
          <p className="text-slate-600 leading-relaxed">
            L&rsquo;association <strong>Biscuits IA</strong>, éditrice d&rsquo;Anti-Pépins
            (<a href="https://anti-pepins.biscuits-ia.com" className="text-emerald-600 hover:underline">anti-pepins.biscuits-ia.com</a>),
            s&rsquo;engage à rendre son site accessible conformément à l&rsquo;article 47 de la loi n°2005-102 du 11 février 2005.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            À ce jour, le site est en <strong>conformité partielle</strong> avec le référentiel
            général d&rsquo;amélioration de l&rsquo;accessibilité (RGAA 4.1).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Points de conformité</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Hiérarchie des titres (h1/h2/h3) respectée sur toutes les pages</li>
            <li>Attributs <code className="bg-slate-100 px-1 rounded text-xs font-mono">aria-label</code>, <code className="bg-slate-100 px-1 rounded text-xs font-mono">aria-hidden</code> et landmarks sémantiques utilisés</li>
            <li>Langue de la page déclarée (<code className="bg-slate-100 px-1 rounded text-xs font-mono">lang=&quot;fr&quot;</code>)</li>
            <li>Navigation clavier fonctionnelle sur les formulaires</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Non-conformités en cours</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Audit RGAA complet des pages interactives (analyse, FAQ) non encore réalisé</li>
            <li>Widget de chat non audité</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Voies de recours</h2>
          <p className="text-slate-600 leading-relaxed">
            Si vous n&rsquo;arrivez pas à accéder à un contenu, contactez-nous :{" "}
            <a href="mailto:contact@biscuits-ia.com" className="text-emerald-600 hover:underline">
              contact@biscuits-ia.com
            </a>
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            En l&rsquo;absence de réponse, vous pouvez saisir le{" "}
            <strong>Défenseur des droits</strong> :{" "}
            <a
              href="https://formulaire.defenseurdesdroits.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              formulaire.defenseurdesdroits.fr
            </a>
          </p>
        </section>
      </main>
    </MainLayout>
  );
}
