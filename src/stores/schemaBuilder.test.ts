import { createPinia, setActivePinia } from 'pinia'

import sampleSchema from '@/mocks/sample-schema.json'

import { useSchemaBuilderStore } from './schemaBuilder'

describe('useSchemaBuilderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps the last valid UI state when JSON draft is invalid', () => {
    const store = useSchemaBuilderStore()
    store.initialize(sampleSchema)

    const previousName = store.schemaDocument.name
    const applied = store.applyEditorDraft('{ invalid json')

    expect(applied).toBe(false)
    expect(store.parseErrors.length).toBeGreaterThan(0)
    expect(store.schemaDocument.name).toBe(previousName)
  })

  it('reorders blocks deterministically', () => {
    const store = useSchemaBuilderStore()
    store.initialize({
      ...sampleSchema,
      blocks: [
        ...sampleSchema.blocks,
        {
          type: 'cta',
          name: 'CTA',
          settings: [],
        },
      ],
    })

    expect(store.schemaDocument.blocks.map((block) => block.type)).toEqual(['feature', 'cta'])

    store.moveBlock(0, 1)

    expect(store.schemaDocument.blocks.map((block) => block.type)).toEqual(['cta', 'feature'])
  })

  it('reorders section settings deterministically', () => {
    const store = useSchemaBuilderStore()
    store.initialize(sampleSchema)

    expect(store.schemaDocument.settings.map((field) => field.type)).toEqual([
      'header',
      'textarea',
      'richtext',
      'image_picker',
      'select',
      'checkbox',
      'radio',
      'range',
      'color',
    ])

    store.moveSectionSetting(0, 2)

    expect(store.schemaDocument.settings.map((field) => field.type)).toEqual([
      'textarea',
      'header',
      'richtext',
      'image_picker',
      'select',
      'checkbox',
      'radio',
      'range',
      'color',
    ])
  })
})
