<script setup lang="ts">
import { computed } from 'vue'

import CheckboxField from '@/components/fields/CheckboxField.vue'
import ColorField from '@/components/fields/ColorField.vue'
import HeaderField from '@/components/fields/HeaderField.vue'
import ImagePickerField from '@/components/fields/ImagePickerField.vue'
import RadioField from '@/components/fields/RadioField.vue'
import RangeField from '@/components/fields/RangeField.vue'
import RichtextField from '@/components/fields/RichtextField.vue'
import SelectField from '@/components/fields/SelectField.vue'
import TextField from '@/components/fields/TextField.vue'
import TextareaField from '@/components/fields/TextareaField.vue'
import type { SettingField } from '@/types/schema'

const props = defineProps<{
  field: SettingField
}>()

const emit = defineEmits<{
  patch: [payload: Record<string, unknown>]
  remove: []
}>()

const componentMap = {
  header: HeaderField,
  text: TextField,
  textarea: TextareaField,
  richtext: RichtextField,
  image_picker: ImagePickerField,
  select: SelectField,
  checkbox: CheckboxField,
  radio: RadioField,
  range: RangeField,
  color: ColorField,
}

const component = computed(() => componentMap[props.field.type] ?? TextField)
const unsafeField = computed(() => props.field as never)
</script>

<template>
  <component
    :is="component"
    :field="unsafeField"
    @patch="emit('patch', $event)"
    @remove="emit('remove')"
  />
</template>
