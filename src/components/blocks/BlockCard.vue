<script setup lang="ts">
import { ref } from 'vue'

import BlockSettingsEditor from '@/components/blocks/BlockSettingsEditor.vue'
import type { BlockDefinition, ShopifySettingType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const props = defineProps<{
  block: BlockDefinition
  index: number
}>()

const emit = defineEmits<{
  updateBlock: [payload: { uid: string; patch: Record<string, unknown> }]
  removeBlock: [uid: string]
  addSetting: [payload: { blockUid: string; type: ShopifySettingType; initial?: Record<string, unknown> }]
  updateSetting: [payload: { blockUid: string; fieldUid: string; patch: Record<string, unknown> }]
  removeSetting: [payload: { blockUid: string; fieldUid: string }]
}>()

const isExpanded = ref(false)
</script>

<template>
  <article class="block-card">
    <button
      type="button"
      class="block-card__drag-handle"
      title="拖拽排序"
      aria-label="拖拽排序"
      data-reorder-handle
      @click.stop.prevent
    >
      ⋮⋮
    </button>
    <div class="block-card__header">
      <button
        type="button"
        class="block-card__summary"
        :aria-expanded="isExpanded"
        @click="isExpanded = !isExpanded"
      >
        <div>
          <p class="field-card__type">block {{ props.index + 1 }}</p>
          <h3>{{ props.block.name || 'Untitled block' }}</h3>
          <p class="block-card__meta">
            {{ props.block.type }} · {{ props.block.settings.length }} settings
          </p>
        </div>
      </button>
      <div class="stack-row">
        <button class="ghost-button danger" @click="emit('removeBlock', props.block.uid)">
          <TrashIcon />
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="block-card__body">
      <div class="field-grid">
        <label>
          <span>Type</span>
          <input
            :value="props.block.type"
            @input="emit('updateBlock', { uid: props.block.uid, patch: { type: ($event.target as HTMLInputElement).value } })"
          />
        </label>
        <label>
          <span>Name</span>
          <input
            :value="props.block.name"
            @input="emit('updateBlock', { uid: props.block.uid, patch: { name: ($event.target as HTMLInputElement).value } })"
          />
        </label>
        <label>
          <span>Limit</span>
          <input
            type="number"
            :value="props.block.limit ?? ''"
            @input="emit('updateBlock', { uid: props.block.uid, patch: { limit: ($event.target as HTMLInputElement).valueAsNumber || undefined } })"
          />
        </label>
      </div>

      <BlockSettingsEditor
        :block="props.block"
        @add="
          emit('addSetting', {
            blockUid: props.block.uid,
            type: $event.type,
            initial: $event.initial,
          })
        "
        @update="emit('updateSetting', { blockUid: props.block.uid, fieldUid: $event.uid, patch: $event.payload })"
        @remove="emit('removeSetting', { blockUid: props.block.uid, fieldUid: $event })"
      />
    </div>
  </article>
</template>
