import type { Metadata } from 'next';
import { Section, CallToAction, CodeBlock, TechBadge } from '@/components/ui';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Contribuer – Anti-Pépins',
  description:
    "Rejoignez l'équippe Anti-Pépins et contribuez à la lutte contre les arnaques en ligne.",
  keywords: ['contribution', 'open-source', 'bénévolat', 'Anti-Pépins'],
};

interface TechBadgeItem {
  readonly name: string;
  readonly color: string;
  readonly textColor: string;
}

const TECH_STACK: readonly TechBadgeItem[] = [
  { name: 'Next.js', color: 'bg-black', textColor: 'text-white' },
  { name: 'React', color: 'bg-blue-100', textColor: 'text-blue-800' },
  { name: 'TypeScript', color: 'bg-blue-600', textColor: 'text-white' },
  { name: 'Tailwind CSS', color: 'bg-teal-500', textColor: 'text-white' },
] as const;

const INSTALL_COMMANDS = `git clone https://github.com/Biscuits-Dev/Anti-pepins
cd Anti-pepins
npm install
cp .env.example .env
# Configurez vos variables d'environnement dans .env
npm run dev`;

const GUIDE_EXAMPLE = `# Comment reconnaître une arnaque au faux support technique

1. **Signes à repérer**
   - Appel inattendu se prétendant de Microsoft/Apple
   - Demande d'accès à votre ordinateur
   - Menace de suppression de données

2. **Que faire ?**
   - Raccrocher immédiatement
   - Ne pas donner d'informations personnelles
   - Signaler sur Anti-Pépins

*Source : [Cybermalveillance.gouv.fr](https://www.cybermalveillance.gouv.fr)*`;

