import sampleSchema from '@/mocks/sample-schema.json'

import { parseSchemaInput } from './parser'

describe('parseSchemaInput', () => {
  it('parses the sample schema into a normalized document', () => {
    const result = parseSchemaInput(sampleSchema)

    expect(result.document.name).toBe('Hero Banner')
    expect(result.document.settings[0].type).toBe('header')
    expect(result.document.settings[0]).toMatchObject({
      content: 'Build faster with schema',
    })
    expect(result.document.settings).toHaveLength(9)
    expect(result.document.blocks).toHaveLength(1)
    expect(result.document.blocks[0].settings).toHaveLength(3)
    expect(result.validationIssues).toHaveLength(0)
  })

  it('normalizes header aliases into header', () => {
    const result = parseSchemaInput({
      name: 'Alias demo',
      tag: 'section',
      settings: [
        {
          type: 'Heading',
          content: 'Alias supported',
        },
      ],
    })

    expect(result.document.settings[0].type).toBe('header')
    expect(result.document.settings[0]).toMatchObject({
      content: 'Alias supported',
    })
    expect(result.validationIssues).toHaveLength(0)
  })

  it('falls back gracefully when root is not an object', () => {
    const result = parseSchemaInput('invalid-root')

    expect(result.document.name).toBe('Schema Visual Builder')
    expect(result.validationIssues.some((issue) => issue.path === 'root')).toBe(true)
  })

  it('preserves unknown setting keys into customAttributes', () => {
    const result = parseSchemaInput({
      name: 'Custom attrs',
      tag: 'section',
      settings: [
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Hello',
          dynamic: true,
          extra_limit: 3,
          meta: { source: 'custom' },
        },
      ],
    })

    expect(result.document.settings[0]).toMatchObject({
      type: 'text',
      customAttributes: {
        dynamic: true,
        extra_limit: 3,
        meta: { source: 'custom' },
      },
    })
  })
})
