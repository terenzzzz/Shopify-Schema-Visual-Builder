import type {
  BlockDefinition,
  CheckboxField,
  ColorField,
  HeaderField,
  ImagePickerField,
  PresetDefinition,
  RangeField,
  RawSchemaBlock,
  RawSchemaDocument,
  RawSchemaPreset,
  RawSchemaSetting,
  SchemaDocument,
  SelectField,
  SettingField,
  TextLikeField,
} from '@/types/schema'

const cleanString = (value?: string) => (value && value.trim().length > 0 ? value : undefined)
const serializeStringDefault = (value?: string) => {
  const cleanedDefault = cleanString(value)
  return cleanedDefault === undefined ? {} : { default: cleanedDefault }
}

const RESERVED_SETTING_KEYS = new Set([
  'type',
  'id',
  'label',
  'info',
  'placeholder',
  'visible_if',
  'default',
  'content',
  'options',
  'min',
  'max',
  'step',
  'unit',
])

const serializeCustomAttributes = (customAttributes?: Record<string, unknown>) => {
  if (!customAttributes) return {}
  const entries = Object.entries(customAttributes).filter(
    ([key, value]) => key.trim().length > 0 && !RESERVED_SETTING_KEYS.has(key) && value !== undefined,
  )
  if (!entries.length) return {}
  return Object.fromEntries(entries)
}

const serializeField = (field: SettingField): RawSchemaSetting => {
  if (field.type === 'header') {
    return {
      type: 'header',
      content: cleanString((field as HeaderField).content),
      ...serializeCustomAttributes(field.customAttributes),
    }
  }

  const base = {
    type: field.type,
    id: cleanString(field.id),
    label: cleanString(field.label),
    info: cleanString(field.info),
    placeholder: cleanString(field.placeholder),
    visible_if: cleanString(field.visible_if),
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'richtext':
      return {
        ...base,
        ...serializeStringDefault((field as TextLikeField).default),
        ...serializeCustomAttributes(field.customAttributes),
      }
    case 'image_picker':
      return {
        ...base,
        ...serializeStringDefault((field as ImagePickerField).default),
        ...serializeCustomAttributes(field.customAttributes),
      }
    case 'select':
    case 'radio':
      return {
        ...base,
        ...serializeStringDefault((field as SelectField).default),
        options: (field as SelectField).options.map((option) => ({
          value: option.value,
          label: option.label,
        })),
        ...serializeCustomAttributes(field.customAttributes),
      }
    case 'checkbox':
      return {
        ...base,
        default: (field as CheckboxField).default ?? false,
        ...serializeCustomAttributes(field.customAttributes),
      }
    case 'range':
      return {
        ...base,
        min: (field as RangeField).min,
        max: (field as RangeField).max,
        step: (field as RangeField).step,
        unit: cleanString((field as RangeField).unit),
        default: (field as RangeField).default ?? (field as RangeField).min,
        ...serializeCustomAttributes(field.customAttributes),
      }
    case 'color':
      return {
        ...base,
        default: (field as ColorField).default ?? '#111111',
        ...serializeCustomAttributes(field.customAttributes),
      }
  }
}

const serializeBlock = (block: BlockDefinition): RawSchemaBlock => ({
  type: cleanString(block.type),
  name: cleanString(block.name),
  limit: block.limit,
  settings: block.settings.map(serializeField),
})

const serializePreset = (preset: PresetDefinition): RawSchemaPreset => ({
  name: cleanString(preset.name),
  category: cleanString(preset.category),
  blocks: preset.blocks?.length ? preset.blocks : undefined,
})

export const serializeSchemaDocument = (
  document: SchemaDocument,
): RawSchemaDocument => ({
  name: cleanString(document.name),
  tag: cleanString(document.tag),
  class: cleanString(document.class),
  settings: document.settings.map(serializeField),
  blocks: document.blocks.map(serializeBlock),
  presets: document.presets.map(serializePreset),
})

export const stringifySchemaDocument = (
  document: SchemaDocument,
  spacing = 2,
) => JSON.stringify(serializeSchemaDocument(document), null, spacing)
