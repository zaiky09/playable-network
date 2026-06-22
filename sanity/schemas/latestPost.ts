export default {
  name: 'latestPost',
  title: 'Latest Post',
  type: 'document',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'text',
      rows: 3,
      description: 'Short caption shown under the image (1–2 sentences).',
      validation: (Rule: any) => Rule.required().max(200),
    },
    {
      name: 'instagramUrl',
      title: 'Instagram Post URL',
      type: 'url',
      description: 'Optional — link to the full post on Instagram.',
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'caption', media: 'image', date: 'publishedAt' },
  },
};
