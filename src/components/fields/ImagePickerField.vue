<script setup lang="ts">
import InspectorFieldShell from '@/components/builder/InspectorFieldShell.vue'
import SettingCustomAttributesEditor from '@/components/builder/SettingCustomAttributesEditor.vue'
import type { ImagePickerField as ImagePickerFieldType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  field: ImagePickerFieldType
}>()

const emit = defineEmits<{
  patch: [payload: Partial<ImagePickerFieldType>]
  remove: []
}>()

const updateValue = (key: keyof ImagePickerFieldType, value: string) => {
  emit('patch', { [key]: value } as Partial<ImagePickerFieldType>)
}
</script>

<template>
  <InspectorFieldShell
    :title="props.field.label || 'Untitled image picker'"
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
        <span>Default</span>
        <input :value="props.field.default || ''" @input="updateValue('default', ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
    <p class="field-note">这里用字符串模拟 `image_picker` 的默认引用值，便于 schema 结构编辑。</p>
    <SettingCustomAttributesEditor
      :custom-attributes="props.field.customAttributes"
      @patch="emit('patch', { customAttributes: $event })"
    />
  </InspectorFieldShell>
</template>
