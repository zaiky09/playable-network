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
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    {
      name: 'slug',
      title: 'Slug',
      type: 'string',
      description: 'home | about | what-we-do | partners | contact',
      validation: (Rule: any) => Rule.required(),
    },
    localizedText('title', 'Title', 'string'),
    localizedText('intro', 'Intro', 'text'),
    localizedText('body', 'Body', 'array'),
  ],
};
