const LOCALES = ['en', 'sw', 'fr', 'ar', 'es'] as const;

const localizedText = (name: string, title: string, type: 'string' | 'text' = 'text') => ({
  name,
  title,
  type: 'object',
  fields: LOCALES.map((loc) => ({
    name: loc,
    title: loc.toUpperCase(),
    type,
  })),
});

export default {
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'url',
      title: 'Website URL',
      type: 'url',
    },
    localizedText('blurb', 'Relationship Blurb', 'text'),
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
    },
  ],
};
