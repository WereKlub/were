import {defineField, type FieldDefinition} from 'sanity'
import {panelColorOptions, textColorOptions} from '../../../lib/theme/colorPresets'

const dropdownLayout = {layout: 'dropdown' as const}

export function panelColorField(overrides: {
  name?: string
  title?: string
  description?: string
  initialValue?: string
  required?: boolean
} = {}): FieldDefinition {
  const {
    name = 'panelColor',
    title = 'Panel color',
    description = 'Background for the text panel. Pick a solid or gradient preset.',
    initialValue = 'lime-500',
    required = true,
  } = overrides

  return defineField({
    name,
    title,
    type: 'string',
    description,
    initialValue,
    options: {
      list: panelColorOptions(),
      ...dropdownLayout,
    },
    validation: required ? (Rule) => Rule.required() : undefined,
  })
}

export function optionalPanelColorField(overrides: {
  name?: string
  title?: string
  description?: string
} = {}): FieldDefinition {
  const {
    name = 'cardBackgroundColor',
    title = 'List card panel color',
    description =
      'Color beside the flyer on home and events pages. Leave empty for automatic cream / ink alternation.',
  } = overrides

  return defineField({
    name,
    title,
    type: 'string',
    description,
    options: {
      list: [{title: 'Automatic (cream / ink)', value: ''}, ...panelColorOptions()],
      ...dropdownLayout,
    },
  })
}

export function textColorField(overrides: {
  name?: string
  title?: string
  description?: string
} = {}): FieldDefinition {
  const {
    name = 'cardTextColor',
    title = 'List card text color',
    description =
      'Text on the panel. Leave empty to pick automatically from the background (or preset default for gradients).',
  } = overrides

  return defineField({
    name,
    title,
    type: 'string',
    description,
    options: {
      list: [{title: 'Automatic', value: ''}, ...textColorOptions()],
      ...dropdownLayout,
    },
  })
}
