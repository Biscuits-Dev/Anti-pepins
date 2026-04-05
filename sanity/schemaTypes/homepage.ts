import { Rule } from 'sanity';

export const homepage = {
  name: 'homepage',
  title: 'Page d\'accueil',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'layout',
      title: 'Mise en page',
      type: 'string',
      description: 'Choisissez le type de mise en page pour la page d\'accueil',
      options: {
        list: [
          { title: 'Héro', value: 'hero' },
          { title: 'Défaut', value: 'default' },
        ],
        layout: 'radio',
      },
      initialValue: 'hero',
    },
    {
      name: 'heroTitle',
      title: 'Titre de la section héro',
      type: 'string',
      description: 'Titre principal de la section héro',
    },
    {
      name: 'heroSubtitle',
      title: 'Sous-titre de la section héro',
      type: 'text',
      description: 'Sous-titre de la section héro',
      rows: 3,
    },
    {
      name: 'heroImage',
      title: 'Image de la section héro',
      type: 'image',
      description: 'Image à afficher dans la section héro',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'features',
      title: 'Fonctionnalités',
      type: 'array',
      description: 'Liste des fonctionnalités à afficher',
      of: [
        {
          type: 'object',
          name: 'feature',
          fields: [
            {
              name: 'icon',
              title: 'Icône',
              type: 'string',
              description: 'Icône à afficher (emoji)',
            },
            {
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              validation: (rule: Rule) => rule.required(),
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      title: 'Contenu principal',
      type: 'array',
      description: 'Contenu principal de la page',
      of: [{ type: 'block' }],
    },
    {
      name: 'ctaSection',
      title: 'Section CTA',
      type: 'object',
      description: 'Section d\'appel à l\'action',
      fields: [
        {
          name: 'title',
          title: 'Titre',
          type: 'string',
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text',
          rows: 3,
        },
        {
          name: 'buttonText',
          title: 'Texte du bouton',
          type: 'string',
        },
        {
          name: 'buttonLink',
          title: 'Lien du bouton',
          type: 'url',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'heroTitle',
    },
  },
};