import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About page (À propos)',
  type: 'document',
  description: 'Single page for /a-propos. Create only one document.',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Browser title; defaults to À propos | Wêrê Klub if empty.',
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'pageHeading',
      title: 'Page heading (banner)',
      type: 'string',
      initialValue: 'À propos',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'collectifTitle',
      title: 'Collectif block title',
      type: 'string',
      initialValue: 'Le collectif',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'collectifBody',
      title: 'Collectif text',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'collectifPanelColor',
      title: 'Collectif panel background (hex)',
      type: 'string',
      initialValue: '#7cb342',
      description: 'e.g. #7cb342',
    }),
    defineField({
      name: 'stats',
      title: 'Stats (max 4)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'stat',
          fields: [
            {name: 'value', type: 'string', title: 'Value', validation: (Rule) => Rule.required()},
            {name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required()},
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
    defineField({
      name: 'teamHeading',
      title: 'Team section heading',
      type: 'string',
      initialValue: "L'équipe",
    }),
    defineField({
      name: 'team',
      title: 'Team members',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'member',
          fields: [
            {name: 'name', type: 'string', validation: (Rule) => Rule.required()},
            {name: 'role', type: 'string', validation: (Rule) => Rule.required()},
            {
              name: 'image',
              type: 'image',
              options: {hotspot: true},
              fields: [{name: 'alt', type: 'string', title: 'Alt'}],
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'teamSectionImage',
      title: 'Team section (large side image)',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'teamPanelColor',
      title: 'Team text panel background (hex)',
      type: 'string',
      initialValue: '#e8b4bc',
    }),
  ],
  preview: {
    prepare: () => ({title: 'About page (À propos)'}),
  },
})
