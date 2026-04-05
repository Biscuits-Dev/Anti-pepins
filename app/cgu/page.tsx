import type { Metadata } from 'next';
import { MainLayout, SectionHeader } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Conditions Générales d&apos;Utilisation - Anti Pepins',
  description: 'Conditions générales d&apos;utilisation du site Anti Pepins.',
};

export default function CGUPage() {
  return (
    <MainLayout>
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Conditions Générales d&apos;Utilisation"
            subtitle="Les présentes conditions régissent l&apos;utilisation du site Anti Pepins"
          />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Objet</h2>
            <p className="text-slate-700">
              Les présentes conditions générales d&apos;utilisation (ci-après &laquo; CGU &raquo;) ont pour objet de définir les modalités et conditions d&apos;utilisation du site Anti Pepins (ci-après &laquo; le Site &raquo;), ainsi que les droits et obligations des utilisateurs.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Acceptation des conditions</h2>
            <p className="text-slate-700">
              L&apos;accès et l&apos;utilisation du Site impliquent l&apos;acceptation pleine et entière des présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous devez vous abstenir d&apos;utiliser le Site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Description du service</h2>
            <p className="text-slate-700">
              Anti Pepins est une plateforme communautaire permettant aux utilisateurs de :
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
              <li>Signaler des arnaques et tentatives de fraude</li>
              <li>Analyser des messages suspects</li>
              <li>Consulter une base de données d&apos;arnaques répertoriées</li>
              <li>Accéder à des ressources éducatives sur la sécurité en ligne</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Création de compte</h2>
            <p className="text-slate-700">
              Certaines fonctionnalités du Site peuvent nécessiter la création d&apos;un compte utilisateur. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à les maintenir à jour. Il est responsable de la confidentialité de ses identifiants de connexion.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contenu des utilisateurs</h2>
            <p className="text-slate-700">
              Les utilisateurs sont responsables du contenu qu&apos;ils publient sur le Site. Ils s&apos;engagent à :
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
              <li>Ne pas publier de contenu illicite, diffamatoire ou injurieux</li>
              <li>Ne pas publier de données personnelles de tiers sans leur consentement</li>
              <li>Respecter les droits de propriété intellectuelle</li>
              <li>Fournir des informations véridiques lors des signalements</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Modération</h2>
            <p className="text-slate-700">
              L&apos;équipe de modération d&apos;Anti Pepins se réserve le droit de supprimer ou de modifier tout contenu qui ne respecterait pas les présentes CGU, sans préavis. Les signalements approuvés peuvent être rendus publics de manière anonymisée.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Propriété intellectuelle</h2>
            <p className="text-slate-700">
              Le contenu du Site (textes, images, code source, design) est la propriété de l&apos;association Biscuits IA ou est utilisé avec autorisation. Le code source est disponible sous licence open-source sur GitHub.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Responsabilité</h2>
            <p className="text-slate-700">
              Anti Pepins s&apos;efforce de fournir des informations fiables, mais ne saurait être tenu responsable des erreurs ou omissions. Les signalements sont publiés à titre informatif et ne constituent pas une preuve juridique.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Données personnelles</h2>
            <p className="text-slate-700">
              Le traitement des données personnelles est effectué conformément à notre politique de confidentialité et au RGPD. Pour plus d&apos;informations, consultez notre page{' '}
              <a href="/rgpd" className="text-emerald-600 hover:underline">
                Politique de confidentialité
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Modification des CGU</h2>
            <p className="text-slate-700">
              Anti Pepins se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications importantes par tout moyen approprié.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Droit applicable</h2>
            <p className="text-slate-700">
              Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social de l&apos;association Biscuits IA.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact</h2>
            <p className="text-slate-700">
              Pour toute question relative aux CGU, vous pouvez nous contacter à l&apos;adresse :{' '}
              <a href="mailto:contact@biscuits-ia.com" className="text-emerald-600 hover:underline">
                contact@biscuits-ia.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
