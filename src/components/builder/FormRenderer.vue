<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import type { AddSettingFieldPayload, SettingField, ShopifySettingType } from '@/types/schema'

import FieldRenderer from './FieldRenderer.vue'

const props = defineProps<{
  title: string
  description?: string
  settings: SettingField[]
  embedded?: boolean
  allowReorder?: boolean
}>()

const emit = defineEmits<{
  add: [payload: AddSettingFieldPayload]
  move: [payload: { from: number; to: number }]
  update: [payload: { uid: string; payload: Record<string, unknown> }]
  remove: [uid: string]
}>()

const modalOpen = ref(false)
const modalError = ref('')

const modalType = ref<ShopifySettingType>('text')
const headerContent = ref('')

const fieldId = ref('')
const fieldLabel = ref('')
const fieldInfo = ref('')
const fieldPlaceholder = ref('')
const fieldDefaultStr = ref('')

const checkboxDefault = ref(false)
const colorDefault = ref('#111111')

const rangeMin = ref(0)
const rangeMax = ref(100)
const rangeStep = ref(1)
const rangeUnit = ref('px')
const rangeDefault = ref(50)

const opt1Value = ref('option_1')
const opt1Label = ref('Option 1')
const opt2Value = ref('option_2')
const opt2Label = ref('Option 2')

const resetAddForm = () => {
  modalError.value = ''
  modalType.value = 'text'
  headerContent.value = 'Header'
  fieldId.value = ''
  fieldLabel.value = ''
  fieldInfo.value = ''
  fieldPlaceholder.value = ''
  fieldDefaultStr.value = ''
  checkboxDefault.value = false
  colorDefault.value = '#111111'
  rangeMin.value = 0
  rangeMax.value = 100
  rangeStep.value = 1
  rangeUnit.value = 'px'
  rangeDefault.value = 50
  opt1Value.value = 'option_1'
  opt1Label.value = 'Option 1'
  opt2Value.value = 'option_2'
  opt2Label.value = 'Option 2'
}

const openAddModal = () => {
  resetAddForm()
  modalOpen.value = true
}

const closeAddModal = () => {
  modalOpen.value = false
  modalError.value = ''
}

let escapeHandler: ((e: KeyboardEvent) => void) | null = null

watch(modalOpen, (open) => {
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler)
    escapeHandler = null
  }
  if (open) {
    escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAddModal()
      }
    }
    window.addEventListener('keydown', escapeHandler)
  }
})

onUnmounted(() => {
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler)
  }
})

const isHeaderType = computed(() => modalType.value === 'header')
const isTextLike = computed(() =>
  ['text', 'textarea', 'richtext'].includes(modalType.value),
)
const isImagePicker = computed(() => modalType.value === 'image_picker')
const isChoice = computed(() => modalType.value === 'select' || modalType.value === 'radio')
const isRange = computed(() => modalType.value === 'range')
const isColor = computed(() => modalType.value === 'color')
const isCheckbox = computed(() => modalType.value === 'checkbox')

const buildInitial = (): Record<string, unknown> | undefined => {
  const patch: Record<string, unknown> = {}

  if (modalType.value === 'header') {
    patch.content = headerContent.value.trim() || 'Header'
    return patch
  }

  if (fieldId.value.trim()) {
    patch.id = fieldId.value.trim()
  }
  if (fieldLabel.value.trim()) {
    patch.label = fieldLabel.value.trim()
  }
  if (fieldInfo.value.trim()) {
    patch.info = fieldInfo.value.trim()
  }

  const t = modalType.value

  if (isTextLike.value || t === 'image_picker') {
    if (fieldPlaceholder.value.trim()) {
      patch.placeholder = fieldPlaceholder.value.trim()
    }
    if (fieldDefaultStr.value !== '') {
      patch.default = fieldDefaultStr.value
    }
  }

  if (isChoice.value) {
    patch.options = [
      {
        value: opt1Value.value.trim() || 'option_1',
        label: opt1Label.value.trim() || opt1Value.value || 'Option 1',
      },
      {
        value: opt2Value.value.trim() || 'option_2',
        label: opt2Label.value.trim() || opt2Value.value || 'Option 2',
      },
    ]
    if (fieldDefaultStr.value.trim()) {
      patch.default = fieldDefaultStr.value.trim()
    }
  }

  if (isCheckbox.value) {
    patch.default = checkboxDefault.value
  }

  if (isRange.value) {
    patch.min = rangeMin.value
    patch.max = rangeMax.value
    patch.step = rangeStep.value
    if (rangeUnit.value.trim()) {
      patch.unit = rangeUnit.value.trim()
    }
    patch.default = rangeDefault.value
  }

  if (isColor.value) {
    patch.default = colorDefault.value
  }

  return Object.keys(patch).length ? patch : undefined
}

