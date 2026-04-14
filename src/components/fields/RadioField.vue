<script setup lang="ts">
import InspectorFieldShell from '@/components/builder/InspectorFieldShell.vue'
import SettingCustomAttributesEditor from '@/components/builder/SettingCustomAttributesEditor.vue'
import type { RadioField as RadioFieldType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  field: RadioFieldType
}>()

const emit = defineEmits<{
  patch: [payload: Partial<RadioFieldType>]
  remove: []
}>()

const updateValue = (key: keyof RadioFieldType, value: string) => {
  emit('patch', { [key]: value } as Partial<RadioFieldType>)
}

const updateOption = (index: number, key: 'value' | 'label', value: string) => {
  const nextOptions = props.field.options.map((option, optionIndex) =>
    optionIndex === index ? { ...option, [key]: value } : option,
  )
  emit('patch', { options: nextOptions })
}

const addOption = () => {
  emit('patch', {
    options: [...props.field.options, { value: `option_${props.field.options.length + 1}`, label: `Option ${props.field.options.length + 1}` }],
  })
}

const removeOption = (index: number) => {
  emit('patch', {
    options: props.field.options.filter((_, optionIndex) => optionIndex !== index),
  })
}
</script>

<template>
  <InspectorFieldShell
    :title="props.field.label || 'Untitled radio field'"
    :type="props.field.type"
    :meta="`${props.field.id} · ${props.field.options.length} options`"
  >
    <template #actions>
      <button class="ghost-button danger" @click="emit('remove')"><TrashIcon /></button>
    </template>
    <div class="field-grid">
      <label>
        <span>ID</span>
        <input :value="props.field.id" @input="updateValue('id', ($event.target as HTMLInputElement).value)" />
      </label>
      <label>
        <span>Label</span>
        <input :value="props.field.label" @input="updateValue('label', ($event.target as HTMLInputElement).value)" />
      </label>
      <label>
        <span>Default</span>
        <input :value="props.field.default || ''" @input="updateValue('default', ($event.target as HTMLInputElement).value)" />
      </label>
      <label>
        <span>Info</span>
        <input :value="props.field.info || ''" @input="updateValue('info', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
    <div class="field-stack">
      <div class="stack-row">
        <span>Options</span>
        <button class="ghost-button" @click="addOption">新增选项</button>
      </div>
      <div class="options-list">
        <div class="option-row option-row--header" aria-hidden="true">
          <span class="option-row__label">Label</span>
          <span class="option-row__label">Value</span>
          <span class="option-row__label option-row__label--action">操作</span>
        </div>
        <div v-for="(option, index) in props.field.options" :key="`${props.field.uid}-${index}`" class="option-row">
          <label class="option-cell">
            <span class="sr-only">Option label</span>
            <input :value="option.label" placeholder="Option label" @input="updateOption(index, 'label', ($event.target as HTMLInputElement).value)" />
          </label>
          <label class="option-cell">
            <span class="sr-only">Option value</span>
            <input :value="option.value" placeholder="option_value" @input="updateOption(index, 'value', ($event.target as HTMLInputElement).value)" />
          </label>
          <button class="ghost-button danger" @click="removeOption(index)"><TrashIcon /></button>
        </div>
      </div>
    </div>
    <SettingCustomAttributesEditor
      :custom-attributes="props.field.customAttributes"
      @patch="emit('patch', { customAttributes: $event })"
    />
  </InspectorFieldShell>
</template>
