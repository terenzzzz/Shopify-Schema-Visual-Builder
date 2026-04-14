import { toRaw } from 'vue'

import { defineStore } from 'pinia'

import { createBlock, createEmptySchemaDocument, createPreset, createSetting } from '@/lib/schema/defaults'
import { parseSchemaInput } from '@/lib/schema/parser'
import { stringifySchemaDocument } from '@/lib/schema/serializer'
import { validateSchemaDocument } from '@/lib/schema/validators'
import type {
  PresetDefinition,
  SchemaDocument,
  SettingField,
  ShopifySettingType,
  ValidationIssue,
} from '@/types/schema'

const cloneDocument = (document: SchemaDocument): SchemaDocument =>
  JSON.parse(JSON.stringify(toRaw(document))) as SchemaDocument

export const useSchemaBuilderStore = defineStore('schemaBuilder', {
  state: () => ({
    schemaDocument: createEmptySchemaDocument() as SchemaDocument,
    rawJsonDraft: '',
    parseErrors: [] as string[],
    validationIssues: [] as ValidationIssue[],
  }),

  getters: {
    hasBlockingErrors: (state) =>
      state.parseErrors.length > 0 ||
      state.validationIssues.some((issue) => issue.severity === 'error'),
  },

  actions: {
    initialize(input: unknown) {
      const { document, validationIssues } = parseSchemaInput(input)
      this.schemaDocument = document
      this.validationIssues = validationIssues
      this.parseErrors = []
      this.rawJsonDraft = stringifySchemaDocument(document)
    },

    commitDocument(nextDocument: SchemaDocument, shouldRewriteDraft = true) {
      this.schemaDocument = cloneDocument(nextDocument)
      this.validationIssues = validateSchemaDocument(this.schemaDocument)
      this.parseErrors = []

      if (shouldRewriteDraft) {
        this.rawJsonDraft = stringifySchemaDocument(this.schemaDocument)
      }
    },

    applyEditorDraft(rawJsonDraft: string) {
      this.rawJsonDraft = rawJsonDraft

      try {
        const parsed = JSON.parse(rawJsonDraft) as unknown
        const { document, validationIssues } = parseSchemaInput(parsed)
        this.schemaDocument = document
        this.validationIssues = validationIssues
        this.parseErrors = []
        return true
      } catch (error) {
        this.parseErrors = [error instanceof Error ? error.message : 'JSON 解析失败']
        return false
      }
    },

    formatJsonDraft() {
      this.rawJsonDraft = stringifySchemaDocument(this.schemaDocument)
      this.parseErrors = []
    },

    updateMeta(patch: Partial<Pick<SchemaDocument, 'name' | 'tag' | 'class'>>) {
      const nextDocument = cloneDocument(this.schemaDocument)
      Object.assign(nextDocument, patch)
      this.commitDocument(nextDocument)
    },

    addSectionSetting(type: ShopifySettingType, initial?: Record<string, unknown>) {
      const nextDocument = cloneDocument(this.schemaDocument)
      const created = createSetting(type)
      nextDocument.settings.push(
        initial ? ({ ...created, ...initial } as SettingField) : created,
      )
      this.commitDocument(nextDocument)
    },

    updateSectionSetting(fieldUid: string, patch: Record<string, unknown>) {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.settings = nextDocument.settings.map((field) =>
        field.uid === fieldUid ? { ...field, ...patch } : field,
      )
      this.commitDocument(nextDocument)
    },

    removeSectionSetting(fieldUid: string) {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.settings = nextDocument.settings.filter((field) => field.uid !== fieldUid)
      this.commitDocument(nextDocument)
    },

    moveSectionSetting(fromIndex: number, toIndex: number) {
      const nextDocument = cloneDocument(this.schemaDocument)

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= nextDocument.settings.length ||
        toIndex > nextDocument.settings.length
      ) {
        return
      }

      const targetIndex = fromIndex < toIndex ? toIndex - 1 : toIndex

      if (targetIndex === fromIndex) {
        return
      }

      const [movedField] = nextDocument.settings.splice(fromIndex, 1)
      nextDocument.settings.splice(targetIndex, 0, movedField)
      this.commitDocument(nextDocument)
    },

    addBlock() {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.blocks.push(createBlock())
      this.commitDocument(nextDocument)
    },

    updateBlock(blockUid: string, patch: Record<string, unknown>) {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.blocks = nextDocument.blocks.map((block) =>
        block.uid === blockUid ? { ...block, ...patch } : block,
      )
      this.commitDocument(nextDocument)
    },

    removeBlock(blockUid: string) {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.blocks = nextDocument.blocks.filter((block) => block.uid !== blockUid)
      this.commitDocument(nextDocument)
    },

    moveBlock(fromIndex: number, toIndex: number) {
      const nextDocument = cloneDocument(this.schemaDocument)

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= nextDocument.blocks.length ||
        toIndex >= nextDocument.blocks.length
      ) {
        return
      }

      const [movedBlock] = nextDocument.blocks.splice(fromIndex, 1)
      nextDocument.blocks.splice(toIndex, 0, movedBlock)
      this.commitDocument(nextDocument)
    },

    addBlockSetting(blockUid: string, type: ShopifySettingType, initial?: Record<string, unknown>) {
      const nextDocument = cloneDocument(this.schemaDocument)
      const block = nextDocument.blocks.find((item) => item.uid === blockUid)
      if (!block) return
      const created = createSetting(type)
      block.settings.push(initial ? ({ ...created, ...initial } as SettingField) : created)
      this.commitDocument(nextDocument)
    },

    updateBlockSetting(
      blockUid: string,
      fieldUid: string,
      patch: Record<string, unknown>,
    ) {
      const nextDocument = cloneDocument(this.schemaDocument)
      const block = nextDocument.blocks.find((item) => item.uid === blockUid)
      if (!block) return
      block.settings = block.settings.map((field) =>
        field.uid === fieldUid ? { ...field, ...patch } : field,
      )
      this.commitDocument(nextDocument)
    },

    removeBlockSetting(blockUid: string, fieldUid: string) {
      const nextDocument = cloneDocument(this.schemaDocument)
      const block = nextDocument.blocks.find((item) => item.uid === blockUid)
      if (!block) return
      block.settings = block.settings.filter((field) => field.uid !== fieldUid)
      this.commitDocument(nextDocument)
    },

    addPreset() {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.presets.push(createPreset())
      this.commitDocument(nextDocument)
    },

    updatePreset(uid: string, patch: Partial<PresetDefinition>) {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.presets = nextDocument.presets.map((preset) =>
        preset.uid === uid ? { ...preset, ...patch } : preset,
      )
      this.commitDocument(nextDocument)
    },

    removePreset(uid: string) {
      const nextDocument = cloneDocument(this.schemaDocument)
      nextDocument.presets = nextDocument.presets.filter((preset) => preset.uid !== uid)
      this.commitDocument(nextDocument)
    },
  },
})
