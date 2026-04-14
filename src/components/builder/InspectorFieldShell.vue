<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    type: string
    meta?: string
    open?: boolean
  }>(),
  {
    meta: '',
    open: false,
  },
)
</script>

<template>
  <details class="inspector-field" :open="open">
    <summary class="inspector-field__summary">
      <div class="inspector-field__summary-main">
        <p class="inspector-field__type">{{ type }}</p>
        <strong>{{ title }}</strong>
      </div>
      <span v-if="meta" class="inspector-field__meta">{{ meta }}</span>
    </summary>

    <div class="inspector-field__body">
      <div class="inspector-field__actions">
        <slot name="actions" />
      </div>
      <slot />
    </div>
  </details>
</template>
