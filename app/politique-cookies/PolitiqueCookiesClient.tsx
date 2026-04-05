'use client';

import { MainLayout } from "@/components/layout";

export default function PolitiqueCookiesClient(): React.JSX.Element {
  return (
    <MainLayout>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de cookies</h1>
        <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : 5 avril 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Qu&rsquo;est-ce qu&rsquo;un cookie&nbsp;?</h2>
          <p className="text-slate-600 leading-relaxed">
            Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d&rsquo;un site web.
            Il permet au site de mémoriser des informations sur votre navigation.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Cookies utilisés sur Anti-Pépins</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm text-slate-600">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Nom</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Finalité</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">cookie-consent</td>
                  <td className="px-4 py-3">Nécessaire</td>
                  <td className="px-4 py-3">Mémorise votre choix de consentement aux cookies</td>
                  <td className="px-4 py-3">13 mois</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">Vercel Analytics</td>
                  <td className="px-4 py-3">Analytique (sans cookie)</td>
                  <td className="px-4 py-3">Mesure d&rsquo;audience anonymisée — aucune donnée personnelle</td>
                  <td className="px-4 py-3">Aucun cookie déposé</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Cookies strictement nécessaires</h2>
          <p className="text-slate-600 leading-relaxed">
            Le cookie <code className="bg-slate-100 px-1 rounded text-xs font-mono">cookie-consent</code> est
            strictement nécessaire. Il est exempté de consentement (CNIL délibération n°2020-091).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Vercel Analytics</h2>
          <p className="text-slate-600 leading-relaxed">
            Vercel Analytics ne dépose <strong>aucun cookie</strong> et ne collecte aucune donnée personnelle identifiable.
            Exempté de consentement (CNIL).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Gérer vos préférences</h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Réinitialisez vos préférences cookies pour que la bannière réapparaisse lors de votre prochaine visite.
          </p>
          <button
            type="button"
            onClick={() => { localStorage.removeItem("cookie-consent"); window.location.reload(); }}
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Réinitialiser mes préférences
          </button>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">6. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question :{" "}
            <a href="mailto:contact@biscuits-ia.com" className="text-emerald-600 hover:underline">
              contact@biscuits-ia.com
            </a>
          </p>
        </section>
      </main>
    </MainLayout>
  );
}
