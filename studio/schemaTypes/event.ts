import {Rule} from 'sanity'

export default {
  name: 'event',
  title: 'Event',
  type: 'document',
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'location', title: 'Location'},
    {name: 'media', title: 'Media'},
    {name: 'tickets', title: 'Tickets'},
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'eventDateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
    {
      title: 'Oldest first',
      name: 'eventDateAsc',
      by: [{field: 'date', direction: 'asc'}],
    },
    {
      title: 'A–Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Z–A',
      name: 'titleDesc',
      by: [{field: 'title', direction: 'desc'}],
    },
  ],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'details',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      group: 'details',
    },
    {
      name: 'number',
      title: 'Number',
      type: 'string',
      group: 'details',
      description: 'Shown on events list (e.g. S01, 016).',
      validation: (Rule: Rule) =>
        Rule.required()
          .regex(/^[A-Za-z0-9]{1,20}$/, {
            name: 'alphanumeric',
            invert: false,
          })
          .custom((value: string) => {
            if (value && /^0\d+$/.test(value)) {
              return true
            }
            return true
          }),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'eventType',
      title: 'Event type',
      type: 'string',
      group: 'details',
      options: {
        list: [
          {title: 'Concert', value: 'concert'},
          {title: 'Festival', value: 'festival'},
          {title: 'Party', value: 'party'},
          {title: 'Meet-up', value: 'meetup'},
          {title: 'Workshop', value: 'workshop'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'date',
      title: 'Date & Time',
      type: 'datetime',
      group: 'details',
      options: {dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm', timeStep: 15},
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'object',
      group: 'details',
      fields: [
        {
          name: 'en',
          title: 'English',
          type: 'text',
        },
        {
          name: 'fr',
          title: 'French',
          type: 'text',
        },
      ],
    },
    {
      name: 'hostedBy',
      title: 'Hosted by',
      type: 'string',
      group: 'details',
    },
    {
      name: 'ageRestriction',
      title: 'Age restriction',
      type: 'string',
      group: 'details',
    },
    {
      name: 'location',
      title: 'Venue',
      type: 'object',
      group: 'location',
      fields: [
        {name: 'venueName', title: 'Venue name', type: 'string'},
        {name: 'address', title: 'Address', type: 'text'},
        {name: 'googleMapsUrl', title: 'Google Maps URL', type: 'url'},
        {
          name: 'yangoUrl',
          title: 'Yango URL',
          type: 'url',
          description: 'Yango ride link to venue.',
        },
      ],
    },
    {
      name: 'venueDetails',
      title: 'Venue details',
      description: 'Parking, access, etc.',
      type: 'object',
      group: 'location',
      fields: [
        {
          name: 'en',
          title: 'English',
          type: 'text',
        },
        {
          name: 'fr',
          title: 'French',
          type: 'text',
        },
      ],
    },
    {
      name: 'flyer',
      title: 'Flyer',
      type: 'image',
      group: 'media',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'caption',
          title: 'Caption',
          type: 'string',
          options: {isHighlighted: true},
        },
      ],
    },
    {
      name: 'cardBackgroundColor',
      title: 'List card panel color',
      type: 'string',
      group: 'media',
      description:
        'Hex color for the text panel beside the flyer on the home and events pages (e.g. #e8f547). Pick a tone from the flyer. Leave empty for automatic alternating colors.',
      validation: (Rule: Rule) =>
        Rule.custom((value: string | undefined) => {
          if (!value) return true
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
            ? true
            : 'Use a valid hex color like #e8f547'
        }),
    },
    {
      name: 'cardTextColor',
      title: 'List card text color',
      type: 'string',
      group: 'media',
      description:
        'Optional hex text color on the panel. If empty, light or dark text is chosen automatically from the panel color.',
      validation: (Rule: Rule) =>
        Rule.custom((value: string | undefined) => {
          if (!value) return true
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
            ? true
            : 'Use a valid hex color like #1a1a1a'
        }),
    },
    {
      name: 'lineup',
      title: 'Lineup',
      type: 'array',
      group: 'media',
      of: [
        {
          name: 'artistReference',
          title: 'Artist',
          type: 'reference',
          to: [{type: 'artist'}],
          preview: {
            select: {
              title: 'reference.name',
              media: 'reference.image',
            },
          },
        },
      ],
    },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'media',
      description: 'Photos shown on the event page.',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'caption', title: 'Caption', type: 'string', options: {isHighlighted: true}},
          ],
        },
      ],
    },
    {
      name: 'ticketsAvailable',
      title: 'Tickets on sale',
      type: 'boolean',
      group: 'tickets',
      initialValue: true,
    },
    {
      name: 'ticketTypes',
      title: 'Tickets',
      type: 'array',
      group: 'tickets',
      of: [
        {
          name: 'ticketType',
          title: 'Ticket',
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'price',
              title: 'Price (XOF)',
              type: 'number',
              validation: (Rule: Rule) => Rule.required().min(0),
            },
            {
              name: 'productId',
              title: 'lomi product ID',
              type: 'string',
              description: 'Optional.',
            },
            {
              name: 'description',
              title: 'Short description',
              type: 'string',
            },
            {
              name: 'details',
              title: 'Details',
              type: 'text',
            },
            {
              name: 'stock',
              title: 'Stock',
              type: 'number',
              description: 'Leave empty or set 0 for sold out.',
              validation: (Rule: Rule) => Rule.integer().min(0),
            },
            {
              name: 'active',
              title: 'Active',
              type: 'boolean',
              initialValue: true,
            },
            {
              name: 'salesStart',
              title: 'Sales start',
              type: 'datetime',
              options: {dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm'},
            },
            {
              name: 'salesEnd',
              title: 'Sales end',
              type: 'datetime',
              options: {dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm'},
            },
          ],
          preview: {
            select: {
              title: 'name',
              price: 'price',
              stock: 'stock',
              description: 'description',
              details: 'details',
            },
            prepare({
              title,
              price,
              stock,
              description,
              details,
            }: {
              title: string
              price: number
              stock: number
              description?: string
              details?: string
            }) {
              let subtitle = `${price} XOF`
              if (stock !== undefined && stock !== null) {
                subtitle += ` - ${stock} left`
              } else {
                subtitle += ` - Unlimited`
              }
              const previewDesc = description || details || ''
              subtitle += ` | ${previewDesc}`.trim()
              return {
                title: title,
                subtitle: subtitle.substring(0, 80) + (subtitle.length > 80 ? '...' : ''),
              }
            },
          },
        },
      ],
    },
    {
      name: 'bundles',
      title: 'Bundles',
      type: 'array',
      group: 'tickets',
      of: [
        {
          name: 'bundle',
          title: 'Bundle',
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'bundleId',
              title: 'Bundle ID',
              type: 'slug',
              options: {source: 'name', maxLength: 50},
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'price',
              title: 'Price (XOF)',
              type: 'number',
              validation: (Rule: Rule) => Rule.required().min(0),
            },
            {
              name: 'productId',
              title: 'lomi product ID',
              type: 'string',
              description: 'Optional.',
            },
            {
              name: 'ticketsIncluded',
              title: 'Tickets per bundle',
              type: 'number',
              initialValue: 1,
              validation: (Rule: Rule) => Rule.required().integer().min(1),
            },
            {
              name: 'description',
              title: 'Short description',
              type: 'string',
            },
            {
              name: 'details',
              title: 'Details',
              type: 'text',
            },
            {
              name: 'stock',
              title: 'Stock',
              type: 'number',
              description: 'Leave empty or set 0 for sold out.',
              validation: (Rule: Rule) => Rule.integer().min(0),
            },
            {
              name: 'active',
              title: 'Active',
              type: 'boolean',
              initialValue: true,
            },
            {
              name: 'salesStart',
              title: 'Sales start',
              type: 'datetime',
              options: {dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm'},
            },
            {
              name: 'salesEnd',
              title: 'Sales end',
              type: 'datetime',
              options: {dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm'},
            },
          ],
          preview: {
            select: {
              title: 'name',
              price: 'price',
              description: 'description',
              details: 'details',
            },
            prepare({
              title,
              price,
              description,
              details,
            }: {
              title: string
              price: number
              description?: string
              details?: string
            }) {
              const subtitle = `${price} XOF | ${description || details || ''}`.trim()
              return {
                title: title,
                subtitle: subtitle.substring(0, 80) + (subtitle.length > 80 ? '...' : ''),
              }
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      date: 'date',
      venue: 'location.venueName',
      media: 'flyer',
    },
    prepare({
      title,
      subtitle,
      date,
      venue,
      media,
    }: {
      title: string
      subtitle?: string
      date: string
      venue?: string
      media: any
    }) {
      const formattedDate = date ? new Date(date).toLocaleDateString() : 'No date'
      const previewSubtitle = [subtitle, venue, formattedDate].filter(Boolean).join(' | ')

      return {
        title: title,
        subtitle: previewSubtitle,
        media: media,
      }
    },
  },
}
