<!-- 全宽沉浸式顶栏：三页统一，避免小图卡片+小气留白 -->
<script setup lang="ts">
import { onRemoteImageError } from '@/utils/remoteImage'

defineProps<{
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
}>()
</script>

<template>
  <section
    class="relative w-full overflow-hidden border-b border-gray-200/90 bg-stone-900/10"
    aria-label="页头"
  >
    <img
      :src="imageSrc"
      :alt="imageAlt"
      class="absolute inset-0 h-full w-full object-cover"
      width="1920"
      height="800"
      loading="eager"
      decoding="async"
      @error="onRemoteImageError"
    />
    <!-- 自左至右变亮，保证左侧标题可读、右侧图仍可见 -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/65 to-stone-500/20"
      aria-hidden="true"
    />
    <div
      class="relative z-10 flex min-h-[16rem] items-center sm:min-h-[20rem] md:min-h-[24rem] lg:min-h-[26rem]"
    >
      <div class="container w-full py-10 md:py-14 lg:py-16">
        <div class="max-w-2xl [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
          <h1 class="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {{ title }}
          </h1>
          <p class="mt-3 text-base leading-relaxed text-white/90 sm:mt-4 sm:text-lg md:text-xl">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
