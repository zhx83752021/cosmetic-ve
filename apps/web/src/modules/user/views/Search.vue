<template>
  <div class="search-page min-h-screen bg-neutral-gray pt-20">
    <AppHeader />

    <section class="py-12">
      <div class="container">
        <div class="mb-8">
          <div class="mx-auto max-w-2xl">
            <div class="flex gap-3">
              <input
                v-model="keyword"
                type="text"
                class="input flex-1"
                placeholder="搜索商品、美妆学院文章…"
                @keyup.enter="handleSearch"
              />
              <button class="btn btn-primary" :disabled="searching" @click="handleSearch">
                {{ searching ? '搜索中…' : '搜索' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="hasSearched">
          <p v-if="!searching" class="mb-6 text-gray-600">
            找到
            <span class="font-semibold">{{ productResults.length + articleResults.length }}</span>
            个相关结果（商品 {{ productResults.length }}，文章 {{ articleResults.length }}）
          </p>

          <div v-if="searching" class="py-16 text-center text-gray-500">搜索中…</div>
          <template v-else>
            <div
              v-if="productResults.length === 0 && articleResults.length === 0"
              class="py-20 text-center text-gray-500"
            >
              <div class="mb-4 text-6xl">🔍</div>
              <p class="text-xl">没有找到相关内容</p>
              <p class="mt-2">试试其他关键词吧</p>
            </div>
            <template v-else>
              <div v-if="productResults.length" class="mb-10">
                <h2 class="mb-4 text-lg font-bold text-gray-900">商品</h2>
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div
                    v-for="item in productResults"
                    :key="'p-' + item.id"
                    class="card cursor-pointer overflow-hidden p-0"
                    @click="router.push('/product/' + item.id)"
                  >
                    <img
                      :src="productImage(item)"
                      :alt="item.name"
                      class="h-48 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="onRemoteImageError"
                    />
                    <div class="p-4">
                      <h3 class="mb-2 line-clamp-2 font-semibold">{{ item.name }}</h3>
                      <p class="font-bold text-primary">¥{{ Number(item.price) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="articleResults.length">
                <h2 class="mb-4 text-lg font-bold text-gray-900">美妆学院</h2>
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <RouterLink
                    v-for="a in articleResults"
                    :key="'a-' + a.id"
                    :to="`/academy/${a.id}`"
                    class="card block overflow-hidden p-0"
                  >
                    <img
                      :src="a.cover"
                      :alt="a.title"
                      class="h-40 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerpolicy="no-referrer"
                      @error="onRemoteImageError"
                    />
                    <div class="p-4">
                      <h3 class="line-clamp-2 font-semibold">{{ a.title }}</h3>
                    </div>
                  </RouterLink>
                </div>
              </div>
            </template>
          </template>
        </div>

        <div v-else class="mx-auto max-w-2xl">
          <h3 class="mb-4 font-semibold">热门搜索</h3>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="tag in hotTags"
              :key="tag"
              class="rounded-full bg-gray-100 px-4 py-2 text-sm hover:bg-primary hover:text-white"
              @click="searchByTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { getProducts, type Product } from '@/api/product'
import { getPublishedArticles, type ArticleListItem } from '@/api/article'
import { onRemoteImageError, REMOTE_IMAGE_FALLBACK } from '@/utils/remoteImage'

const router = useRouter()
const keyword = ref('')
const hasSearched = ref(false)
const searching = ref(false)
const productResults = ref<Product[]>([])
const articleResults = ref<ArticleListItem[]>([])

const hotTags = ['精华', '口红', '护肤', '彩妆', '防晒', '雾面唇釉']

const productImage = (p: Product) => p.images?.[0] || REMOTE_IMAGE_FALLBACK

const runSearch = async (kw: string) => {
  hasSearched.value = true
  searching.value = true
  productResults.value = []
  articleResults.value = []
  try {
    const [pRes, aRes] = await Promise.all([
      getProducts({ keyword: kw || undefined, page: 1, pageSize: 24, sortBy: 'createdAt' }),
      getPublishedArticles({ keyword: kw || undefined, page: 1, pageSize: 12 }),
    ])
    if (pRes && 'success' in pRes && pRes.success && pRes.data && 'items' in pRes.data) {
      productResults.value = pRes.data.items as Product[]
    }
    if (aRes && 'success' in aRes && aRes.success && aRes.data?.items) {
      articleResults.value = aRes.data.items
    }
  } finally {
    searching.value = false
  }
}

const handleSearch = () => {
  const kw = keyword.value.trim()
  if (!kw) {
    hasSearched.value = true
    productResults.value = []
    articleResults.value = []
    return
  }
  void runSearch(kw)
}

const searchByTag = (tag: string) => {
  keyword.value = tag
  void runSearch(tag)
}
</script>
