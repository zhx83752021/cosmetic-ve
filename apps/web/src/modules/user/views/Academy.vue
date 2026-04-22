<template>
  <div class="academy-page min-h-screen bg-neutral-gray pt-20">
    <AppHeader />

    <section class="bg-primary-dark py-12 text-white">
      <div class="container">
        <h1 class="mb-2 text-4xl font-bold">美妆学院</h1>
        <p class="text-lg opacity-90">专业美妆知识，打造精致生活</p>
      </div>
    </section>

    <section class="py-12">
      <div class="container">
        <div class="mb-6 flex flex-wrap gap-4 border-b border-gray-200 pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            :class="[
              'rounded-full px-5 py-2 text-sm font-medium transition-colors',
              currentCategory === tab.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100',
            ]"
            @click="currentCategory = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="loading" class="py-24 text-center text-gray-500">加载中…</div>
        <div v-else-if="articles.length === 0" class="py-24 text-center text-gray-500">
          该分类下暂无文章，看看其他分类吧
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="article in articles"
            :key="article.id"
            :to="`/academy/${article.id}`"
            class="card block overflow-hidden p-0 transition-shadow hover:shadow-lg"
          >
            <img :src="article.cover" :alt="article.title" class="h-48 w-full object-cover" />
            <div class="p-6">
              <h3 class="mb-2 text-lg font-semibold text-gray-900">{{ article.title }}</h3>
              <p class="line-clamp-2 text-sm text-gray-600">
                {{ article.summary || '点击查看全文' }}
              </p>
              <div class="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span>{{ article.author }}</span>
                <span>·</span>
                <span>{{ formatDate(article.createdAt) }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getCategories, type Category } from '@/api/product'
import { getPublishedArticles, type ArticleListItem } from '@/api/article'

const currentCategory = ref('all')
const loading = ref(true)
const articles = ref<ArticleListItem[]>([])

const tabs = ref<{ value: string; label: string; categoryId?: number }[]>([
  { value: 'all', label: '全部' },
])

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })

async function buildTabs() {
  const base: { value: string; label: string; categoryId?: number }[] = [
    { value: 'all', label: '全部' },
  ]
  try {
    const res = await getCategories()
    if (!res || Array.isArray(res)) {
      tabs.value = base
      return
    }
    const cats: Category[] = res.data ?? []
    const skin = cats.find(c => c.name.includes('护肤'))
    const makeup = cats.find(c => c.name.includes('彩妆'))
    if (skin) base.push({ value: 'skincare', label: '护肤', categoryId: skin.id })
    if (makeup) base.push({ value: 'makeup', label: '彩妆', categoryId: makeup.id })
  } catch {
    /* 仅保留「全部」 */
  }
  tabs.value = base
}

async function fetchArticles() {
  loading.value = true
  try {
    const tab = tabs.value.find(t => t.value === currentCategory.value)
    const params: { page: number; pageSize: number; categoryId?: number } = {
      page: 1,
      pageSize: 24,
    }
    if (tab?.categoryId != null) params.categoryId = tab.categoryId

    const res = await getPublishedArticles(params)
    if (res?.success && res.data?.items) {
      articles.value = res.data.items
    } else {
      articles.value = []
    }
  } catch {
    articles.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await buildTabs()
  await fetchArticles()
})

watch(currentCategory, () => {
  fetchArticles()
})
</script>