const confirmAdd = () => {
  modalError.value = ''

  if (modalType.value === 'header') {
    if (!headerContent.value.trim()) {
      modalError.value = '请填写 header 显示内容'
      return
    }
  } else if (!fieldLabel.value.trim()) {
    modalError.value = '请填写 Label'
    return
  }

  const initial = buildInitial()
  emit('add', { type: modalType.value, initial })
  closeAddModal()
}

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

const handlePointerDown = (event: PointerEvent, index: number) => {
  if (!props.allowReorder || !isLongPressTarget(event.target)) return

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
    if (!pointerSession || pointerSession.pointerId !== event.pointerId) {
      return
    }

    pressingIndex.value = null
    draggingIndex.value = index
    suppressNextClick = true
    updateDropTargetFromPoint(event.clientX, event.clientY)
  }, LONG_PRESS_DELAY_MS)
}

const updateDropTargetFromPoint = (clientX: number, clientY: number) => {
  const target = document
    .elementFromPoint(clientX, clientY)
    ?.closest('[data-field-index]') as HTMLElement | null

  if (!target) return

  const index = Number(target.dataset.fieldIndex)

  if (!Number.isInteger(index)) return

  const bounds = target.getBoundingClientRect()
  const placement = clientY < bounds.top + bounds.height / 2 ? 'before' : 'after'
  dropTarget.value = { index, placement }
}

