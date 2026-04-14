<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import BlocksBuilder from '@/components/blocks/BlocksBuilder.vue'
import FormRenderer from '@/components/builder/FormRenderer.vue'
import JsonErrorPanel from '@/components/editor/JsonErrorPanel.vue'
import ThemeEditorPreview from '@/components/preview/ThemeEditorPreview.vue'
import SchemaMonacoEditor from '@/components/editor/SchemaMonacoEditor.vue'
import { useSchemaSync } from '@/composables/useSchemaSync'
import { useSchemaBuilderStore } from '@/stores/schemaBuilder'
import type { AddSettingFieldPayload, ShopifySettingType } from '@/types/schema'
import TrashIcon from '@/components/icons/TrashIcon.vue'

const store = useSchemaBuilderStore()
const { copied, issueSummary, initialize, onEditorChange, formatJson, resetExample, copyJson } =
  useSchemaSync()

const document = computed(() => store.schemaDocument)
const rightPaneView = ref<'config' | 'preview'>('config')

const handleAddSectionSetting = (payload: AddSettingFieldPayload) => {
  if (!payload.type) return
  store.addSectionSetting(payload.type, payload.initial)
}

const handleMoveSectionSetting = ({ from, to }: { from: number; to: number }) => {
  if (to < 0 || to > document.value.settings.length) return
  store.moveSectionSetting(from, to)
}

const handleBlockMove = ({ from, to }: { from: number; to: number }) => {
  if (to < 0 || to >= document.value.blocks.length) return
  store.moveBlock(from, to)
}

const handleAddBlockSetting = ({
  blockUid,
  type,
  initial,
}: {
  blockUid: string
  type: ShopifySettingType
  initial?: Record<string, unknown>
}) => {
  if (!type) return
  store.addBlockSetting(blockUid, type, initial)
}

onMounted(() => {
  initialize()
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar__content">
        <h1>Shopify Schema Visual Builder</h1>
        <p class="subtitle">
          将 Shopify `{% schema %}` JSON 解析为可视化表单，并在 可视化表单 与 JSON 之间实时双向同步。
        </p>
      </div>

      <div class="toolbar">
        <button class="ghost-button" @click="rightPaneView = rightPaneView === 'config' ? 'preview' : 'config'">
          {{ rightPaneView === 'config' ? '切换到预览' : '切换到配置' }}
        </button>
        <button class="ghost-button" @click="resetExample">重置示例</button>
        <button class="ghost-button" @click="formatJson">格式化 JSON</button>
        <button class="primary-button" @click="copyJson">
          {{ copied ? '已复制' : '复制 Schema' }}
        </button>
      </div>

      <p class="author-meta topbar__author">
        <a href="https://github.com/terenzzzz" target="_blank" rel="noreferrer">@Terence</a>
      </p>
    </header>

    <main class="workspace">
      <section class="workspace__left">
        <section class="editor-panel">
          <div class="panel-section__header">
            <div>
              <h3>JSON Editor</h3>
              <p>Monaco 提供高亮与语法校验;</p>
            </div>
          </div>
          <SchemaMonacoEditor
            :model-value="store.rawJsonDraft"
            @update:model-value="onEditorChange"
          />
        </section>

        <JsonErrorPanel :issues="issueSummary" />
      </section>

      <section class="workspace__right">
        <template v-if="rightPaneView === 'config'">
          <section class="panel-section">
            <div class="panel-section__header">
              <div>
                <h3>Section Meta</h3>
                <p>编辑 section 顶层元信息，这些字段会直接写回 schema 根节点。</p>
              </div>
            </div>
            <div class="field-grid">
              <label>
                <span>Name</span>
                <input
                  :value="document.name"
                  @input="store.updateMeta({ name: ($event.target as HTMLInputElement).value })"
                />
              </label>
              <label>
                <span>Tag</span>
                <input
                  :value="document.tag"
                  @input="store.updateMeta({ tag: ($event.target as HTMLInputElement).value })"
                />
              </label>
              <label>
                <span>Class</span>
                <input
                  :value="document.class"
                  @input="store.updateMeta({ class: ($event.target as HTMLInputElement).value })"
                />
              </label>
            </div>
          </section>

          <FormRenderer
            title="Section Settings"
            description="支持 header、text、textarea、richtext、image_picker、select、checkbox、radio、range、color。"
            :settings="document.settings"
            allow-reorder
            @add="handleAddSectionSetting"
            @move="handleMoveSectionSetting"
            @update="store.updateSectionSetting($event.uid, $event.payload)"
            @remove="store.removeSectionSetting"
          />

          <BlocksBuilder
            :blocks="document.blocks"
            @add-block="store.addBlock"
            @update-block="store.updateBlock($event.uid, $event.patch)"
            @remove-block="store.removeBlock"
            @move-block="handleBlockMove"
            @add-setting="handleAddBlockSetting"
            @update-setting="store.updateBlockSetting($event.blockUid, $event.fieldUid, $event.patch)"
            @remove-setting="store.removeBlockSetting($event.blockUid, $event.fieldUid)"
          />

          <section class="panel-section">
            <div class="panel-section__header">
              <div>
                <h3>Presets</h3>
              </div>
              <button class="ghost-button" @click="store.addPreset">新增 preset</button>
            </div>

            <div v-if="document.presets.length" class="preset-list">
              <article v-for="preset in document.presets" :key="preset.uid" class="preset-card">
                <div class="field-grid">
                  <label>
                    <span>Name</span>
                    <input
                      :value="preset.name"
                      @input="store.updatePreset(preset.uid, { name: ($event.target as HTMLInputElement).value })"
                    />
                  </label>
                  <label>
                    <span>Category</span>
                    <input
                      :value="preset.category || ''"
                      @input="store.updatePreset(preset.uid, { category: ($event.target as HTMLInputElement).value })"
                    />
                  </label>
                </div>
                <label class="field-stack">
                  <span>Blocks（逗号分隔 block.type）</span>
                  <input
                    :value="preset.blocks?.join(', ') || ''"
                    @input="store.updatePreset(preset.uid, { blocks: ($event.target as HTMLInputElement).value.split(',').map((item) => item.trim()).filter(Boolean) })"
                  />
                </label>
                <div class="align-end">
                  <button class="ghost-button danger" @click="store.removePreset(preset.uid)">
                    <TrashIcon />
                  </button>
                </div>
              </article>
            </div>
          </section>
        </template>

        <ThemeEditorPreview v-else :document="document" />
      </section>
    </main>
  </div>
</template>
