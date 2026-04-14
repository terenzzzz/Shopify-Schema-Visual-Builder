<script setup lang="ts">
import { computed } from 'vue'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  customAttributes?: Record<string, unknown>
}>()

const emit = defineEmits<{
  patch: [payload: Record<string, unknown>]
}>()

const entries = computed(() => Object.entries(props.customAttributes ?? {}))

const stringifyValue = (value: unknown) => {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const parseValue = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return ''
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return input
  }
}

const updateEntry = (oldKey: string, nextKey: string, nextValueText: string) => {
  const current = { ...(props.customAttributes ?? {}) }
  delete current[oldKey]
  const normalizedKey = nextKey.trim()
  if (!normalizedKey) {
    emit('patch', current)
    return
  }
  current[normalizedKey] = parseValue(nextValueText)
  emit('patch', current)
}

const removeEntry = (key: string) => {
  const current = { ...(props.customAttributes ?? {}) }
  delete current[key]
  emit('patch', current)
}

const addEntry = () => {
  const current = { ...(props.customAttributes ?? {}) }
  let index = 1
  let candidate = `custom_key_${index}`
  while (candidate in current) {
    index += 1
    candidate = `custom_key_${index}`
  }
  current[candidate] = ''
  emit('patch', current)
}
</script>

<template>
  <div class="field-stack">
    <div class="stack-row">
      <span>自定义字段（额外 key）</span>
      <button class="ghost-button" @click="addEntry">新增自定义字段</button>
    </div>
    <div v-if="entries.length" class="options-list">
      <div class="option-row option-row--header" aria-hidden="true">
        <span class="option-row__label">Key</span>
        <span class="option-row__label">Value（支持 JSON）</span>
        <span class="option-row__label option-row__label--action">操作</span>
      </div>
      <div v-for="([entryKey, entryValue], index) in entries" :key="`custom-attr-${index}`" class="option-row">
        <label class="option-cell">
          <span class="sr-only">custom key</span>
          <input
            :value="entryKey"
            placeholder="my_custom_key"
            @input="
              updateEntry(
                entryKey,
                ($event.target as HTMLInputElement).value,
                stringifyValue(entryValue),
              )
            "
          />
        </label>
        <label class="option-cell">
          <span class="sr-only">custom value</span>
          <input
            :value="stringifyValue(entryValue)"
            placeholder='例如: true / 12 / "text" / [1,2]'
            @input="
              updateEntry(
                entryKey,
                entryKey,
                ($event.target as HTMLInputElement).value,
              )
            "
          />
        </label>
        <button class="ghost-button danger" @click="removeEntry(entryKey)"><TrashIcon /></button>
      </div>
    </div>
  </div>
</template>
