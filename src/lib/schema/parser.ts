import {
  createBlock,
  createEmptySchemaDocument,
  createOption,
  createPreset,
  createSetting,
} from '@/lib/schema/defaults'
import { validateSchemaDocument } from '@/lib/schema/validators'
import type {
  CheckboxField,
  ColorField,
  HeaderField,
  ImagePickerField,
  ParseSchemaResult,
  RangeField,
  RawSchemaBlock,
  RawSchemaDocument,
  RawSchemaPreset,
  RawSchemaSetting,
  RadioField,
  SettingField,
  SettingOption,
  SelectField,
  ShopifySettingType,
  TextLikeField,
} from '@/types/schema'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback

const asNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const normalizeSettingType = (value: unknown): ShopifySettingType => {
  if (typeof value !== 'string') {
    return 'text'
  }

  switch (value.trim().toLowerCase()) {
    case 'header':
    case 'heading':
      return 'header'
    case 'text':
      return 'text'
    case 'textarea':
      return 'textarea'
    case 'richtext':
      return 'richtext'
    case 'image_picker':
      return 'image_picker'
    case 'select':
      return 'select'
    case 'checkbox':
      return 'checkbox'
    case 'radio':
      return 'radio'
    case 'range':
      return 'range'
    case 'color':
      return 'color'
    default:
      return 'text'
  }
}

const normalizeOptions = (options: unknown): SettingOption[] => {
  if (!Array.isArray(options)) {
    return []
  }

  return options.map((option) => {
    if (isRecord(option)) {
      return createOption({
        value: asString(option.value, 'option_value'),
        label: asString(option.label, 'Option label'),
      })
    }

    return createOption()
  })
}

const extractCustomAttributes = (
  input: Record<string, unknown>,
  knownKeys: string[],
): Record<string, unknown> | undefined => {
  const knownSet = new Set(knownKeys)
  const entries = Object.entries(input).filter(([key]) => !knownSet.has(key))
  if (!entries.length) return undefined
  return Object.fromEntries(entries)
}

const normalizeSetting = (input: RawSchemaSetting): SettingField => {
  const type = normalizeSettingType(input.type)

  switch (type) {
    case 'header': {
      const fieldInput = input as unknown as Record<string, unknown>
      const base = createSetting('header') as HeaderField
      return {
        ...base,
        content: asString((input as { content?: unknown }).content, base.content),
        customAttributes: extractCustomAttributes(fieldInput, ['type', 'content']),
      }
    }
    case 'text':
    case 'textarea':
    case 'richtext': {
      const fieldInput = input as {
        id?: unknown
        label?: unknown
        info?: unknown
        placeholder?: unknown
        visible_if?: unknown
        default?: unknown
      }
      const base = createSetting(type) as TextLikeField
      return {
        ...base,
        id: asString(fieldInput.id, base.id),
        label: asString(fieldInput.label, base.label),
        info: asString(fieldInput.info),
        placeholder: asString(fieldInput.placeholder),
        visible_if: asString(fieldInput.visible_if),
        default: asString(fieldInput.default),
        customAttributes: extractCustomAttributes(fieldInput as Record<string, unknown>, [
          'type',
          'id',
          'label',
          'info',
          'placeholder',
          'visible_if',
          'default',
        ]),
      }
    }
    case 'image_picker': {
      const fieldInput = input as {
        id?: unknown
        label?: unknown
        info?: unknown
        visible_if?: unknown
        default?: unknown
      }
      const base = createSetting('image_picker') as ImagePickerField
      return {
        ...base,
        id: asString(fieldInput.id, base.id),
        label: asString(fieldInput.label, base.label),
        info: asString(fieldInput.info),
        visible_if: asString(fieldInput.visible_if),
        default: asString(fieldInput.default),
        customAttributes: extractCustomAttributes(fieldInput as Record<string, unknown>, [
          'type',
          'id',
          'label',
          'info',
          'visible_if',
          'default',
        ]),
      }
    }
    case 'select': {
      const fieldInput = input as {
        id?: unknown
        label?: unknown
        info?: unknown
        visible_if?: unknown
        default?: unknown
        options?: unknown
      }
      const base = createSetting('select') as SelectField
      return {
        ...base,
        id: asString(fieldInput.id, base.id),
        label: asString(fieldInput.label, base.label),
        info: asString(fieldInput.info),
        visible_if: asString(fieldInput.visible_if),
        default: asString(fieldInput.default),
        options: normalizeOptions(fieldInput.options),
        customAttributes: extractCustomAttributes(fieldInput as Record<string, unknown>, [
          'type',
          'id',
          'label',
          'info',
          'visible_if',
          'default',
          'options',
        ]),
      }
    }
    case 'radio': {
      const fieldInput = input as {
        id?: unknown
        label?: unknown
        info?: unknown
        visible_if?: unknown
        default?: unknown
        options?: unknown
      }
      const base = createSetting('radio') as RadioField
      return {
        ...base,
        id: asString(fieldInput.id, base.id),
        label: asString(fieldInput.label, base.label),
        info: asString(fieldInput.info),
        visible_if: asString(fieldInput.visible_if),
        default: asString(fieldInput.default),
        options: normalizeOptions(fieldInput.options),
        customAttributes: extractCustomAttributes(fieldInput as Record<string, unknown>, [
          'type',
          'id',
          'label',
          'info',
          'visible_if',
          'default',
          'options',
        ]),
      }
    }
    case 'checkbox': {
      const fieldInput = input as {
        id?: unknown
        label?: unknown
        info?: unknown
        visible_if?: unknown
        default?: unknown
      }
      const base = createSetting('checkbox') as CheckboxField
      return {
        ...base,
        id: asString(fieldInput.id, base.id),
        label: asString(fieldInput.label, base.label),
        info: asString(fieldInput.info),
        visible_if: asString(fieldInput.visible_if),
        default: typeof fieldInput.default === 'boolean' ? fieldInput.default : false,
        customAttributes: extractCustomAttributes(fieldInput as Record<string, unknown>, [
          'type',
          'id',
          'label',
          'info',
          'visible_if',
          'default',
        ]),
      }
    }
    case 'range': {
      const fieldInput = input as {
        id?: unknown
        label?: unknown
        info?: unknown
        visible_if?: unknown
        min?: unknown
        max?: unknown
        step?: unknown
        unit?: unknown
        default?: unknown
      }
      const base = createSetting('range') as RangeField
      return {
        ...base,
        id: asString(fieldInput.id, base.id),
        label: asString(fieldInput.label, base.label),
        info: asString(fieldInput.info),
        visible_if: asString(fieldInput.visible_if),
        min: asNumber(fieldInput.min, 0),
        max: asNumber(fieldInput.max, 100),
        step: asNumber(fieldInput.step, 1),
        unit: asString(fieldInput.unit),
        default: asNumber(fieldInput.default, 0),
        customAttributes: extractCustomAttributes(fieldInput as Record<string, unknown>, [
          'type',
          'id',
          'label',
          'info',
          'visible_if',
          'min',
          'max',
          'step',
          'unit',
          'default',
        ]),
      }
    }
    case 'color': {
      const fieldInput = input as {
        id?: unknown
        label?: unknown
        info?: unknown
        visible_if?: unknown
        default?: unknown
      }
      const base = createSetting('color') as ColorField
      return {
        ...base,
        id: asString(fieldInput.id, base.id),
        label: asString(fieldInput.label, base.label),
        info: asString(fieldInput.info),
        visible_if: asString(fieldInput.visible_if),
        default: asString(fieldInput.default, '#111111'),
        customAttributes: extractCustomAttributes(fieldInput as Record<string, unknown>, [
          'type',
          'id',
          'label',
          'info',
          'visible_if',
          'default',
        ]),
      }
    }
  }
}

