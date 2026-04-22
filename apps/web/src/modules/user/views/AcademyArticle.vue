<template>
  <div class="article-page min-h-screen bg-white pt-20">
    <AppHeader />

    <div v-if="loading" class="container py-24 text-center text-gray-500">加载中…</div>

    <div v-else-if="!article" class="container py-24 text-center">
      <p class="text-lg text-gray-600">文章不存在或已下架</p>
      <RouterLink to="/academy" class="btn btn-primary mt-6 inline-block">返回美妆学院</RouterLink>
    </div>

    <article v-else class="py-12">
      <div class="container max-w-4xl">
        <header class="mb-8">
          <div class="mb-4 flex flex-wrap items-center gap-3">
            <span class="rounded bg-primary px-3 py-1 text-sm font-semibold text-white">
              {{ categoryLabel }}
            </span>
            <span class="text-gray-500">{{ formatDate(article.createdAt) }}</span>
          </div>
          <h1 class="mb-4 text-4xl font-bold text-gray-900">{{ article.title }}</h1>
          <div class="flex flex-wrap items-center gap-6 text-gray-600">
            <span>作者 {{ article.author }}</span>
            <span>👁️ {{ article.views }} 次浏览</span>
            <span>👍 {{ article.likes }} 个赞</span>
          </div>
        </header>

        <div class="mb-8 overflow-hidden rounded-lg">
          <img
            :src="article.cover"
            :alt="article.title"
            class="h-96 w-full object-cover"
            loading="eager"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="onRemoteImageError"
          />
        </div>

        <div class="prose max-w-none text-gray-800" v-html="article.content"></div>

        <footer class="mt-12 border-t border-gray-200 pt-8">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <RouterLink to="/academy" class="btn btn-secondary">← 返回列表</RouterLink>
            <button type="button" class="btn btn-primary" :disabled="likeLoading" @click="onLike">
              {{ likeLoading ? '…' : `👍 点赞 (${article.likes})` }}
            </button>
          </div>
        </footer>
      </div>
    </article>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getArticleById, likeArticle, type Article } from '@/api/article'
import { onRemoteImageError } from '@/utils/remoteImage'
import { getCategories, type Category } from '@/api/product'

const route = useRoute()
const loading = ref(true)
const likeLoading = ref(false)
const article = ref<Article | null>(null)
const categoryIdToName = ref<Map<number, string>>(new Map())

const categoryLabel = computed(() => {
  const id = article.value?.categoryId
  if (id == null) return '美妆学院'
  return categoryIdToName.value.get(id) ?? '美妆学院'
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

async function loadCategoryNames() {
  try {
    const res = await getCategories()
    const m = new Map<number, string>()
    if (res && !Array.isArray(res) && res.data) {
      for (const c of res.data as Category[]) m.set(c.id, c.name)
    }
    categoryIdToName.value = m
  } catch {
    categoryIdToName.value = new Map()
  }
}

async function loadArticle() {
  loading.value = true
  article.value = null
  const raw = route.params.id
  const id = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw)
  if (!Number.isFinite(id) || id < 1) {
    loading.value = false
    return
  }
  try {
    const res = await getArticleById(id)
    if (res?.success && res.data) {
      article.value = res.data as Article
    }
  } catch {
    article.value = null
  } finally {
    loading.value = false
  }
}

async function onLike() {
  if (!article.value || likeLoading.value) return
  likeLoading.value = true
  try {
    const res = await likeArticle(article.value.id)
    if (res?.success && res.data && typeof (res.data as Article).likes === 'number') {
      article.value.likes = (res.data as Article).likes
    }
  } catch {
    /* 静默失败，避免打断阅读 */
  } finally {
    likeLoading.value = false
  }
}

onMounted(async () => {
  await loadCategoryNames()
  await loadArticle()
})

watch(
  () => route.params.id,
  async () => {
    await loadCategoryNames()
    await loadArticle()
  }
)
</script>
