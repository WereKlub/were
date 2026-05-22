import {Rule} from 'sanity'
import {imageArrayFieldOptions, imageArrayMember, imageAssetOptions} from './shared/image'

export default {
  name: 'product',
  title: 'Products',
  type: 'document',
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'variants', title: 'Variants'},
    {name: 'media', title: 'Media'},
    {name: 'organization', title: 'Categories'},
    {name: 'shipping', title: 'Shipping'},
  ],
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'details',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      group: 'details',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: imageAssetOptions,
          fields: [{name: 'caption', title: 'Caption', type: 'string'}],
        },
      ],
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      group: 'media',
      options: imageArrayFieldOptions,
      of: [
        imageArrayMember([
            {
              name: 'alt',
              title: 'Alt',
              type: 'string',
              options: {isHighlighted: true},
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              options: {isHighlighted: true},
            },
        ]),
      ],
      validation: (Rule: Rule) => Rule.min(1).error('At least one image is required.'),
    },
    {
      name: 'basePrice',
      title: 'Base price (XOF)',
      type: 'number',
      group: 'variants',
      validation: (Rule: Rule) => Rule.required().min(0),
    },
    {
      name: 'colors',
      title: 'Colors',
      type: 'array',
      group: 'variants',
      initialValue: () => [
        {name: 'Noir', available: true},
        {name: 'Blanc', available: true},
      ],
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Color name',
              type: 'string',
              description: 'e.g. noir, blanc, red, mix',
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'image',
              title: 'Color image',
              type: 'image',
              options: imageAssetOptions,
            },
            {
              name: 'available',
              title: 'Available',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              name: 'name',
              available: 'available',
            },
            prepare({name, available}: {name: string; available: boolean}) {
              return {
                title: name || 'Unnamed Color',
                subtitle: available ? 'Available' : 'Unavailable',
              }
            },
          },
        },
      ],
    },
    {
      name: 'sizes',
      title: 'Sizes',
      type: 'array',
      group: 'variants',
      description: 'Uncheck to mark out of stock.',
      initialValue: () => [
        {name: 'S', available: true},
        {name: 'M', available: true},
        {name: 'L', available: true},
        {name: 'XL', available: true},
      ],
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Size',
              type: 'string',
              options: {
                list: [
                  {title: 'XXS', value: 'XXS'},
                  {title: 'XS', value: 'XS'},
                  {title: 'S', value: 'S'},
                  {title: 'M', value: 'M'},
                  {title: 'L', value: 'L'},
                  {title: 'XL', value: 'XL'},
                  {title: 'XXL', value: 'XXL'},
                  {title: '2XL', value: '2XL'},
                ],
              },
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'available',
              title: 'In stock',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              name: 'name',
              available: 'available',
            },
            prepare({name, available}: {name: string; available: boolean}) {
              return {
                title: name || 'Unnamed Size',
                subtitle: available ? 'In stock' : 'Out of stock',
              }
            },
          },
        },
      ],
    },
    {
      name: 'baseStock',
      title: 'Base stock',
      type: 'number',
      group: 'variants',
      description: 'Set 0 for sold out.',
      validation: (Rule: Rule) => Rule.integer().min(0),
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'organization',
      of: [{type: 'reference', to: {type: 'category'}}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      price: 'basePrice',
      stock: 'baseStock',
      media: 'images.0.asset',
    },
    prepare: (value: any) => {
      let subtitle = `${value.price} XOF`
      if (value.stock !== undefined && value.stock !== null) {
        subtitle += ` - ${value.stock} in stock`
      } else {
        subtitle += ` - Stock Undefined`
      }
      return {
        title: value.title,
        subtitle: subtitle,
        media: value.media,
      }
    },
  },
}
