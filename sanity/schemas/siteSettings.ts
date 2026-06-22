const LOCALES = ['en', 'sw', 'fr', 'ar', 'es'] as const;

const localizedString = (title: string) => ({
  name: title.toLowerCase().replace(/\s+/g, '_'),
  title,
  type: 'object',
  fields: LOCALES.map((loc) => ({
    name: loc,
    title: loc.toUpperCase(),
    type: 'string',
  })),
});

export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { ...localizedString('Tagline') },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    },
    {
      name: 'socials',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'twitter', type: 'url', title: 'X / Twitter' },
        { name: 'facebook', type: 'url', title: 'Facebook' },
      ],
    },
  ],
};
