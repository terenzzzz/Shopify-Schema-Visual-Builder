import sampleSchema from '@/mocks/sample-schema.json'

import { parseSchemaInput } from './parser'
import { serializeSchemaDocument, stringifySchemaDocument } from './serializer'

describe('serializeSchemaDocument', () => {
  it('serializes a normalized document back to raw schema shape', () => {
    const { document } = parseSchemaInput(sampleSchema)
    const serialized = serializeSchemaDocument(document)

    expect(serialized.name).toBe(sampleSchema.name)
    expect(serialized.settings?.[0]).toMatchObject({
      type: 'header',
      content: 'Build faster with schema',
    })
    expect(serialized.settings?.[4]).toMatchObject({
      type: 'select',
      id: 'layout',
      default: 'split',
    })
    expect(serialized.blocks?.[0].type).toBe('feature')
  })

  it('stringifies document as pretty JSON', () => {
    const { document } = parseSchemaInput(sampleSchema)
    const json = stringifySchemaDocument(document)

    expect(() => JSON.parse(json)).not.toThrow()
    expect(json).toContain('"settings"')
    expect(json).toContain('"blocks"')
  })

  it('serializes customAttributes back to raw schema keys', () => {
    const { document } = parseSchemaInput(sampleSchema)
    document.settings[1] = {
      ...document.settings[1],
      customAttributes: {
        dynamic: true,
        min_chars: 8,
      },
    }

    const serialized = serializeSchemaDocument(document)

    expect(serialized.settings?.[1]).toMatchObject({
      dynamic: true,
      min_chars: 8,
    })
  })
})
