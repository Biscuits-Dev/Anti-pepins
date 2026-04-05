import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout';
import { LinkButton } from '@/components/ui';
import { TemoignageForm } from '@/components/TemoignageForm';

export const metadata: Metadata = {
  title: 'Témoignages — Anti-Pépins',
  description: 'Découvrez les témoignages de personnes qui ont été confrontées à des arnaques en ligne et qui ont choisi de partager leur expérience.',
};

interface Testimonial {
  id: number;
  name: string;
  age: number;
  city: string;
  scamType: string;
  date: string;
  content: string;
  outcome: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Marie',
    age: 45,
    city: 'Lyon',
    scamType: 'Phishing',
    date: '2024-01-15',
    content:
      "J'ai reçu un email qui semblait provenir de ma banque, me demandant de mettre à jour mes informations. Le lien m'a mené à un faux site qui imitait parfaitement celui de ma banque. J'ai saisi mes identifiants et quelques heures plus tard, on a tenté de faire un virement depuis mon compte.",
    outcome: "J'ai pu bloquer le virement en appelant rapidement ma banque. J'ai signalé l'arnaque sur Anti-Pépins pour prévenir d'autres personnes.",
    avatar: '👩',
  },
  {
    id: 2,
    name: 'Jean-Pierre',
    age: 62,
    city: 'Bordeaux',
    scamType: 'Arnaque sentimentale',
    date: '2024-02-20',
    content:
      "Sur un site de rencontre, j'ai fait la connaissance d'une personne charmante. Après plusieurs semaines de conversation, elle m'a demandé de l'argent pour un billet d'avion afin de venir me voir. J'ai failli envoyer 800€ avant que ma fille ne me mette en garde.",
    outcome: "En cherchant sur internet, j'ai découvert que les photos utilisées appartenaient à une mannequin russe. J'ai compris que j'étais tombé dans un piège classique.",
    avatar: '👨',
  },
  {
    id: 3,
    name: 'Sophie',
    age: 28,
    city: 'Paris',
    scamType: 'Faux site e-commerce',
    date: '2024-03-10',
    content:
      "J'ai commandé des chaussures sur un site qui proposait des prix défiant toute concurrence (70% de réduction). Le site avait l'air professionnel avec de vrais avis clients. Après avoir payé 120€ par carte bancaire, je n'ai jamais rien reçu.",
    outcome: "Le site a disparu quelques semaines plus tard. J'ai porté plainte et signalé le site à ma banque qui m'a remboursée.",
    avatar: '👩‍🦰',
  },
  {
    id: 4,
    name: 'Ahmed',
    age: 35,
    city: 'Marseille',
    scamType: 'Investissement',
    date: '2024-04-05',
    content:
      "Un soi-disant conseiller financier m'a contacté sur LinkedIn pour me proposer un investissement en cryptomonnaie avec des rendements garantis de 20% par mois. J'ai investi 2000€ au début, et les gains affichaient bien sur leur plateforme.",
    outcome: "Quand j'ai voulu retirer mon argent, on m'a demandé de payer des 'frais de sortie'. C'est là que j'ai compris que c'était une arnaque. La plateforme a fermé peu après.",
    avatar: '👨‍💼',
  },
  {
    id: 5,
    name: 'Isabelle',
    age: 52,
    city: 'Toulouse',
    scamType: 'Faux support technique',
    date: '2024-05-12',
    content:
      "J'ai reçu un appel de quelqu'un qui prétendait être de Microsoft. Il m'a dit que mon ordinateur était infecté et qu'il fallait intervenir rapidement. Il m'a demandé de télécharger un logiciel pour qu'il puisse prendre le contrôle de mon PC à distance.",
    outcome: "J'ai raccroché et j'ai appelé un vrai technicien informatique qui m'a confirmé que c'était une arnaque classique. Mon ordinateur n'avait aucun problème.",
    avatar: '👩‍🦳',
  },
  {
    id: 6,
    name: 'Thomas',
    age: 31,
    city: 'Nantes',
    scamType: 'SMS de livraison',
    date: '2024-06-18',
    content:
      "J'ai reçu un SMS me disant qu'un colis était en attente de livraison avec un lien pour renseigner mes coordonnées. Le lien ressemblait à celui de La Poste. J'ai failli cliquer mais quelque chose m'a mis la puce à l'oreille.",
    outcome: "En vérifiant l'URL de plus près, j'ai vu que ce n'était pas le vrai site de La Poste. J'ai signalé le numéro et le lien sur Anti-Pépins.",
    avatar: '🧑',
  },
  {
    id: 7,
    name: 'Catherine',
    age: 67,
    city: 'Strasbourg',
    scamType: 'Loterie',
    date: '2024-07-22',
    content:
      "J'ai reçu un email m'annonçant que j'avais gagné 500 000€ à une loterie internationale. Pour récupérer mes gains, il fallait payer des 'frais de dossier' de 350€. J'étais tellement excitée que j'ai failli envoyer l'argent.",
    outcome: "Mon fils m'a expliqué que c'était une arnaque classique. On ne gagne pas à une loterie sans avoir acheté de billet !",
    avatar: '👵',
  },
  {
    id: 8,
    name: 'Lucas',
    age: 24,
    city: 'Lille',
    scamType: 'Emploi',
    date: '2024-08-30',
    content:
      "J'ai répondu à une annonce pour un travail à domicile bien rémunéré. On m'a demandé de payer un 'kit de démarrage' de 150€ avant de commencer. L'entreprise avait un site web professionnel et un contrat qui semblait officiel.",
    outcome: "Après avoir payé, je n'ai plus jamais eu de nouvelles. Le site a disparu et le numéro de SIRET était faux.",
    avatar: '🧑‍💻',
  },
  {
    id: 9,
    name: 'Nathalie',
    age: 41,
    city: 'Nice',
    scamType: 'Usurpation identite',
    date: '2024-09-14',
    content:
      "Quelqu'un a créé un faux profil Facebook avec mes photos et mon nom. Cette personne contactait mes amis en leur demandant de l'argent pour une urgence médicale. Plusieurs personnes ont cru que c'était vraiment moi.",
    outcome: "J'ai signalé le faux profil à Facebook et j'ai prévenu tous mes amis. Il faut être vigilant et toujours vérifier par un autre moyen avant d'envoyer de l'argent.",
    avatar: '👱‍♀️',
  },
];

