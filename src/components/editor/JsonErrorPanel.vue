<script setup lang="ts">
import type { ValidationIssue } from '@/types/schema'

defineProps<{
  issues: ValidationIssue[]
}>()
</script>

<template>
  <section class="error-panel">
    <div class="panel-section__header">
      <div>
        <h3>校验与错误</h3>
        <p>结构错误会在这里提示。</p>
      </div>
    </div>

    <div v-if="issues.length" class="issue-list">
      <article
        v-for="issue in issues"
        :key="`${issue.path}-${issue.message}`"
        class="issue-item"
        :data-severity="issue.severity"
      >
        <strong>{{ issue.path }}</strong>
        <span>{{ issue.message }}</span>
      </article>
    </div>
    <div v-else class="empty-state">未发现校验错误，UI 与 JSON 当前已同步。</div>
  </section>
</template>
