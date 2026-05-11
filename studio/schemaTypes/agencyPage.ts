import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'agencyPage',
  title: 'Agency page',
  type: 'document',
  description: 'Single page for /agence. Create only one document.',
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
      name: 'pageHeading',
      title: 'Page heading (banner)',
      type: 'string',
      initialValue: 'Agence',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'service',
          fields: [
            {name: 'title', type: 'string', validation: (Rule) => Rule.required()},
            {
              name: 'description',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'accomplishmentsHeading',
      title: 'Accomplishments heading',
      type: 'string',
      initialValue: 'Réalisations',
    }),
    defineField({
      name: 'accomplishments',
      title: 'Past work / réalisations',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'item',
          fields: [
            {name: 'name', type: 'string', validation: (Rule) => Rule.required()},
            {name: 'client', type: 'string', validation: (Rule) => Rule.required()},
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'realisationsImage',
      title: 'Image beside réalisations column',
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
      name: 'ctaImage',
      title: 'CTA section image (left column)',
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
      name: 'ctaTitle',
      title: 'CTA title',
      type: 'string',
      initialValue: 'Un projet ?',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaIntro',
      title: 'CTA intro text',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'contact@wereklub.com',
    }),
    defineField({
      name: 'bookingEmail',
      title: 'Booking email',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'booking@wereklub.com',
    }),
    defineField({
      name: 'ctaPanelColor',
      title: 'CTA panel background (hex)',
      type: 'string',
      initialValue: '#d4a574',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Agency page'}),
  },
})
