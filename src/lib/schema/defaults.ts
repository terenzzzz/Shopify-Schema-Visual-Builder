import type {
  BlockDefinition,
  HeaderField,
  PresetDefinition,
  SchemaDocument,
  SettingField,
  SettingOption,
  ShopifySettingType,
} from '@/types/schema'

const createUid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`

export const createOption = (
  option: Partial<SettingOption> = {},
): SettingOption => ({
  value: option.value ?? 'option_value',
  label: option.label ?? 'Option label',
})

export const createSetting = (
  type: ShopifySettingType = 'text',
): SettingField => {
  const base = {
    uid: createUid('field'),
    type,
    errors: [],
  }

  if (type === 'header') {
    return {
      ...base,
      type,
      content: 'Header',
    }
  }

  const fieldBase = {
    ...base,
    id: `${type}_${Math.random().toString(36).slice(2, 6)}`,
    label: 'New setting',
    info: '',
    placeholder: '',
    visible_if: '',
  }

  switch (type) {
    case 'textarea':
    case 'richtext':
    case 'text':
      return {
        ...fieldBase,
        type,
        default: '',
      }
    case 'image_picker':
      return {
        ...fieldBase,
        type,
        default: '',
      }
    case 'select':
      return {
        ...fieldBase,
        type,
        default: 'option_1',
        options: [
          createOption({ value: 'option_1', label: 'Option 1' }),
          createOption({ value: 'option_2', label: 'Option 2' }),
        ],
      }
    case 'radio':
      return {
        ...fieldBase,
        type,
        default: 'option_1',
        options: [
          createOption({ value: 'option_1', label: 'Option 1' }),
          createOption({ value: 'option_2', label: 'Option 2' }),
        ],
      }
    case 'checkbox':
      return {
        ...fieldBase,
        type,
        default: false,
      }
    case 'range':
      return {
        ...fieldBase,
        type,
        min: 0,
        max: 100,
        step: 1,
        unit: 'px',
        default: 50,
      }
    case 'color':
      return {
        ...fieldBase,
        type,
        default: '#111111',
      }
  }
}

export const createPreset = (
  preset: Partial<PresetDefinition> = {},
): PresetDefinition => ({
  uid: createUid('preset'),
  name: preset.name ?? 'Default preset',
  category: preset.category ?? 'Custom',
  blocks: preset.blocks ?? [],
})

export const createBlock = (
  block: Partial<BlockDefinition> = {},
): BlockDefinition => ({
  uid: createUid('block'),
  type: block.type ?? `block_${Math.random().toString(36).slice(2, 6)}`,
  name: block.name ?? 'New block',
  limit: block.limit,
  settings: block.settings ?? [createSetting('text')],
  errors: block.errors ?? [],
})

export const createEmptySchemaDocument = (): SchemaDocument => ({
  uid: createUid('schema'),
  name: 'Schema Visual Builder',
  tag: 'section',
  class: 'shopify-schema-visual-builder',
  settings: [
    {
      ...(createSetting('header') as HeaderField),
      content: 'Schema Visual Builder',
    },
  ],
  blocks: [],
  presets: [createPreset()],
  errors: [],
})
