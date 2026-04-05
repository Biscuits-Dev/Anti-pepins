import type { Metadata } from 'next';
import { MainLayout, SectionHeader } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Mentions légales - Anti Pepins',
  description: "Mentions légales du site Anti Pepins, une initiative de l'association Biscuits IA.",
};

export default function MentionsLegalesPage() {
  return (
    <MainLayout>
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Mentions légales"
            subtitle="Informations légales relatives au site Anti Pepins"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Éditeur du site</h2>
            <p className="text-slate-700">
              Le site <strong>Anti Pepins</strong> est édité par l&apos;association{' '}
              <a href="https://biscuits-ia.com" className="text-emerald-600 hover:underline">
                Biscuits IA
              </a>. Association loi 1901 à but non lucratif.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Siège social</h2>
            <p className="text-slate-700">
              <a href="https://biscuits-ia.com/legal/mentions-legales" className="text-emerald-600 hover:underline">
                Association Biscuits IA
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
            <p className="text-slate-700">
              Pour toute question relative au site, vous pouvez nous contacter à l&apos;adresse suivante :{' '}
              <a href="mailto:contact@biscuits-ia.com" className="text-emerald-600 hover:underline">
                contact@biscuits-ia.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Directeur de la publication</h2>
            <p className="text-slate-700">
              Le directeur de la publication est le président de l&apos;association Biscuits IA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Hébergement</h2>
            <p className="text-slate-700">
              Le site est hébergé par :<br />
              [Vercel Inc.]<br />
              [340 S Lemon Ave, Walnut, CA 91789, USA]<br />
              <a href="https://vercel.com/" className="text-emerald-600 hover:underline">
                https://vercel.com/
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Propriété intellectuelle</h2>
            <p className="text-slate-700">
              L&apos;ensemble des contenus présents sur ce site (textes, images, logos, icônes, code source)
              sont la propriété exclusive de l&apos;association Biscuits IA ou sont utilisés avec l&apos;autorisation
              de leurs propriétaires. Toute reproduction, représentation ou utilisation, même partielle,
              est strictement interdite sans autorisation préalable.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Code source open-source</h2>
            <p className="text-slate-700">
              Le code source du projet Anti Pepins est disponible sur{' '}
              <a
                href="https://github.com/Biscuits-Dev/Anti-pepins"
                className="text-emerald-600 hover:underline"
              >
                GitHub
              </a>{' '}
              sous licence open-source.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation de responsabilité</h2>
            <p className="text-slate-700">
              Anti Pepins s&apos;efforce de fournir des informations fiable et à jour. Toutefois,
              l&apos;association ne saurait être tenue responsable des erreurs ou omissions dans les
              informations diffusées sur le site. Les signalements effectués par les utilisateurs
              sont publiés à titre informatif et ne constituent pas une preuve juridique.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
