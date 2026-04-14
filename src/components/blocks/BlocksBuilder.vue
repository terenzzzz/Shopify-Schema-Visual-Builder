<script setup lang="ts">
import { ref } from 'vue'

import BlockCard from '@/components/blocks/BlockCard.vue'
import type { BlockDefinition, ShopifySettingType } from '@/types/schema'

const props = defineProps<{
  blocks: BlockDefinition[]
}>()

const emit = defineEmits<{
  addBlock: []
  updateBlock: [payload: { uid: string; patch: Record<string, unknown> }]
  removeBlock: [uid: string]
  moveBlock: [payload: { from: number; to: number }]
  addSetting: [payload: { blockUid: string; type: ShopifySettingType; initial?: Record<string, unknown> }]
  updateSetting: [payload: { blockUid: string; fieldUid: string; patch: Record<string, unknown> }]
  removeSetting: [payload: { blockUid: string; fieldUid: string }]
}>()

const pressingIndex = ref<number | null>(null)
const draggingIndex = ref<number | null>(null)
const dropTarget = ref<{ index: number; placement: 'before' | 'after' } | null>(null)

const LONG_PRESS_DELAY_MS = 220
const LONG_PRESS_MOVE_THRESHOLD = 8

let longPressTimer: number | null = null
let pointerSession:
  | {
      index: number
      pointerId: number
      startX: number
      startY: number
      element: HTMLElement
    }
  | null = null
let suppressNextClick = false

const clearLongPressTimer = () => {
  if (longPressTimer !== null) {
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const resetPointerState = () => {
  clearLongPressTimer()
  pressingIndex.value = null
  draggingIndex.value = null
  dropTarget.value = null
  pointerSession = null
}

const isLongPressTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return false
  }
  return Boolean(target.closest('[data-reorder-handle]'))
}

const updateDropTargetFromPoint = (clientX: number, clientY: number) => {
  const target = document
    .elementFromPoint(clientX, clientY)
    ?.closest('[data-block-index]') as HTMLElement | null

  if (!target) return

  const index = Number(target.dataset.blockIndex)
  if (!Number.isInteger(index)) return

  const bounds = target.getBoundingClientRect()
  const placement = clientY < bounds.top + bounds.height / 2 ? 'before' : 'after'
  dropTarget.value = { index, placement }
}

const handlePointerDown = (event: PointerEvent, index: number) => {
  if (!isLongPressTarget(event.target)) return

  const element = event.currentTarget as HTMLElement | null
  if (!element) return

  suppressNextClick = false
  clearLongPressTimer()
  pressingIndex.value = index
  dropTarget.value = null
  pointerSession = {
    index,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    element,
  }

  element.setPointerCapture?.(event.pointerId)
  longPressTimer = window.setTimeout(() => {
    if (!pointerSession || pointerSession.pointerId !== event.pointerId) return
    pressingIndex.value = null
    draggingIndex.value = index
    suppressNextClick = true
    updateDropTargetFromPoint(event.clientX, event.clientY)
  }, LONG_PRESS_DELAY_MS)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!pointerSession || pointerSession.pointerId !== event.pointerId) return

  const movedX = Math.abs(event.clientX - pointerSession.startX)
  const movedY = Math.abs(event.clientY - pointerSession.startY)

  if (draggingIndex.value === null) {
    if (movedX > LONG_PRESS_MOVE_THRESHOLD || movedY > LONG_PRESS_MOVE_THRESHOLD) {
      clearLongPressTimer()
      pressingIndex.value = null
      pointerSession = null
    }
    return
  }

  event.preventDefault()
  updateDropTargetFromPoint(event.clientX, event.clientY)
}

const handlePointerUp = (event: PointerEvent) => {
  if (!pointerSession || pointerSession.pointerId !== event.pointerId) return

  const from = draggingIndex.value
  const currentDropTarget = dropTarget.value

  pointerSession.element.releasePointerCapture?.(event.pointerId)
  clearLongPressTimer()
  pressingIndex.value = null
  draggingIndex.value = null
  dropTarget.value = null
  pointerSession = null

  if (from === null || !currentDropTarget) return

  const insertionIndex =
    currentDropTarget.placement === 'before' ? currentDropTarget.index : currentDropTarget.index + 1
  const finalIndex = from < insertionIndex ? insertionIndex - 1 : insertionIndex

  if (finalIndex === from || finalIndex < 0 || finalIndex >= props.blocks.length) return
  emit('moveBlock', { from, to: finalIndex })
}

const handlePointerCancel = (event: PointerEvent) => {
  if (!pointerSession || pointerSession.pointerId !== event.pointerId) return
  pointerSession.element.releasePointerCapture?.(event.pointerId)
  resetPointerState()
}

const handleClickCapture = (event: MouseEvent) => {
  if (!suppressNextClick) return
  suppressNextClick = false
  event.preventDefault()
  event.stopPropagation()
}
</script>

<template>
  <section class="panel-section">
    <div class="panel-section__header">
      <div>
        <h3>Blocks</h3>
        <p>支持新增、删除、原生拖拽排序，以及编辑 block 内部 settings。</p>
      </div>
      <button class="primary-button" @click="emit('addBlock')">新增 block</button>
    </div>

    <p v-if="draggingIndex !== null" class="field-list__drag-tip">
      拖到蓝色插入线位置后释放，即可调整 block 顺序。
    </p>

    <div v-if="props.blocks.length" class="block-list">
      <div
        v-for="(block, index) in props.blocks"
        :key="block.uid"
        :data-block-index="index"
        :class="[
          'block-list__item',
          {
            'block-list__item--pressing': pressingIndex === index,
            'block-list__item--dragging': draggingIndex === index,
            'block-list__item--target': dropTarget?.index === index && draggingIndex !== index,
            'block-list__item--target-before':
              dropTarget?.index === index && dropTarget?.placement === 'before' && draggingIndex !== index,
            'block-list__item--target-after':
              dropTarget?.index === index && dropTarget?.placement === 'after' && draggingIndex !== index,
          },
        ]"
        @click.capture="handleClickCapture"
        @pointerdown="handlePointerDown($event, index)"
        @pointermove="handlePointerMove($event)"
        @pointerup="handlePointerUp($event)"
        @pointercancel="handlePointerCancel($event)"
      >
        <div
          v-if="dropTarget?.index === index && draggingIndex !== index"
          :class="['field-list__drop-hint', `field-list__drop-hint--${dropTarget.placement}`]"
        >
          释放后插入到这里
        </div>
        <BlockCard
          :block="block"
          :index="index"
          @update-block="emit('updateBlock', $event)"
          @remove-block="emit('removeBlock', $event)"
          @add-setting="emit('addSetting', $event)"
          @update-setting="emit('updateSetting', $event)"
          @remove-setting="emit('removeSetting', $event)"
        />
      </div>
    </div>
    <div v-else class="empty-state">当前没有 block，点击右上角按钮开始创建。</div>
  </section>
</template>
