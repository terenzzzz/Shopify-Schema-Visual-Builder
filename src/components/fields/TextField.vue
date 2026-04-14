<script setup lang="ts">
import InspectorFieldShell from '@/components/builder/InspectorFieldShell.vue'
import SettingCustomAttributesEditor from '@/components/builder/SettingCustomAttributesEditor.vue'
import type { TextLikeField } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  field: TextLikeField
}>()

const emit = defineEmits<{
  patch: [payload: Partial<TextLikeField>]
  remove: []
}>()

const updateValue = (key: keyof TextLikeField, value: string) => {
  emit('patch', { [key]: value } as Partial<TextLikeField>)
}
</script>

<template>
  <InspectorFieldShell
    :title="props.field.label || 'Untitled text field'"
    :type="props.field.type"
    :meta="props.field.id"
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
        <span>Placeholder</span>
        <input :value="props.field.placeholder || ''" @input="updateValue('placeholder', ($event.target as HTMLInputElement).value)" />
      </label>
      <label>
        <span>Default</span>
        <input :value="props.field.default || ''" @input="updateValue('default', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
    <label class="field-stack">
      <span>Info</span>
      <textarea rows="2" :value="props.field.info || ''" @input="updateValue('info', ($event.target as HTMLTextAreaElement).value)" />
    </label>
    <SettingCustomAttributesEditor
      :custom-attributes="props.field.customAttributes"
      @patch="emit('patch', { customAttributes: $event })"
    />
  </InspectorFieldShell>
</template>
