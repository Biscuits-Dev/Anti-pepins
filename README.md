# Anti Pepins - Collectif contre les arnaques

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F)](https://www.sanity.io/)
[![License](https://img.shields.io/badge/License-AGPL%20v3-blue)](LICENSE)

**Anti Pepins** est un collectif citoyen et open source dédié à la lutte contre les arnaques en ligne. Notre plateforme permet aux utilisateurs d'analyser, signaler, partager et consulter des informations sur les escroqueries pour protéger la communauté.

## 📚 Description du projet

Anti Pepins est une application web moderne construite avec Next.js 16, React 19 et TypeScript. Le projet vise à :

- ✅ Analyser en temps réel des messages, mails, urls, numéros de téléphone via regex et intelligence artificielle
- ✅ Permettre aux utilisateurs de signaler des arnaques avec preuves
- ✅ Collecter et partager des témoignages de victimes
- ✅ Créer une base de données publique et collaborative des escroqueries
- ✅ Fournir des guides, conseils et articles éducatifs
- ✅ Sensibiliser et former aux bonnes pratiques de sécurité en ligne
- ✅ Protéger les utilisateurs contre les fraudes et les arnaques

## 🛠️ Technologies utilisées

### Framework & Langages
- **Next.js** 16.2.1 (App Router)
- **React** 19.2.4
- **TypeScript** 5.8.3
- **Tailwind CSS** 4.x

### Base de données & Services
- **Supabase** - Base de données PostgreSQL
- **Sanity.io** - CMS headless pour le contenu du blog
- **Upstash Redis** - Rate Limiting et cache
- **Mistral (Model Biscuits IA) / regex** - Pour l'analyse intelligente des contenus

### Outils & Bibliothèques
- **Zustand** - Gestion d'état global
- **React Hot Toast** - Notifications
- **Jest** - Tests unitaires
- **ESLint + Prettier** - Qualité et formatage du code
- **Husky** - Git hooks
- **Vercel Analytics**

## 🚀 Installation et configuration

### Prérequis

- Node.js 22 ou supérieur
- npm 10 ou supérieur
- Compte Supabase
- Compte Sanity (optionnel)
- Compte Upstash (optionnel)

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/Biscuits-Dev/Anti-pepins.git
cd Anti-pepins
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Copiez le fichier exemple et remplissez les variables nécessaires :
```bash
cp .env.local.example .env.local
```

Éditez le fichier `.env.local` avec vos propres identifiants.

4. **Lancer le serveur de développement**

```bash
npm run dev
```

5. **Ouvrir dans le navigateur**

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📖 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Construit l'application pour production |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Vérifie la qualité du code |
| `npm run test` | Exécute les tests unitaires |
| `npm run types:supabase` | Génère les types TypeScript depuis Supabase |

## 🎯 Fonctionnalités principales

### 🔍 Analyseur d'arnaques
- Analyse de texte, mail, url, numéro de téléphone
- Système de notation et scoring de risque
- Détection par expressions régulières
- Analyse par intelligence artificielle
- Base de données de signatures connues

### 🚨 Signalement d'arnaques
- Formulaire de signalement intuitif
- Validation sécurisée des données
- Upload de preuves (captures d'écran, documents)
- Système de modération
- Anonymat possible pour les victimes

### 💬 Témoignages communautaires
- Partage d'expériences vécues
- Support entre membres
- Système de notation et commentaires
- Filtrage et recherche

### 📚 Centre de ressources
- Blog et articles éducatifs
- FAQ détaillée
- Guides de prévention
- Alertes et actualités sur les nouvelles arnaques

### 🏗️ Architecture
- API REST complète
- Rate Limiting et protection contre les abus
- Gestion des erreurs et monitoring
- Responsive Design mobile-first
- Accessibilité respectée

## 🤝 Contribution

Nous accueillons chaleureusement les contributions de la communauté ! Voici comment contribuer :

1. **Forker le projet** sur GitHub
2. **Créer une branche de feature**
   ```bash
   git checkout -b feature/nouvelle-fonctionnalité
   ```
3. **Effectuez vos modifications** et respectez les conventions de code
4. **Committez vos changements**
   ```bash
   git commit -m "Ajout: description de la fonctionnalité"
   ```
5. **Pusher la branche**
   ```bash
   git push origin feature/nouvelle-fonctionnalité
   ```
6. **Ouvrir une Pull Request** avec une description claire

Toutes les contributions sont les bienvenues : corrections de bugs, améliorations, nouvelles fonctionnalités, documentation, traductions.

## 📄 Licence

Ce projet est sous licence **GNU Affero General Public License v3.0**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :

- Ouvrir une issue sur [GitHub](https://github.com/Biscuits-Dev/Anti-pepins/issues)
- Contacter l'équipe via le [formulaire de contact](https://anti-pepins.biscuits-ia.com/contact)

---

**Anti Pepins** est une initiative de l'association **Biscuits IA**, dédiée à la protection des utilisateurs contre les arnaques en ligne.

💡 *Ensemble, nous pouvons lutter contre les arnaques !*