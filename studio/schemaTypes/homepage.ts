import {defineType, defineField} from 'sanity'
import {imageArrayFieldOptions, imageAssetOptions} from './shared/image'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'defaultShippingCost',
      title: 'Shipping cost (F CFA)',
      type: 'number',
      description: '0 = free shipping.',
      initialValue: 3000,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'promoEvent',
      title: 'Promoted event',
      type: 'reference',
      to: [{type: 'event'}],
      description: 'Shows as floating promo on homepage.',
    }),
    defineField({
      name: 'showBlogInNavigation',
      title: 'Show blog in menu',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showBoutiqueInNavigation',
      title: 'Show boutique in menu',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'primaryButtonColor',
      title: 'Primary button color',
      type: 'string',
      options: {
        list: [
          {title: 'Red', value: 'red'},
          {title: 'Amber', value: 'amber'},
          {title: 'Cyan', value: 'cyan'},
          {title: 'Teal', value: 'teal'},
          {title: 'Sky', value: 'sky'},
          {title: 'Pink', value: 'pink'},
          {title: 'Purple', value: 'purple'},
          {title: 'Yellow', value: 'yellow'},
          {title: 'Emerald', value: 'emerald'},
          {title: 'Blue', value: 'blue'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'teal',
      description: 'Site-wide button color.',
    }),
    defineField({
      name: 'featuredEvents',
      title: 'Featured events',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'event'}],
        },
      ],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'heroContent',
      title: 'Hero carousel',
      type: 'array',
      description: 'Images and videos shown above upcoming events. Mark slides inactive to hide them.',
      options: imageArrayFieldOptions,
      of: [
        {
          type: 'object',
          name: 'heroItem',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'type',
              title: 'Media type',
              type: 'string',
              options: {
                list: [
                  {title: 'Image', value: 'image'},
                  {title: 'Video', value: 'video'},
                ],
                layout: 'radio',
              },
              initialValue: 'image',
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: imageAssetOptions,
              hidden: ({parent}) => parent?.type !== 'image',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as {type?: string} | undefined
                  if (parent?.type === 'image' && !value?.asset) {
                    return 'Upload an image for image slides.'
                  }
                  return true
                }),
              fields: [
                {
                  name: 'alt',
                  title: 'Alt text',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string',
                },
              ],
            }),
            defineField({
              name: 'video',
              title: 'Video file',
              type: 'file',
              options: {accept: 'video/*'},
              hidden: ({parent}) => parent?.type !== 'video',
            }),
            defineField({
              name: 'videoUrl',
              title: 'Video URL',
              type: 'url',
              description: 'Optional YouTube/Vimeo/direct URL. Used if no video file is uploaded.',
              hidden: ({parent}) => parent?.type !== 'video',
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as {
                    type?: string
                    video?: {asset?: {_ref?: string}}
                  } | undefined
                  if (
                    parent?.type === 'video' &&
                    !value &&
                    !parent?.video?.asset?._ref
                  ) {
                    return 'Upload a video file or add a video URL.'
                  }
                  return true
                }),
            }),
            defineField({
              name: 'isActive',
              title: 'Active',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
              image: 'image',
              isActive: 'isActive',
            },
            prepare({title, type, image, isActive}) {
              return {
                title: title || 'Untitled slide',
                subtitle: `${type} • ${isActive ? 'Active' : 'Inactive'}`,
                media: image,
              }
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {
      promoEventTitle: 'promoEvent.title',
      heroItems: 'heroContent',
      featuredEvents: 'featuredEvents',
    },
    prepare({promoEventTitle, heroItems, featuredEvents}) {
      let previewTitle = 'Homepage'

      const counts = []
      if (heroItems?.length) counts.push(`${heroItems.length} hero`)
      if (featuredEvents?.length) counts.push(`${featuredEvents.length} event`)

      if (counts.length > 0) {
        previewTitle += ` (${counts.join(', ')})`
      }

      if (promoEventTitle) {
        previewTitle += ` • Promo: ${promoEventTitle}`
      }

      return {
        title: previewTitle,
      }
    },
  },
})
