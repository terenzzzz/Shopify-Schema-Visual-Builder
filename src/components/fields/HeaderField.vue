<script setup lang="ts">
import InspectorFieldShell from '@/components/builder/InspectorFieldShell.vue'
import SettingCustomAttributesEditor from '@/components/builder/SettingCustomAttributesEditor.vue'
import type { HeaderField as HeaderFieldType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  field: HeaderFieldType
}>()

const emit = defineEmits<{
  patch: [payload: Partial<HeaderFieldType>]
  remove: []
}>()

const updateValue = (value: string) => {
  emit('patch', { content: value })
}
</script>

<template>
  <InspectorFieldShell :title="props.field.content || 'Untitled header'" :type="props.field.type">
    <template #actions>
      <button class="ghost-button danger" @click="emit('remove')"><TrashIcon /></button>
    </template>
    <label class="field-stack">
      <span>Content</span>
      <input :value="props.field.content" @input="updateValue(($event.target as HTMLInputElement).value)" />
    </label>
    <SettingCustomAttributesEditor
      :custom-attributes="props.field.customAttributes"
      @patch="emit('patch', { customAttributes: $event })"
    />
  </InspectorFieldShell>
</template>
