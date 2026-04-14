<script setup lang="ts">
import InspectorFieldShell from '@/components/builder/InspectorFieldShell.vue'
import SettingCustomAttributesEditor from '@/components/builder/SettingCustomAttributesEditor.vue'
import type { ColorField as ColorFieldType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  field: ColorFieldType
}>()

const emit = defineEmits<{
  patch: [payload: Partial<ColorFieldType>]
  remove: []
}>()

const updateValue = (key: keyof ColorFieldType, value: string) => {
  emit('patch', { [key]: value } as Partial<ColorFieldType>)
}
</script>

<template>
  <InspectorFieldShell
    :title="props.field.label || 'Untitled color field'"
    :type="props.field.type"
    :meta="props.field.default || props.field.id"
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
      <label class="color-field">
        <span>Default</span>
        <div class="color-field__controls">
          <input type="color" :value="props.field.default || '#111111'" @input="updateValue('default', ($event.target as HTMLInputElement).value)" />
          <input :value="props.field.default || ''" @input="updateValue('default', ($event.target as HTMLInputElement).value)" />
        </div>
      </label>
      <label>
        <span>Info</span>
        <input :value="props.field.info || ''" @input="updateValue('info', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
    <SettingCustomAttributesEditor
      :custom-attributes="props.field.customAttributes"
      @patch="emit('patch', { customAttributes: $event })"
    />
  </InspectorFieldShell>
</template>
