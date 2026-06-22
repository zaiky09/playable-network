const LOCALES = ['en', 'sw', 'fr', 'ar', 'es'] as const;

const localizedText = (name: string, title: string, type: 'string' | 'text' = 'string') => ({
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
  name: 'person',
  title: 'Person (Team / Board)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Team', value: 'team' },
          { title: 'Board', value: 'board' },
        ],
        layout: 'radio',
      },
      validation: (Rule: any) => Rule.required(),
    },
    localizedText('role', 'Role', 'string'),
    localizedText('bio', 'Bio', 'text'),
    {
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'category', media: 'photo' },
  },
};
