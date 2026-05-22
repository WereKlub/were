import {defineType, defineField} from 'sanity'
import {imageAssetOptions} from './shared/image'

export default defineType({
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: imageAssetOptions,
    }),
    defineField({
      name: 'socialLink',
      title: 'Social link',
      type: 'url',
    }),
    defineField({
      name: 'isResident',
      title: 'Resident',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
    prepare({title, media}) {
      return {
        title: title,
        media: media,
      }
    },
  },
})
