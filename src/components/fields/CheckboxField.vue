<script setup lang="ts">
import InspectorFieldShell from '@/components/builder/InspectorFieldShell.vue'
import SettingCustomAttributesEditor from '@/components/builder/SettingCustomAttributesEditor.vue'
import type { CheckboxField as CheckboxFieldType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  field: CheckboxFieldType
}>()

const emit = defineEmits<{
  patch: [payload: Partial<CheckboxFieldType>]
  remove: []
}>()

const updateValue = (key: keyof CheckboxFieldType, value: string | boolean) => {
  emit('patch', { [key]: value } as Partial<CheckboxFieldType>)
}
</script>

<template>
  <InspectorFieldShell
    :title="props.field.label || 'Untitled checkbox field'"
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
      <label class="checkbox-toggle">
        <span>Default</span>
        <span class="checkbox-toggle__control">
          <input
            type="checkbox"
            :checked="props.field.default"
            @change="updateValue('default', ($event.target as HTMLInputElement).checked)"
          />
          <span class="checkbox-toggle__track" aria-hidden="true">
            <span class="checkbox-toggle__thumb" />
          </span>
          <span class="checkbox-toggle__label">{{ props.field.default ? 'true' : 'false' }}</span>
        </span>
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
