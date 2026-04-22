<!-- Ant Design 线型图标（@iconify/vue），替代 emoji 功能图标 -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(
  defineProps<{
    icon: string
    /** Tailwind 尺寸类，默认 w-4 h-4 */
    sizeClass?: string
  }>(),
  { sizeClass: 'h-4 w-4' }
)
</script>

<template>
  <Icon
    :icon="icon"
    :class="sizeClass"
    class="inline-block shrink-0 text-current"
    aria-hidden="true"
  />
</template>
