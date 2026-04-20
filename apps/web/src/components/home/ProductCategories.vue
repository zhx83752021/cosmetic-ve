<template>
  <section class="py-20 bg-white">
    <div class="container">
      <div class="mb-12 text-center">
        <div
          class="mb-3 inline-block rounded-full bg-gradient-to-r from-accent-lavender/10 to-primary/10 px-6 py-2 text-sm font-semibold text-primary-dark">
          🌸 Categories
        </div>
        <h2 class="mb-4 text-4xl font-bold text-text-primary">产品分类</h2>
        <p class="text-lg text-text-secondary">探索我们的全系列产品</p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <RouterLink v-for="category in activeCategories" :key="category.id" :to="`/products?category=${category.id}`"
          class="card group cursor-pointer overflow-hidden p-0 transition-transform hover:scale-105">
          <div class="relative h-80 overflow-hidden">
            <img :src="getCategoryImage(category.name)" :alt="category.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/20 to-transparent">
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 class="mb-2 text-2xl font-bold drop-shadow-lg">{{ category.name }}</h3>
              <p class="text-sm opacity-90 drop-shadow-md">{{ getCategoryDesc(category.name) }}</p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getCategories } from '@/api/product'

const backendCategories = ref<any[]>([])

const fetchCategories = async () => {
  try {
    const res = await getCategories()
    if (res && res.data) {
      backendCategories.value = res.data as any[]
      return
    }
    throw new Error('API data empty')
  } catch (error) {
    console.warn('首页加载分类 API 不可用，使用降级数据:', error)
    // 降级使用稳健的 Mock 数据，确保首页始终有内容
    backendCategories.value = [
      { id: 1, name: '护肤系列' },
      { id: 2, name: '彩妆系列' },
      { id: 3, name: '香水系列' },
      { id: 4, name: '礼盒套装' },
    ]
  }
}

onMounted(() => {
  fetchCategories()
})

const activeCategories = computed(() => {
  return backendCategories.value.slice(0, 4)
})

const getCategoryImage = (name: string) => {
  if (name.includes('护肤')) return '/uploads/products/serum.png'
  if (name.includes('彩妆')) return '/uploads/products/lipstick.png'
  if (name.includes('香水')) return '/uploads/products/perfume.png'
  return '/uploads/products/candle.png'
}

const getCategoryDesc = (name: string) => {
  if (name.includes('护肤')) return '专业护肤，呵护每一寸肌肤'
  if (name.includes('彩妆')) return '精致彩妆，展现独特魅力'
  if (name.includes('香水')) return '迷人香氛，留下优雅印记'
  return '精选组合，完美礼赠之选'
}
</script>
