import {defineArrayMember, type ImageOptions, type Rule} from 'sanity'

/** Hotspot + metadata for previews; works with Studio drag-and-drop uploads. */
export const imageAssetOptions = {
  hotspot: true,
  metadata: ['lqip', 'palette', 'image'],
} satisfies ImageOptions

/** Use on every `array` of images for the grid + batch drop zone UI. */
export const imageArrayFieldOptions = {
  layout: 'grid' as const,
}

type ImageMemberField = {
  name: string
  title?: string
  type: string
  options?: {isHighlighted?: boolean}
  validation?: (rule: Rule) => Rule
}

/** Standard array member for image galleries and carousels. */
export function imageArrayMember(fields: ImageMemberField[] = []) {
  return defineArrayMember({
    type: 'image',
    options: imageAssetOptions,
    ...(fields.length > 0 ? {fields} : {}),
  })
}
