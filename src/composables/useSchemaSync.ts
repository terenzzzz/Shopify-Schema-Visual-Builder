import { computed } from 'vue'

import { useClipboard } from '@vueuse/core'

import sampleSchema from '@/mocks/sample-schema.json'
import { useSchemaBuilderStore } from '@/stores/schemaBuilder'

export const useSchemaSync = () => {
  const store = useSchemaBuilderStore()
  const { copy, copied } = useClipboard()

  const issueSummary = computed(() => [
    ...store.parseErrors.map((message) => ({
      path: 'json',
      message,
      severity: 'error' as const,
    })),
    ...store.validationIssues,
  ])

  const initialize = () => {
    store.initialize(sampleSchema)
  }

  const onEditorChange = (nextValue: string) => {
    store.applyEditorDraft(nextValue)
  }

  const formatJson = () => {
    store.formatJsonDraft()
  }

  const resetExample = () => {
    store.initialize(sampleSchema)
  }

  const copyJson = async () => {
    await copy(store.rawJsonDraft)
  }

  return {
    copied,
    issueSummary,
    initialize,
    onEditorChange,
    formatJson,
    resetExample,
    copyJson,
  }
}
