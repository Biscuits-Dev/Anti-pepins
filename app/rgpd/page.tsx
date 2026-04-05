import type { Metadata } from 'next';
import { MainLayout, SectionHeader } from '@/components/layout';

export const metadata: Metadata = {
  title:       'Politique de Confidentialité - Anti Pepins',
  description: 'Découvrez comment Anti Pepins protège vos données conformément au RGPD.',
};

const CONTACT_EMAIL = 'contact@biscuits-ia.com' as const;
const LAST_UPDATED = '4 avril 2026';

const EMAIL_RGPD_TEMPLATE = [
  "Objet : Exercice de mon droit [d'accès / de rectification / d'effacement / à la portabilité / d'opposition / de limitation]",
  '',
  'Bonjour,',
  '',
  "Je souhaite exercer mon droit [préciser le droit] concernant mes données personnelles sur la plateforme Anti Pepins.",
  '',
  'Informations permettant de m\'identifier :',
  '- Nom / Prénom : [Votre nom]',
  '- Adresse email utilisée : [Votre email]',
  '',
  'Merci de traiter ma demande dans le délai légal d\'un mois.',
  '',
  'Cordialement,',
  '[Votre nom]',
  '[Date]',
].join('\n');

function RgpdSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Ul({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <ul className="list-disc pl-6 text-slate-700 space-y-1">
      {children}
    </ul>
  );
}