const handlePointerMove = (event: PointerEvent) => {
  if (!props.allowReorder || !pointerSession || pointerSession.pointerId !== event.pointerId) return

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

  if (from === null || !currentDropTarget) {
    return
  }

  const to = currentDropTarget.placement === 'before' ? currentDropTarget.index : currentDropTarget.index + 1
  emit('move', { from, to })
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
  <section :class="['panel-section', { 'panel-section--embedded': props.embedded }]">
    <div class="panel-section__header">
      <div>
        <h3>{{ props.title }}</h3>
        <p v-if="props.description">{{ props.description }}</p>
      </div>
      <button type="button" class="primary-button form-renderer__add-btn" @click="openAddModal">
        新增字段
      </button>
    </div>

    <p v-if="props.allowReorder && draggingIndex !== null" class="field-list__drag-tip">
      拖到蓝色插入线位置后释放，即可调整字段顺序。
    </p>

    <div v-if="props.settings.length" class="field-list">
      <div
        v-for="(field, index) in props.settings"
        :key="field.uid"
        :data-field-index="index"
        :class="[
          'field-list__item',
          {
            'field-list__item--reorderable': props.allowReorder,
            'field-list__item--pressing': pressingIndex === index,
            'field-list__item--dragging': draggingIndex === index,
            'field-list__item--target':
              dropTarget?.index === index && draggingIndex !== index,
            'field-list__item--target-before':
              dropTarget?.index === index &&
              dropTarget?.placement === 'before' &&
              draggingIndex !== index,
            'field-list__item--target-after':
              dropTarget?.index === index &&
              dropTarget?.placement === 'after' &&
              draggingIndex !== index,
          },
        ]"
        @click.capture="handleClickCapture"
        @pointerdown="handlePointerDown($event, index)"
        @pointermove="handlePointerMove($event)"
        @pointerup="handlePointerUp($event)"
        @pointercancel="handlePointerCancel($event)"
      >
        <button
          v-if="props.allowReorder"
          type="button"
          class="field-list__drag-handle"
          data-reorder-handle
          title="长按或拖拽排序"
          aria-label="长按或拖拽排序"
          @click.prevent
        >
          ⋮⋮
        </button>
        <div
          v-if="dropTarget?.index === index && draggingIndex !== index"
          :class="[
            'field-list__drop-hint',
            `field-list__drop-hint--${dropTarget.placement}`,
          ]"
        >
          释放后插入到这里
        </div>
        <FieldRenderer
          :field="field"
          @patch="emit('update', { uid: field.uid, payload: $event })"
          @remove="emit('remove', field.uid)"
        />
      </div>
    </div>
    <div v-else class="empty-state">当前还没有字段，点击「新增字段」打开表单。</div>

    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="modal-backdrop"
        role="presentation"
        @click.self="closeAddModal"
      >
        <div
          class="modal-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'add-field-modal-title'"
          @click.stop
        >
          <div class="modal-dialog__header">
            <h4 id="add-field-modal-title">新增字段</h4>
            <button type="button" class="ghost-button modal-dialog__close" @click="closeAddModal">
              关闭
            </button>
          </div>

          <div class="modal-dialog__body">
            <p v-if="modalError" class="modal-dialog__error">{{ modalError }}</p>

            <div class="field-grid">
              <label class="field-stack field-stack--full">
                <span>类型</span>
                <select v-model="modalType">
                  <option value="header">header</option>
                  <option value="text">text</option>
                  <option value="textarea">textarea</option>
                  <option value="richtext">richtext</option>
                  <option value="image_picker">image_picker</option>
                  <option value="select">select</option>
                  <option value="checkbox">checkbox</option>
                  <option value="radio">radio</option>
                  <option value="range">range</option>
                  <option value="color">color</option>
                </select>
              </label>
            </div>

            <template v-if="isHeaderType">
              <label class="field-stack">
                <span>显示内容</span>
                <input v-model="headerContent" type="text" placeholder="分组标题" />
              </label>
            </template>

            <template v-else>
              <div class="field-grid">
                <label>
                  <span>ID</span>
                  <input v-model="fieldId" type="text" placeholder="留空则自动生成" />
                </label>
                <label>
                  <span>Label</span>
                  <input v-model="fieldLabel" type="text" placeholder="必填" />
                </label>
              </div>
              <label class="field-stack">
                <span>Info（可选）</span>
                <textarea v-model="fieldInfo" rows="2" placeholder="字段说明" />
              </label>

              <template v-if="isTextLike">
                <label class="field-stack">
                  <span>Placeholder</span>
                  <input v-model="fieldPlaceholder" type="text" />
                </label>
                <label class="field-stack">
                  <span>Default</span>
                  <input v-model="fieldDefaultStr" type="text" />
                </label>
              </template>

              <template v-else-if="isImagePicker">
                <label class="field-stack">
                  <span>Placeholder（可选）</span>
                  <input v-model="fieldPlaceholder" type="text" />
                </label>
                <label class="field-stack">
                  <span>Default（资源 URL 或留空）</span>
                  <input v-model="fieldDefaultStr" type="text" />
                </label>
              </template>

              <template v-else-if="isChoice">
                <p class="modal-dialog__section-title">选项（至少两项）</p>
                <div class="field-grid">
                  <label>
                    <span>选项 1 · value</span>
                    <input v-model="opt1Value" type="text" />
                  </label>
                  <label>
                    <span>选项 1 · label</span>
                    <input v-model="opt1Label" type="text" />
                  </label>
                  <label>
                    <span>选项 2 · value</span>
                    <input v-model="opt2Value" type="text" />
                  </label>
                  <label>
                    <span>选项 2 · label</span>
                    <input v-model="opt2Label" type="text" />
                  </label>
                </div>
                <label class="field-stack">
                  <span>Default（对应某个 value）</span>
                  <input v-model="fieldDefaultStr" type="text" />
                </label>
              </template>

              <template v-else-if="isCheckbox">
                <label class="theme-preview__checkbox modal-dialog__checkbox">
                  <input v-model="checkboxDefault" type="checkbox" />
                  <span>默认勾选</span>
                </label>
              </template>

              <template v-else-if="isRange">
                <div class="field-grid">
                  <label>
                    <span>Min</span>
                    <input v-model.number="rangeMin" type="number" />
                  </label>
                  <label>
                    <span>Max</span>
                    <input v-model.number="rangeMax" type="number" />
                  </label>
                  <label>
                    <span>Step</span>
                    <input v-model.number="rangeStep" type="number" />
                  </label>
                  <label>
                    <span>Unit</span>
                    <input v-model="rangeUnit" type="text" />
                  </label>
                  <label>
                    <span>Default</span>
                    <input v-model.number="rangeDefault" type="number" />
                  </label>
                </div>
              </template>

              <template v-else-if="isColor">
                <div class="theme-preview__color modal-dialog__color-row">
                  <input v-model="colorDefault" type="color" />
                  <input v-model="colorDefault" type="text" />
                </div>
              </template>
            </template>
          </div>

          <div class="modal-dialog__footer">
            <button type="button" class="ghost-button" @click="closeAddModal">取消</button>
            <button type="button" class="primary-button" @click="confirmAdd">确认添加</button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
