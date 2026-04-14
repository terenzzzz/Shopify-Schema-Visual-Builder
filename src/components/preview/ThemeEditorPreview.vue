<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import type { BlockDefinition, SchemaDocument, SettingField } from '@/types/schema'

const props = defineProps<{
  document: SchemaDocument
}>()

const sectionValues = reactive<Record<string, string | number | boolean>>({})
const blockValues = reactive<Record<string, Record<string, string | number | boolean>>>({})

const isFieldRenderable = (field: SettingField) => field.type !== 'header'

const defaultValueForField = (field: SettingField): string | number | boolean => {
  if ('default' in field && field.default !== undefined) {
    return field.default
  }

  if (field.type === 'checkbox') {
    return false
  }

  if (field.type === 'range') {
    return field.min ?? 0
  }

  if (field.type === 'select' || field.type === 'radio') {
    return field.options[0]?.value ?? ''
  }

  if (field.type === 'color') {
    return '#000000'
  }

  return ''
}

const syncValues = () => {
  const nextSectionValues: Record<string, string | number | boolean> = {}
  const nextBlockValues: Record<string, Record<string, string | number | boolean>> = {}

  props.document.settings.forEach((field) => {
    if (!isFieldRenderable(field)) return
    nextSectionValues[field.uid] = sectionValues[field.uid] ?? defaultValueForField(field)
  })

  props.document.blocks.forEach((block) => {
    const blockEntry: Record<string, string | number | boolean> = {}
    block.settings.forEach((field) => {
      if (!isFieldRenderable(field)) return
      blockEntry[field.uid] = blockValues[block.uid]?.[field.uid] ?? defaultValueForField(field)
    })
    nextBlockValues[block.uid] = blockEntry
  })

  Object.keys(sectionValues).forEach((key) => delete sectionValues[key])
  Object.assign(sectionValues, nextSectionValues)

  Object.keys(blockValues).forEach((key) => delete blockValues[key])
  Object.assign(blockValues, nextBlockValues)
}

watch(() => props.document, syncValues, { deep: true, immediate: true })

const sectionHeaders = computed(() =>
  props.document.settings.filter((field) => field.type === 'header'),
)

const sectionRenderableSettings = computed(() =>
  props.document.settings.filter((field) => isFieldRenderable(field)),
)

const updateSectionValue = (fieldUid: string, value: string | number | boolean) => {
  sectionValues[fieldUid] = value
}

const updateBlockValue = (
  blockUid: string,
  fieldUid: string,
  value: string | number | boolean,
) => {
  if (!blockValues[blockUid]) {
    blockValues[blockUid] = {}
  }
  blockValues[blockUid][fieldUid] = value
}

