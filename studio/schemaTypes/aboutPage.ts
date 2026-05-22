import {defineType, defineField} from 'sanity'
import {panelColorField} from './shared/colors'
import {imageArrayFieldOptions, imageArrayMember, imageAssetOptions} from './shared/image'

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
    panelColorField({initialValue: 'lime-500'}),
    defineField({
      name: 'carouselImages',
      title: 'Carousel images',
      type: 'array',
      options: imageArrayFieldOptions,
      of: [
        imageArrayMember([
          {
            name: 'alt',
            type: 'string',
            title: 'Alt text',
            validation: (rule) => rule.required(),
          },
        ]),
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
      options: imageArrayFieldOptions,
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
              options: imageAssetOptions,
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
