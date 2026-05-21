import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About',
  type: 'document',
  description: 'One document only.',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'SEO title',
      type: 'string',
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'panelColor',
      title: 'Panel color',
      type: 'string',
      initialValue: '#7cb342',
      validation: (Rule) =>
        Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
          name: 'hex color',
          invert: false,
        }).error('Use a valid hex color like #7cb342'),
    }),
    defineField({
      name: 'carouselImages',
      title: 'Carousel images',
      type: 'array',
      of: [
        {
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
        },
      ],
      validation: (Rule) => Rule.required().min(2),
      description: 'At least 2 images.',
    }),
    defineField({
      name: 'introLabel',
      title: 'Intro label',
      type: 'string',
      initialValue: 'Le collectif Wêrê Klub',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'AMOUR ET BOUCAN',
    }),
    defineField({
      name: 'body',
      title: 'Body text',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required().min(1),
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
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'teamHeading',
      title: 'Team heading',
      type: 'string',
      initialValue: "L'ÉQUIPE",
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
    }),
  ],
  preview: {
    prepare: () => ({title: 'About'}),
  },
})
