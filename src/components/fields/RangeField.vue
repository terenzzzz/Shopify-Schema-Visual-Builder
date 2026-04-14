<script setup lang="ts">
import InspectorFieldShell from '@/components/builder/InspectorFieldShell.vue'
import SettingCustomAttributesEditor from '@/components/builder/SettingCustomAttributesEditor.vue'
import type { RangeField as RangeFieldType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  field: RangeFieldType
}>()

const emit = defineEmits<{
  patch: [payload: Partial<RangeFieldType>]
  remove: []
}>()

const updateText = (key: keyof RangeFieldType, value: string) => {
  emit('patch', { [key]: value } as Partial<RangeFieldType>)
}

const updateNumber = (key: keyof RangeFieldType, value: number) => {
  emit('patch', { [key]: Number.isFinite(value) ? value : 0 } as Partial<RangeFieldType>)
}
</script>

<template>
  <InspectorFieldShell
    :title="props.field.label || 'Untitled range field'"
    :type="props.field.type"
    :meta="`${props.field.id} · ${props.field.min}-${props.field.max}${props.field.unit || ''}`"
  >
    <template #actions>
      <button class="ghost-button danger" @click="emit('remove')"><TrashIcon /></button>
    </template>
    <div class="field-grid">
      <label>
        <span>ID</span>
        <input :value="props.field.id" @input="updateText('id', ($event.target as HTMLInputElement).value)" />
      </label>
      <label>
        <span>Label</span>
        <input :value="props.field.label" @input="updateText('label', ($event.target as HTMLInputElement).value)" />
      </label>
      <label>
        <span>Min</span>
        <input type="number" :value="props.field.min" @input="updateNumber('min', ($event.target as HTMLInputElement).valueAsNumber)" />
      </label>
      <label>
        <span>Max</span>
        <input type="number" :value="props.field.max" @input="updateNumber('max', ($event.target as HTMLInputElement).valueAsNumber)" />
      </label>
      <label>
        <span>Step</span>
        <input type="number" :value="props.field.step" @input="updateNumber('step', ($event.target as HTMLInputElement).valueAsNumber)" />
      </label>
      <label>
        <span>Default</span>
        <input type="number" :value="props.field.default" @input="updateNumber('default', ($event.target as HTMLInputElement).valueAsNumber)" />
      </label>
      <label>
        <span>Unit</span>
        <input :value="props.field.unit || ''" @input="updateText('unit', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
    <SettingCustomAttributesEditor
      :custom-attributes="props.field.customAttributes"
      @patch="emit('patch', { customAttributes: $event })"
    />
  </InspectorFieldShell>
</template>
