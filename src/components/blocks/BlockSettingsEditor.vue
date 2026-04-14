<script setup lang="ts">
import type { AddSettingFieldPayload, BlockDefinition } from '@/types/schema'

import FormRenderer from '@/components/builder/FormRenderer.vue'

const props = defineProps<{
  block: BlockDefinition
}>()

const emit = defineEmits<{
  add: [payload: AddSettingFieldPayload]
  update: [payload: { uid: string; payload: Record<string, unknown> }]
  remove: [uid: string]
}>()
</script>

<template>
  <FormRenderer
    :title="`${props.block.name} settings`"
    description="Block 内部 settings 和 section settings 复用同一套渲染器。"
    :settings="props.block.settings"
    embedded
    @add="emit('add', $event)"
    @update="emit('update', $event)"
    @remove="emit('remove', $event)"
  />
</template>
