export const SHOPIFY_SETTING_TYPES = [
  'header',
  'text',
  'textarea',
  'richtext',
  'image_picker',
  'select',
  'checkbox',
  'radio',
  'range',
  'color',
] as const

export type ShopifySettingType = (typeof SHOPIFY_SETTING_TYPES)[number]

/** 通过「新增字段」弹窗创建 setting 时携带的可选初始值 */
export interface AddSettingFieldPayload {
  type: ShopifySettingType
  initial?: Record<string, unknown>
}

export interface SettingOption {
  value: string
  label: string
}

export interface BaseSettingNode {
  uid: string
  type: ShopifySettingType
  errors: string[]
  customAttributes?: Record<string, unknown>
}

export interface BaseSettingField extends BaseSettingNode {
  id: string
  label: string
  info?: string
  placeholder?: string
  visible_if?: string
  default?: string | number | boolean
}

export interface HeaderField extends BaseSettingNode {
  type: 'header'
  content: string
}

export interface TextLikeField extends BaseSettingField {
  type: 'text' | 'textarea' | 'richtext'
  default?: string
}

export interface ImagePickerField extends BaseSettingField {
  type: 'image_picker'
  default?: string
}

export interface SelectField extends BaseSettingField {
  type: 'select'
  options: SettingOption[]
  default?: string
}

export interface RadioField extends BaseSettingField {
  type: 'radio'
  options: SettingOption[]
  default?: string
}

export interface CheckboxField extends BaseSettingField {
  type: 'checkbox'
  default?: boolean
}

export interface RangeField extends BaseSettingField {
  type: 'range'
  min: number
  max: number
  step: number
  unit?: string
  default?: number
}

export interface ColorField extends BaseSettingField {
  type: 'color'
  default?: string
}

export type SettingField =
  | HeaderField
  | TextLikeField
  | ImagePickerField
  | SelectField
  | RadioField
  | CheckboxField
  | RangeField
  | ColorField

export interface BlockDefinition {
  uid: string
  type: string
  name: string
  limit?: number
  settings: SettingField[]
  errors: string[]
}

export interface PresetDefinition {
  uid: string
  name: string
  category?: string
  blocks?: string[]
}

export interface SchemaDocument {
  uid: string
  name: string
  tag: string
  class: string
  settings: SettingField[]
  blocks: BlockDefinition[]
  presets: PresetDefinition[]
  errors: string[]
}

export interface ValidationIssue {
  path: string
  message: string
  severity: 'error' | 'warning'
}

export interface ParseSchemaResult {
  document: SchemaDocument
  validationIssues: ValidationIssue[]
}

export interface RawSchemaHeaderSetting {
  type: 'header'
  content?: string
}

export interface RawSchemaSettingBase {
  type: Exclude<ShopifySettingType, 'header'>
  id?: string
  label?: string
  info?: string
  placeholder?: string
  visible_if?: string
  default?: string | number | boolean
}

export interface RawRangeSetting extends RawSchemaSettingBase {
  type: 'range'
  min?: number
  max?: number
  step?: number
  unit?: string
  default?: number
}

export interface RawChoiceSetting extends RawSchemaSettingBase {
  type: 'select' | 'radio'
  options?: SettingOption[]
  default?: string
}

export interface RawCheckboxSetting extends RawSchemaSettingBase {
  type: 'checkbox'
  default?: boolean
}

export type RawSchemaSetting =
  | RawSchemaHeaderSetting
  | RawSchemaSettingBase
  | RawRangeSetting
  | RawChoiceSetting
  | RawCheckboxSetting

export interface RawSchemaBlock {
  type?: string
  name?: string
  limit?: number
  settings?: RawSchemaSetting[]
}

export interface RawSchemaPreset {
  name?: string
  category?: string
  blocks?: string[]
}

export interface RawSchemaDocument {
  name?: string
  tag?: string
  class?: string
  settings?: RawSchemaSetting[]
  blocks?: RawSchemaBlock[]
  presets?: RawSchemaPreset[]
}