const toNumberValue = (value: string, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolveBlockTitle = (block: BlockDefinition) => block.name || block.type || 'Untitled block'
</script>

<template>
  <section class="panel-section preview-panel">
    <div class="panel-section__header">
      <div>
        <h3>Theme Editor Preview</h3>
        <p>模拟 Shopify section 配置面板，实时反映当前 JSON 结构和默认值。</p>
      </div>
    </div>

    <div class="theme-preview">
      <div class="theme-preview__top">
        <p class="theme-preview__eyebrow">SECTION</p>
        <h4>{{ props.document.name || 'Untitled section' }}</h4>
      </div>

      <div v-if="sectionHeaders.length" class="theme-preview__headers">
        <div
          v-for="header in sectionHeaders"
          :key="header.uid"
          class="theme-preview__header-row"
        >
          {{ header.content || 'Header' }}
        </div>
      </div>

      <div v-if="sectionRenderableSettings.length" class="theme-preview__fields">
        <div
          v-for="field in sectionRenderableSettings"
          :key="field.uid"
          class="theme-preview__field"
        >
          <label class="theme-preview__label">{{ field.label || field.id }}</label>
          <p v-if="field.info" class="theme-preview__hint">{{ field.info }}</p>

          <input
            v-if="field.type === 'text'"
            type="text"
            :placeholder="field.placeholder"
            :value="String(sectionValues[field.uid] ?? '')"
            @input="updateSectionValue(field.uid, ($event.target as HTMLInputElement).value)"
          />

          <textarea
            v-else-if="field.type === 'textarea' || field.type === 'richtext'"
            rows="3"
            :placeholder="field.placeholder"
            :value="String(sectionValues[field.uid] ?? '')"
            @input="updateSectionValue(field.uid, ($event.target as HTMLTextAreaElement).value)"
          />

          <div v-else-if="field.type === 'image_picker'" class="theme-preview__image-picker">
            <button type="button" class="ghost-button">选择图片</button>
            <span>image_picker: {{ field.id }}</span>
          </div>

          <select
            v-else-if="field.type === 'select'"
            :value="String(sectionValues[field.uid] ?? '')"
            @change="updateSectionValue(field.uid, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="option in field.options" :key="option.value" :value="option.value">
              {{ option.label || option.value }}
            </option>
          </select>

          <div v-else-if="field.type === 'radio'" class="theme-preview__radio-group">
            <label v-for="option in field.options" :key="option.value" class="theme-preview__radio">
              <input
                type="radio"
                :name="`preview-section-${field.uid}`"
                :value="option.value"
                :checked="sectionValues[field.uid] === option.value"
                @change="updateSectionValue(field.uid, option.value)"
              />
              <span>{{ option.label || option.value }}</span>
            </label>
          </div>

          <label v-else-if="field.type === 'checkbox'" class="theme-preview__checkbox">
            <input
              type="checkbox"
              :checked="Boolean(sectionValues[field.uid])"
              @change="
                updateSectionValue(field.uid, ($event.target as HTMLInputElement).checked)
              "
            />
            <span>启用</span>
          </label>

          <div v-else-if="field.type === 'range'" class="theme-preview__range">
            <input
              type="range"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :value="Number(sectionValues[field.uid] ?? field.min)"
              @input="
                updateSectionValue(
                  field.uid,
                  toNumberValue(($event.target as HTMLInputElement).value, field.min),
                )
              "
            />
            <span>{{ sectionValues[field.uid] }}{{ field.unit || '' }}</span>
          </div>

          <div v-else-if="field.type === 'color'" class="theme-preview__color">
            <input
              type="color"
              :value="String(sectionValues[field.uid] ?? '#000000')"
              @input="updateSectionValue(field.uid, ($event.target as HTMLInputElement).value)"
            />
            <input
              type="text"
              :value="String(sectionValues[field.uid] ?? '#000000')"
              @input="updateSectionValue(field.uid, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
      <div v-else class="empty-state">Section 还没有可渲染字段。</div>

      <div class="theme-preview__blocks">
        <div class="theme-preview__blocks-header">
          <strong>Blocks</strong>
          <span>{{ props.document.blocks.length }}</span>
        </div>

        <details
          v-for="block in props.document.blocks"
          :key="block.uid"
          class="theme-preview__block"
          open
        >
          <summary>
            <span>{{ resolveBlockTitle(block) }}</span>
            <small>{{ block.type || 'type_missing' }}</small>
          </summary>

          <div class="theme-preview__block-fields">
            <template v-for="field in block.settings" :key="field.uid">
              <p v-if="field.type === 'header'" class="theme-preview__block-header">
                {{ field.content || 'Header' }}
              </p>

              <div v-else class="theme-preview__field">
                <label class="theme-preview__label">{{ field.label || field.id }}</label>

                <input
                  v-if="field.type === 'text'"
                  type="text"
                  :placeholder="field.placeholder"
                  :value="String(blockValues[block.uid]?.[field.uid] ?? '')"
                  @input="
                    updateBlockValue(
                      block.uid,
                      field.uid,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />

                <textarea
                  v-else-if="field.type === 'textarea' || field.type === 'richtext'"
                  rows="3"
                  :placeholder="field.placeholder"
                  :value="String(blockValues[block.uid]?.[field.uid] ?? '')"
                  @input="
                    updateBlockValue(
                      block.uid,
                      field.uid,
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                />

                <select
                  v-else-if="field.type === 'select'"
                  :value="String(blockValues[block.uid]?.[field.uid] ?? '')"
                  @change="
                    updateBlockValue(
                      block.uid,
                      field.uid,
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                >
                  <option v-for="option in field.options" :key="option.value" :value="option.value">
                    {{ option.label || option.value }}
                  </option>
                </select>

                <label v-else-if="field.type === 'checkbox'" class="theme-preview__checkbox">
                  <input
                    type="checkbox"
                    :checked="Boolean(blockValues[block.uid]?.[field.uid])"
                    @change="
                      updateBlockValue(
                        block.uid,
                        field.uid,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                  <span>启用</span>
                </label>

                <input
                  v-else-if="field.type === 'image_picker'"
                  type="text"
                  placeholder="Select image"
                  :value="String(blockValues[block.uid]?.[field.uid] ?? '')"
                  @input="
                    updateBlockValue(
                      block.uid,
                      field.uid,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />

                <input
                  v-else-if="field.type === 'color'"
                  type="color"
                  :value="String(blockValues[block.uid]?.[field.uid] ?? '#000000')"
                  @input="
                    updateBlockValue(
                      block.uid,
                      field.uid,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />

                <input
                  v-else-if="field.type === 'range'"
                  type="range"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step"
                  :value="Number(blockValues[block.uid]?.[field.uid] ?? field.min)"
                  @input="
                    updateBlockValue(
                      block.uid,
                      field.uid,
                      toNumberValue(($event.target as HTMLInputElement).value, field.min),
                    )
                  "
                />

                <div v-else-if="field.type === 'radio'" class="theme-preview__radio-group">
                  <label
                    v-for="option in field.options"
                    :key="option.value"
                    class="theme-preview__radio"
                  >
                    <input
                      type="radio"
                      :name="`preview-block-${block.uid}-${field.uid}`"
                      :value="option.value"
                      :checked="blockValues[block.uid]?.[field.uid] === option.value"
                      @change="updateBlockValue(block.uid, field.uid, option.value)"
                    />
                    <span>{{ option.label || option.value }}</span>
                  </label>
                </div>
              </div>
            </template>
          </div>
        </details>

        <div v-if="!props.document.blocks.length" class="empty-state">当前没有 block 配置。</div>
      </div>
    </div>
  </section>
</template>