function P({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return <p className="text-slate-700 mb-2">{children}</p>;
}

export default function RGPDPage(): React.JSX.Element {
  return (
    <MainLayout>
      <section className="bg-slate-50 py-16" aria-labelledby="rgpd-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            id="rgpd-heading"
            title="Politique de Confidentialité"
            subtitle="Comment Anti Pepins protège vos données conformément au RGPD et à la loi Informatique et Libertés" />
        </div>
      </section>

      <section className="py-16" aria-label="Contenu de la politique de confidentialité">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Introduction */}
          <div>
            <P>
              La présente politique de confidentialité décrit comment vos données personnelles
              sont collectées, utilisées et protégées lorsque vous utilisez la plateforme Anti Pepins,
              conformément au{' '}
              <strong>Règlement Général sur la Protection des Données (UE) 2016/679 (RGPD)</strong>
              {' '}et à la{' '}
              <strong>loi n° 78-17 du 6 janvier 1978 relative à l&apos;informatique, aux fichiers et aux libertés</strong>
              {' '}(modifiée).
            </P>
            <P>
              Anti Pepins est une initiative open-source de l&apos;association{' '}
              <a href="https://biscuits-ia.com"
                className="text-emerald-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Biscuits IA
              </a>.
            </P>
          </div>

          {/* 1. Responsable de traitement */}
          <RgpdSection title="1. Responsable du traitement">
            <P>Le responsable du traitement des données est :</P>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700">
              <p><strong>Association Biscuits IA</strong></p>
              <p>Association loi 1901</p>
              <p>Email : <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 hover:underline">{CONTACT_EMAIL}</a></p>
              <p>Site : <a href="https://biscuits-ia.com" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">biscuits-ia.com</a></p>
            </div>
            <p className="text-slate-700 mt-2">
              Pour toute question relative à la protection de vos données, vous pouvez contacter
              notre référent protection des données à l&apos;adresse{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </RgpdSection>

          {/* 2. Données collectées */}
          <RgpdSection title="2. Données personnelles collectées">
            <P>Nous collectons les catégories de données suivantes :</P>
            <Ul>
              <li><strong>Signalements</strong> : titre, description, type d&apos;arnaque, date de l&apos;incident, montant perdu (optionnel), preuves fournies. Si publiés, les signalements sont anonymisés.</li>
              <li><strong>Données de contact</strong> (optionnel) : adresse email, si vous souhaitez un suivi de votre signalement.</li>
              <li><strong>Formulaire de contact</strong> : nom, email, sujet et message.</li>
              <li><strong>Données techniques</strong> : adresse IP (pour la prévention des abus), user-agent du navigateur.</li>
              <li><strong>Logs de modération</strong> : actions effectuées par les modérateurs sur les signalements.</li>
              <li><strong>Chat d&apos;assistance</strong> : messages échangés avec les bénévoles via le widget de chat.</li>
            </Ul>
          </RgpdSection>

          {/* 3. Bases légales et finalités */}
          <RgpdSection title="3. Bases légales et finalités du traitement">
            <P>
              Conformément à l&apos;article 6 du RGPD, chaque traitement repose sur une base légale :
            </P>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Finalité</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Base légale (Art. 6 RGPD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Traitement et modération des signalements</td>
                    <td className="px-4 py-3">Intérêt légitime (lutte contre les arnaques, protection du public)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Réponse aux demandes via le formulaire de contact</td>
                    <td className="px-4 py-3">Consentement (soumission volontaire du formulaire)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Suivi personnalisé d&apos;un signalement par email</td>
                    <td className="px-4 py-3">Consentement (fourniture volontaire de l&apos;email)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Prévention des abus (rate limiting, IP)</td>
                    <td className="px-4 py-3">Intérêt légitime (sécurité de la plateforme)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Chat d&apos;assistance avec les bénévoles</td>
                    <td className="px-4 py-3">Consentement (initiation volontaire de la conversation)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Mesure d&apos;audience anonymisée</td>
                    <td className="px-4 py-3">Intérêt légitime (amélioration du service) — sans cookie, sans donnée personnelle</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </RgpdSection>

          {/* 4. Destinataires */}
          <RgpdSection title="4. Destinataires des données">
            <P>Vos données sont accessibles aux catégories suivantes :</P>
            <Ul>
              <li><strong>L&apos;équipe de modération bénévole</strong> : pour évaluer et traiter les signalements.</li>
              <li><strong>Le public</strong> : uniquement les signalements approuvés, après anonymisation.</li>
            </Ul>
            <P>
              Nous ne vendons, ne louons et ne partageons <strong>aucune donnée personnelle</strong> avec
              des tiers à des fins commerciales ou publicitaires.
            </P>
          </RgpdSection>

          {/* 5. Transferts hors UE */}
          <RgpdSection title="5. Transferts de données hors Union Européenne">
            <P>
              La plateforme Anti Pepins utilise les services techniques suivants, qui peuvent
              impliquer un transfert de données en dehors de l&apos;Espace Économique Européen (EEE) :
            </P>
            <Ul>
              <li>
                <strong>Supabase</strong> (hébergement base de données, authentification) —
                serveurs pouvant être situés aux États-Unis. Les transferts sont encadrés par les{' '}
                <strong>clauses contractuelles types (CCT)</strong> de la Commission Européenne.
              </li>
              <li>
                <strong>Vercel</strong> (hébergement du site) —
                réseau mondial de serveurs (CDN). Les transferts sont encadrés par les CCT
                et le <strong>Data Processing Addendum</strong> de Vercel.
              </li>
            </Ul>
            <P>
              Aucun autre transfert de données vers des pays tiers n&apos;est effectué.
              Si cette situation venait à changer, la présente politique serait mise à jour.
            </P>
          </RgpdSection>

          {/* 6. Durée de conservation */}
          <RgpdSection title="6. Durée de conservation">
            <P>Les données sont conservées selon les règles suivantes :</P>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Données</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Durée</th>
                    <th className="text-left px-4 py-3 font-semibold border-b border-slate-200">Justification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Signalements approuvés (anonymisés)</td>
                    <td className="px-4 py-3">5 ans, renouvelable</td>
                    <td className="px-4 py-3">Intérêt public (prévention des arnaques récurrentes)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Signalements rejetés</td>
                    <td className="px-4 py-3">6 mois</td>
                    <td className="px-4 py-3">Gestion des recours éventuels</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Données de contact (email)</td>
                    <td className="px-4 py-3">12 mois après la clôture du dossier</td>
                    <td className="px-4 py-3">Suivi et réponse aux demandes</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Messages du formulaire de contact</td>
                    <td className="px-4 py-3">12 mois après la réponse</td>
                    <td className="px-4 py-3">Gestion de la relation</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Messages du chat</td>
                    <td className="px-4 py-3">6 mois</td>
                    <td className="px-4 py-3">Amélioration du service d&apos;assistance</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">Adresses IP</td>
                    <td className="px-4 py-3">12 mois</td>
                    <td className="px-4 py-3">Traçabilité anti-abus (obligation légale LCEN)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Logs de modération</td>
                    <td className="px-4 py-3">12 mois</td>
                    <td className="px-4 py-3">Audit et traçabilité</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              Au-delà de ces durées, les données sont supprimées ou anonymisées de manière irréversible.
            </p>
          </RgpdSection>

          {/* 7. Droits */}
          <RgpdSection title="7. Vos droits">
            <P>
              Conformément aux articles 15 à 22 du RGPD et aux articles 49 à 56 de la loi
              Informatique et Libertés, vous disposez des droits suivants :
            </P>
            <Ul>
              <li><strong>Droit d&apos;accès</strong> (Art. 15 RGPD) : obtenir la confirmation que des données vous concernant sont traitées et en recevoir une copie.</li>
              <li><strong>Droit de rectification</strong> (Art. 16 RGPD) : corriger des données inexactes ou incomplètes.</li>
              <li><strong>Droit à l&apos;effacement</strong> (Art. 17 RGPD) : demander la suppression de vos données, sous réserve des obligations légales de conservation.</li>
              <li><strong>Droit à la limitation du traitement</strong> (Art. 18 RGPD) : obtenir la limitation du traitement dans certains cas.</li>
              <li><strong>Droit d&apos;opposition</strong> (Art. 21 RGPD) : vous opposer au traitement fondé sur l&apos;intérêt légitime, pour des raisons tenant à votre situation particulière.</li>
              <li><strong>Droit à la portabilité</strong> (Art. 20 RGPD) : recevoir vos données dans un format structuré, couramment utilisé et lisible par machine.</li>
              <li><strong>Droit de retirer votre consentement</strong> à tout moment, sans que cela ne remette en cause la licéité du traitement effectué avant le retrait.</li>
            </Ul>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                Directives post-mortem (Art. 85 loi Informatique et Libertés)
              </h3>
              <p className="text-slate-700 text-sm">
                Vous pouvez définir des directives relatives à la conservation, à l&apos;effacement
                et à la communication de vos données après votre décès. Ces directives peuvent être
                enregistrées auprès d&apos;un tiers de confiance certifié par la CNIL, ou directement
                auprès de nous à l&apos;adresse{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 hover:underline">{CONTACT_EMAIL}</a>.
              </p>
            </div>

            <P>
              Pour exercer vos droits, contactez-nous à{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-emerald-600 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>.
              Nous répondrons dans un délai maximum d&apos;<strong>un mois</strong> à compter de la
              réception de votre demande (Art. 12.3 RGPD). Ce délai peut être prolongé de deux mois
              en cas de demande complexe, auquel cas vous en serez informé.
            </P>
            <P>
              Une pièce d&apos;identité pourra vous être demandée en cas de doute raisonnable
              sur votre identité (Art. 12.6 RGPD).
            </P>

            <div className="bg-slate-100 p-4 rounded-lg mt-4">
              <h3 className="font-semibold mb-2 text-slate-900">
                Modèle d&apos;email pour exercer vos droits :
              </h3>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                {EMAIL_RGPD_TEMPLATE}
              </pre>
            </div>
          </RgpdSection>

          {/* 8. Réclamation CNIL */}
          <RgpdSection title="8. Droit de réclamation auprès de la CNIL">
            <P>
              Si vous estimez que le traitement de vos données ne respecte pas la réglementation
              en vigueur, vous avez le droit d&apos;introduire une réclamation auprès de la{' '}
              <strong>Commission Nationale de l&apos;Informatique et des Libertés (CNIL)</strong> :
            </P>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-700">
              <p><strong>CNIL</strong></p>
              <p>3 Place de Fontenoy, TSA 80715</p>
              <p>75334 Paris Cedex 07</p>
              <p>Téléphone : 01 53 73 22 22</p>
              <p>
                Site :{' '}
                <a
                  href="https://www.cnil.fr"
                  className="text-emerald-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.cnil.fr
                </a>
              </p>
              <p>
                Plainte en ligne :{' '}
                <a
                  href="https://www.cnil.fr/fr/plaintes"
                  className="text-emerald-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.cnil.fr/fr/plaintes
                </a>
              </p>
            </div>
            <p className="text-slate-600 text-sm mt-2">
              Nous vous encourageons toutefois à nous contacter en premier lieu afin de résoudre
              votre demande à l&apos;amiable.
            </p>
          </RgpdSection>

          {/* 9. Sécurité */}
          <RgpdSection title="9. Sécurité des données">
            <P>
              Conformément à l&apos;article 32 du RGPD, nous mettons en place des mesures techniques
              et organisationnelles appropriées :
            </P>
            <Ul>
              <li>Chiffrement des données en transit (TLS 1.2+) et au repos (AES-256).</li>
              <li>Authentification multi-facteurs pour l&apos;accès administrateur.</li>
              <li>Rate limiting sur les formulaires pour prévenir les abus automatisés.</li>
              <li>Audits réguliers des accès et journalisation des activités suspectes.</li>
              <li>Politique de mots de passe stricts (minimum 12 caractères).</li>
              <li>Anonymisation des signalements publiés.</li>
            </Ul>
            <P>
              En cas de violation de données à caractère personnel, nous notifierons la CNIL
              dans les <strong>72 heures</strong> (Art. 33 RGPD) et vous informerons sans
              délai si la violation est susceptible d&apos;engendrer un <strong>risque élevé</strong> pour
              vos droits et libertés (Art. 34 RGPD).
            </P>
          </RgpdSection>

          {/* 10. Cookies */}
          <RgpdSection title="10. Cookies">
            <P>
              Conformément à l&apos;article 82 de la loi Informatique et Libertés et aux
              recommandations de la CNIL, nous vous informons de l&apos;utilisation des cookies suivants :
            </P>

            <h3 className="font-semibold text-slate-900 mt-4 mb-2">Cookies strictement nécessaires (exemptés de consentement)</h3>
            <P>
              Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés :
            </P>
            <Ul>
              <li><strong>cookie-consent</strong> : mémorise votre choix de consentement cookies (localStorage).</li>
              <li><strong>Cookies de session Supabase</strong> : authentification des bénévoles administrateurs.</li>
            </Ul>

            <h3 className="font-semibold text-slate-900 mt-4 mb-2">Mesure d&apos;audience</h3>
            <P>
              Nous utilisons <strong>Vercel Analytics</strong>, un outil de mesure d&apos;audience qui
              fonctionne <strong>sans cookie</strong> et <strong>sans collecte de données personnelles</strong>.
              Les données sont agrégées et anonymes. Ce traitement est exempté de consentement
              conformément aux recommandations de la CNIL relatives aux traceurs exemptés.
            </P>

            <h3 className="font-semibold text-slate-900 mt-4 mb-2">Cookies optionnels</h3>
            <P>
              Si vous acceptez les cookies optionnels via notre bandeau, les catégories suivantes
              peuvent être activées :
            </P>
            <Ul>
              <li><strong>Cookies analytiques</strong> : mesure d&apos;audience détaillée (désactivés par défaut).</li>
              <li><strong>Cookies marketing</strong> : actuellement non utilisés. Cette catégorie est
                prévue pour une éventuelle évolution future et reste désactivée.</li>
            </Ul>
            <P>
              Vous pouvez modifier vos préférences à tout moment via le bandeau cookies accessible
              en bas de page. Le refus des cookies optionnels n&apos;empêche pas l&apos;utilisation du site.
            </P>
          </RgpdSection>

          {/* 11. Décision automatisée */}
          <RgpdSection title="11. Décision automatisée et profilage">
            <P>
              Conformément à l&apos;article 22 du RGPD, nous vous informons qu&apos;aucune décision
              produisant des effets juridiques ou vous affectant de manière significative n&apos;est
              prise sur le seul fondement d&apos;un traitement automatisé, y compris le profilage.
            </P>
            <P>
              L&apos;outil d&apos;analyse de messages suspects proposé sur la plateforme est un outil
              d&apos;aide à titre informatif uniquement. Il ne constitue ni un avis juridique, ni
              une décision automatisée au sens du RGPD.
            </P>
          </RgpdSection>

          {/* 12. Mineurs */}
          <RgpdSection title="12. Protection des mineurs">
            <P>
              La plateforme Anti Pepins n&apos;est pas destinée aux mineurs de moins de 15 ans.
              Conformément à l&apos;article 8 du RGPD et à l&apos;article 45 de la loi Informatique et
              Libertés, le traitement des données d&apos;un mineur de moins de 15 ans n&apos;est licite
              que si le consentement est donné par le titulaire de l&apos;autorité parentale.
            </P>
            <P>
              Si nous constatons qu&apos;un mineur de moins de 15 ans a fourni des données personnelles
              sans consentement parental, nous supprimerons ces données dans les meilleurs délais.
            </P>
          </RgpdSection>

          {/* 13. Modifications */}
          <RgpdSection title="13. Modifications de la politique">
            <P>
              Nous nous réservons le droit de modifier la présente politique à tout moment.
              En cas de modification substantielle, une notification sera affichée sur le site.
              Nous vous invitons à consulter régulièrement cette page.
            </P>
            <P>
              L&apos;utilisation continue de la plateforme après publication des modifications
              vaut prise de connaissance de la politique mise à jour. Les modifications ne
              s&apos;appliquent pas rétroactivement aux données collectées avant leur publication.
            </P>
          </RgpdSection>

          <div className="text-center pt-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Contactez-nous pour toute question RGPD
            </a>
          </div>

        </div>
      </section>

      <p className="text-sm text-slate-500 text-center pb-8">
        Dernière mise à jour : {LAST_UPDATED}
      </p>
    </MainLayout>
  );
}
