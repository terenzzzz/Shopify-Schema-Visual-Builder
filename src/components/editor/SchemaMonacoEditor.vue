<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { monaco } from '@/lib/monaco/setup'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let suppressModelEvent = false

onMounted(() => {
  if (!containerRef.value) return

  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: 'json',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbersMinChars: 3,
    tabSize: 2,
    wordWrap: 'on',
    theme: 'vs',
  })

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    enableSchemaRequest: false,
  })

  editor.onDidChangeModelContent(() => {
    if (suppressModelEvent || !editor) return
    emit('update:modelValue', editor.getValue())
  })
})

watch(
  () => props.modelValue,
  (nextValue) => {
    if (!editor) return

    if (editor.getValue() === nextValue) {
      return
    }

    suppressModelEvent = true
    editor.setValue(nextValue)
    suppressModelEvent = false
  },
)

onBeforeUnmount(() => {
  editor?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="monaco-editor-host"></div>
</template>