const SCAM_TYPE_COLORS: Record<string, string> = {
  Phishing: 'bg-blue-100 text-blue-800 border-blue-200',
  'Arnaque sentimentale': 'bg-pink-100 text-pink-800 border-pink-200',
  'Faux site e-commerce': 'bg-purple-100 text-purple-800 border-purple-200',
  'Investissement': 'bg-amber-100 text-amber-800 border-amber-200',
  'Faux support technique': 'bg-red-100 text-red-800 border-red-200',
  'SMS de livraison': 'bg-orange-100 text-orange-800 border-orange-200',
  'Loterie': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Emploi': 'bg-green-100 text-green-800 border-green-200',
  'Usurpation identite': 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

function TestimonialCard({ testimonial }: Readonly<{ testimonial: Testimonial }>) {
  const formattedDate = new Date(testimonial.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl shrink-0" aria-hidden="true">
            {testimonial.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900">
                {testimonial.name}, {testimonial.age} ans
              </h3>
              <span className="text-slate-400">•</span>
              <span className="text-sm text-slate-500">{testimonial.city}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold border ${
                  SCAM_TYPE_COLORS[testimonial.scamType] ?? 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                {testimonial.scamType}
              </span>
              <span className="text-slate-400">•</span>
              <time dateTime={testimonial.date} className="text-slate-500">
                {formattedDate}
              </time>
            </div>
          </div>
        </div>

        <blockquote className="text-slate-700 leading-relaxed mb-4">
          {testimonial.content}
        </blockquote>

        <div className="bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-sm font-semibold text-emerald-800 mb-1">💡 Issue</p>
          <p className="text-sm text-emerald-700 leading-relaxed">
            {testimonial.outcome}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function TestimonialsPage(): React.JSX.Element {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-slate-50 py-16 lg:py-24" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 id="testimonials-heading" className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Témoignages de victimes
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Ces personnes ont accepté de partager leur expérience pour aider les autres
              à reconnaître et éviter les arnaques. Leur courage fait la différence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-13 bg-slate-50" aria-labelledby="list-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-slate-500 mb-6">
            Nous nous engageons à protéger la vie privée de chacun. Certains témoignages ont été récupérés sur des forums publics uniquement pour illustrer les arnaques.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white" aria-labelledby="form-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <TemoignageForm />
        </div>
      </section>

      <section className="py-20 bg-emerald-600" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-heading" className="text-3xl font-bold text-white mb-4">
            Vous avez une question ?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
            Si vous avez besoin d&apos;aide ou de conseils, n&apos;hésitez pas à nous contacter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/report" variant="secondary" size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
              Signaler une arnaque
            </LinkButton>
            <LinkButton href="/contact" variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-emerald-600">
              Nous contacter
            </LinkButton>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}