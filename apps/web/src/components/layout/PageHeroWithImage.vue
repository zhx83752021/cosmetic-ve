<!-- 带配图的页面顶栏：与下方内容区在色彩与层次上区分 -->
<script setup lang="ts">
import { onRemoteImageError } from '@/utils/remoteImage'

withDefaults(
  defineProps<{
    title: string
    subtitle: string
    imageSrc: string
    imageAlt: string
    /** split：左文右图；stack：标题居中、图在下方（适合品牌故事） */
    layout?: 'split' | 'stack'
  }>(),
  { layout: 'split' }
)
</script>

<template>
  <section class="border-b border-gray-200/80 bg-neutral-cream">
    <div v-if="layout === 'stack'" class="container py-10 md:py-12">
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="mb-3 text-4xl font-bold text-text-primary md:text-5xl">
          {{ title }}
        </h1>
        <p class="text-lg text-text-secondary md:text-xl">{{ subtitle }}</p>
        <div class="mt-8 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
          <img
            :src="imageSrc"
            :alt="imageAlt"
            class="h-48 w-full object-cover sm:h-56"
            width="1200"
            height="500"
            loading="eager"
            decoding="async"
            @error="onRemoteImageError"
          />
        </div>
      </div>
    </div>

    <div v-else class="container py-10 md:py-12">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:gap-10 lg:gap-12">
        <div class="order-2 w-full min-w-0 flex-1 md:order-1">
          <h1
            class="mb-2 text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl md:leading-tight"
          >
            {{ title }}
          </h1>
          <p class="text-base text-text-secondary sm:text-lg md:text-xl">{{ subtitle }}</p>
        </div>
        <div class="order-1 w-full shrink-0 md:order-2 md:max-w-md">
          <div class="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm">
            <img
              :src="imageSrc"
              :alt="imageAlt"
              class="h-44 w-full object-cover sm:h-48 md:h-52"
              width="800"
              height="416"
              loading="eager"
              decoding="async"
              @error="onRemoteImageError"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
