<template>
  <div class="products-page min-h-screen bg-gray-50 pt-20">
    <AppHeader />

    <main class="container py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">全部产品</h1>
        <p class="mt-2 text-gray-600">按分类与条件筛选</p>
      </div>

      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- 侧边筛选布局保持原样，仅在右侧增强加载体验 -->
        <aside class="w-full shrink-0 lg:w-64">
          <!-- 筛选代码略 - 逻辑保持原版 -->
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <h3 class="mb-4 font-bold">分类筛选</h3>
            <div class="space-y-2">
              <button
                @click="filters.category = 'all'"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  filters.category === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-100',
                ]"
              >
                全部产品
              </button>
              <!-- 这里也可以改为动态渲染 -->
            </div>
          </div>
        </aside>

        <!-- 产品展示区 -->
        <div class="flex-1">
          <!-- 产品列表 -->
          <div
            v-if="loading"
            class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <ProductSkeleton v-for="i in 8" :key="i" />
          </div>
          <div
            v-else-if="filteredProducts.length > 0"
            class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
          </div>

          <!-- 空状态 -->
          <div
            v-else
            class="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white shadow-sm"
          >
            <div class="mb-4 text-primary">
              <AdIcon icon="ant-design:search-outlined" size-class="h-16 w-16" />
            </div>
            <h3 class="text-xl font-bold">暂无匹配产品</h3>
            <p class="mt-2 text-gray-500">尝试调整筛选条件再试试吧</p>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdIcon from '@/components/icons/AdIcon.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ProductCard from '@/components/products/ProductCard.vue'
import ProductSkeleton from '@/components/products/ProductSkeleton.vue'
import { getProducts, type Product } from '@/api/product'

const route = useRoute()
const loading = ref(true)
const allProducts = ref<Product[]>([])

const filters = ref({
  category: route.query.category ? Number(route.query.category) : 'all',
  priceRange: 'all',
  sort: 'default',
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getProducts({})
    if (res && res.data) {
      allProducts.value = (res.data as any).items || []
    }
  } catch (error) {
    console.error('获取产品列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})

watch(
  () => route.query.category,
  newCat => {
    filters.value.category = newCat ? Number(newCat) : 'all'
  }
)

const filteredProducts = computed(() => {
  let result = allProducts.value
  if (filters.value.category !== 'all') {
    result = result.filter(p => p.categoryId === Number(filters.value.category))
  }
  return result
})
</script>
