const LOCALES = ['en', 'sw', 'fr', 'ar', 'es'] as const;

const localizedText = (name: string, title: string, type: 'string' | 'text' | 'array' = 'text') => ({
  name,
  title,
  type: 'object',
  fields: LOCALES.map((loc) => ({
    name: loc,
    title: loc.toUpperCase(),
    type: type === 'array' ? 'array' : type,
    ...(type === 'array' ? { of: [{ type: 'block' }] } : {}),
  })),
});

export default {
  name: 'program',
  title: 'Program',
  type: 'document',
  fields: [
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: (doc: any) => doc.title?.en },
      validation: (Rule: any) => Rule.required(),
    },
    localizedText('title', 'Title', 'string'),
    localizedText('summary', 'Summary', 'text'),
    localizedText('description', 'Description', 'array'),
    {
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
    },
  ],
};
