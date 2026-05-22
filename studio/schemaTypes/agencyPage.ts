import {defineType, defineField} from 'sanity'
import {panelColorField, panelTextColorField} from './shared/colors'
import {imageArrayFieldOptions, imageArrayMember, imageAssetOptions} from './shared/image'

export default defineType({
  name: 'agencyPage',
  title: 'Agency',
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
    panelColorField({initialValue: 'sage'}),
    panelTextColorField(),
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
      initialValue: 'Un partenaire créatif pour les marques.',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'CRÉER AUTREMENT AVEC WÊRÊ KLUB',
    }),
    defineField({
      name: 'body',
      title: 'Body text',
      type: 'array',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'missionHeading',
      title: 'Mission heading',
      type: 'string',
      initialValue: 'NOTRE MISSION',
    }),
    defineField({
      name: 'missionBody',
      title: 'Mission text',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'logosIntro',
      title: 'Logos intro',
      type: 'string',
      initialValue: 'Quelques références de nos dernières collaborations.',
    }),
    defineField({
      name: 'partnerLogos',
      title: 'Partner logos',
      type: 'array',
      options: imageArrayFieldOptions,
      of: [
        {
          type: 'object',
          name: 'partner',
          fields: [
            {
              name: 'name',
              type: 'string',
              title: 'Partner name',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'logo',
              type: 'image',
              title: 'Logo',
              options: imageAssetOptions,
              fields: [{name: 'alt', type: 'string', title: 'Alt text'}],
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              type: 'url',
              title: 'Website (optional)',
            },
          ],
          preview: {
            select: {title: 'name', media: 'logo'},
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'logoBoxLabel',
      title: 'Logo box label',
      type: 'string',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      initialValue: 'contact@wereklub.com',
    }),
    defineField({
      name: 'bookingEmail',
      title: 'Booking email',
      type: 'string',
      initialValue: 'booking@wereklub.com',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Agency'}),
  },
})
