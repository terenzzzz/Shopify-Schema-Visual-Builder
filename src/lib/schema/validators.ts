import type {
  BlockDefinition,
  SchemaDocument,
  SettingField,
  ValidationIssue,
} from '@/types/schema'

const isBlank = (value?: string) => !value || value.trim().length === 0

const validateField = (field: SettingField, path: string): ValidationIssue[] => {
  const issues: ValidationIssue[] = []

  if (field.type === 'header') {
    if (isBlank(field.content)) {
      issues.push({ path, message: 'header 的 content 不能为空', severity: 'error' })
    }

    return issues
  }

  if (isBlank(field.id)) {
    issues.push({ path, message: '字段 id 不能为空', severity: 'error' })
  }

  if (isBlank(field.label)) {
    issues.push({ path, message: '字段 label 不能为空', severity: 'error' })
  }

  if ((field.type === 'select' || field.type === 'radio') && field.options.length === 0) {
    issues.push({ path, message: '选项类字段至少需要一个 option', severity: 'error' })
  }

  if (field.type === 'range') {
    if (field.min > field.max) {
      issues.push({ path, message: 'range 的 min 不能大于 max', severity: 'error' })
    }

    if (field.step <= 0) {
      issues.push({ path, message: 'range 的 step 必须大于 0', severity: 'error' })
    }
  }

  return issues
}

const validateBlock = (block: BlockDefinition, index: number): ValidationIssue[] => {
  const path = `blocks[${index}]`
  const issues: ValidationIssue[] = []

  if (isBlank(block.type)) {
    issues.push({ path, message: 'block.type 不能为空', severity: 'error' })
  }

  if (isBlank(block.name)) {
    issues.push({ path, message: 'block.name 不能为空', severity: 'error' })
  }

  block.settings.forEach((field, fieldIndex) => {
    issues.push(...validateField(field, `${path}.settings[${fieldIndex}]`))
  })

  return issues
}

export const validateSchemaDocument = (
  document: SchemaDocument,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = []

  if (isBlank(document.name)) {
    issues.push({ path: 'name', message: 'section name 不能为空', severity: 'error' })
  }

  if (isBlank(document.tag)) {
    issues.push({ path: 'tag', message: 'section tag 不能为空', severity: 'error' })
  }

  document.settings.forEach((field, index) => {
    issues.push(...validateField(field, `settings[${index}]`))
  })

  document.blocks.forEach((block, index) => {
    issues.push(...validateBlock(block, index))
  })

  document.presets.forEach((preset, index) => {
    if (isBlank(preset.name)) {
      issues.push({
        path: `presets[${index}]`,
        message: 'preset.name 不能为空',
        severity: 'error',
      })
    }
  })

  return issues
}