const normalizeSettings = (settings: unknown): SettingField[] => {
  if (!Array.isArray(settings)) {
    return []
  }

  return settings.map((setting) => {
    if (isRecord(setting)) {
      return normalizeSetting(setting as unknown as RawSchemaSetting)
    }

    return createSetting('text')
  })
}

const normalizeBlock = (block: RawSchemaBlock) =>
  createBlock({
    type: asString(block.type, 'custom_block'),
    name: asString(block.name, 'Custom block'),
    limit: typeof block.limit === 'number' ? block.limit : undefined,
    settings: normalizeSettings(block.settings),
  })

const normalizePreset = (preset: RawSchemaPreset) =>
  createPreset({
    name: asString(preset.name, 'Default preset'),
    category: asString(preset.category, 'Custom'),
    blocks: Array.isArray(preset.blocks)
      ? preset.blocks.filter((item): item is string => typeof item === 'string')
      : [],
  })

export const parseSchemaInput = (input: unknown): ParseSchemaResult => {
  const fallback = createEmptySchemaDocument()

  if (!isRecord(input)) {
    const validationIssues = validateSchemaDocument(fallback)
    return {
      document: fallback,
      validationIssues: [
        ...validationIssues,
        {
          path: 'root',
          message: 'schema 根节点必须是对象',
          severity: 'error',
        },
      ],
    }
  }

  const rawInput = input as RawSchemaDocument
  const document = {
    ...fallback,
    name: asString(rawInput.name, fallback.name),
    tag: asString(rawInput.tag, fallback.tag),
    class: asString(rawInput.class, ''),
    settings: normalizeSettings(rawInput.settings),
    blocks: Array.isArray(rawInput.blocks)
      ? rawInput.blocks.map((block) =>
          isRecord(block) ? normalizeBlock(block as RawSchemaBlock) : createBlock(),
        )
      : [],
    presets: Array.isArray(rawInput.presets)
      ? rawInput.presets.map((preset) =>
          isRecord(preset) ? normalizePreset(preset as RawSchemaPreset) : createPreset(),
        )
      : [],
  }

  return {
    document,
    validationIssues: validateSchemaDocument(document),
  }
}