export default function ContribuerPage(): React.JSX.Element {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contribuer à Anti-Pépins</h1>
      <p className="mb-8 text-gray-700">
        Anti-Pépins est un projet open-source développé par l&apos;association{' '}
        <a href="https://biscuits-ia.com" className="text-blue-600 hover:underline">Biscuits IA</a>.
        Que vous soyez développeur, designer, rédacteur ou simple citoyen engagé, votre
        aide est précieuse pour lutter contre les arnaques en ligne.
      </p>

      <Section title="Introduction">
        <p className="mb-4">
          Notre mission est de créer une plateforme collaborative pour signaler, documenter
          et suivre les arnaques en ligne. Le projet utilise les technologies suivantes&nbsp;:
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {TECH_STACK.map((tech) => (
            <TechBadge
              key={tech.name}
              name={tech.name}
              color={tech.color}
              textColor={tech.textColor}
            />
          ))}
        </div>
        <p>
          Le code source est disponible sur{' '}
          <a
            href="https://github.com/Biscuits-Dev/Anti-pepins"
            className="text-blue-600 hover:underline"
          >
            GitHub
          </a>
        </p>
      </Section>

      <Section title="Pour les Développeurs 💻">
        <p className="mb-4">Prérequis&nbsp;:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>Node.js 22+</li>
          <li>npm ou yarn</li>
          <li>Git</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Installation</h3>
        <CodeBlock language="bash">{INSTALL_COMMANDS}</CodeBlock>

        <h3 className="text-xl font-semibold mb-3 mt-6">Conventions de Code</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>TypeScript strict (pas de <code>any</code>)</li>
          <li>ESLint configuré automatiquement</li>
          <li>Noms de branches&nbsp;: <code>feature/xxx</code>, <code>fix/xxx</code>, <code>docs/xxx</code></li>
          <li>Commits en français, suivant la convention Conventional Commits</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Processus de Pull Request</h3>
        <ol className="list-decimal pl-6 mb-4">
          <li>Forkez le dépôt et clonez votre fork</li>
          <li>Créez une branche pour votre fonctionnalité</li>
          <li>Implémentez et testez vos changements</li>
          <li>Soumettez une pull request vers la branche <code>main</code> avec un titre clair et une description détaillée</li>
          <li>Votre PR sera revue par au moins 2 bénévoles</li>
          <li>Apportez les corrections si nécessaire</li>
        </ol>
        <p>Les PR sont fusionnées via des merge commits pour préserver l&apos;historique.</p>
      </Section>

      <Section title="Pour les Designers 🎨">
        <p className="mb-4">
          Nous utilisons <strong>Tailwind CSS</strong> pour le design. Vous pouvez proposer
          des maquettes via&nbsp;:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Figma (envoyez le lien sur Discord)</li>
          <li>Adobe XD (fichier partagé)</li>
          <li>PDF haute résolution</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Palette de Couleurs</h3>
        <div className="flex gap-2 mb-4" aria-label="Palette de couleurs">
          <div className="w-12 h-12 bg-blue-600   border-2 border-gray-300" title="Bleu #3b82f6" />
          <div className="w-12 h-12 bg-gray-900   border-2 border-gray-300" title="Noir #1f2937" />
          <div className="w-12 h-12 bg-white   border-2 border-gray-300" title="Blanc #ffffff" />
          <div className="w-12 h-12 bg-red-500   border-2 border-gray-300" title="Rouge #ef4444" />
        </div>
        <p className="mb-4">
          <strong>Bleu</strong>&nbsp;: #3b82f6 (primaire)<br />
          <strong>Noir</strong>&nbsp;: #1f2937 (texte)<br />
          <strong>Blanc</strong>&nbsp;: #ffffff (arrière-plan)<br />
          <strong>Rouge</strong>&nbsp;: #ef4444 (alertes)
        </p>

        <h3 className="text-xl font-semibold mb-3">Typographie</h3>
        <p className="mb-4">
          Police&nbsp;: <strong>Geist Sans</strong> (fournie par Next.js)<br />
          Taille par défaut&nbsp;: 16px<br />
          Hiérarchie&nbsp;: h1 (2.25rem), h2 (1.875rem), h3 (1.5rem)
        </p>
      </Section>

      <Section title="Pour les Bénévoles Non-Techniques 🤝">
        <h3 className="text-xl font-semibold mb-3">Modération des Signalements</h3>
        <p className="mb-4">Les modérateurs vérifient les signalements selon ces critères&nbsp;:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Preuves suffisantes (captures d&apos;écran, emails, etc.)</li>
          <li>Cohérence de l&apos;histoire</li>
          <li>Absence de duplication</li>
          <li>Respect des règles de la plateforme</li>
        </ul>
        <p className="mb-4">
          Outils utilisés&nbsp;: recherche inversée d&apos;images, bases de données tierces
          (Signal Arnaques, etc.).
        </p>

        <h3 className="text-xl font-semibold mb-3">Rédaction de Guides</h3>
        <p className="mb-4">Les guides doivent être rédigés en Markdown avec&nbsp;:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Un titre clair et descriptif</li>
          <li>Des étapes numérotées</li>
          <li>Des captures d&apos;écran si nécessaire</li>
          <li>Des liens vers des ressources externes</li>
        </ul>
        <p className="mb-2">Exemple de structure&nbsp;:</p>
        <CodeBlock language="markdown">{GUIDE_EXAMPLE}</CodeBlock>
      </Section>

      <Section title="Ressources">
        <ul className="list-disc pl-6 mb-4">
          <li><a href="/code-de-conduite" className="text-blue-600 hover:underline">Code de Conduite</a></li>
          <li><a href="https://discord.gg/anti-pepins" className="text-blue-600 hover:underline">Canal Discord</a></li>
          <li><a href="https://github.com/Biscuits-Dev/Anti-pepins/projects" className="text-blue-600 hover:underline">Roadmap GitHub</a></li>
          <li><a href="https://github.com/Biscuits-Dev/Anti-pepins/blob/main/CONTRIBUTORS.md" className="text-blue-600 hover:underline">Liste des Contributeurs</a></li>
        </ul>
      </Section>

      <Section title="Reconnaissance">
        <p className="mb-4">
          Tous les contributeurs sont crédités dans le fichier{' '}
          <code className="bg-gray-100 px-2 py-1  ">CONTRIBUTORS.md</code> avec&nbsp;:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Leur nom ou pseudonyme</li>
          <li>Leur rôle (développeur, designer, modérateur, etc.)</li>
          <li>Leur contribution majeure</li>
          <li>Un lien vers leur profil (GitHub, site web, etc.)</li>
        </ul>
        <p>
          Les contributeurs actifs reçoivent un badge &quot;Contributeur Anti-Pépins&quot; pour
          leur profil GitHub.
        </p>
      </Section>

      <CallToAction href="mailto:contact@anti-pepins.biscuits-ia.com" text="Rejoignez l'équipe !" />

      <p className="text-sm text-gray-500 mt-8">
        Dernière mise à jour&nbsp;: 31 mars 2026
      </p>
    </main>
  );
}