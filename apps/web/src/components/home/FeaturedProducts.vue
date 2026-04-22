<template>
  <section class="py-20 bg-gradient-to-b from-neutral-cream to-white">
    <div class="container">
      <div class="mb-12 text-center">
        <div
          class="mb-3 inline-block rounded-full bg-gradient-to-r from-primary/10 to-accent-pink/10 px-6 py-2 text-sm font-semibold text-primary"
        >
          ✨ Featured Products
        </div>
        <h2 class="mb-4 text-4xl font-bold text-text-primary">精选推荐</h2>
        <p class="text-lg text-text-secondary">为您精心挑选的明星产品</p>
      </div>

      <p v-if="loading" class="py-12 text-center text-text-secondary">加载中…</p>
      <p
        v-else-if="loadError || products.length === 0"
        class="py-12 text-center text-text-secondary"
      >
        暂无推荐商品，请稍后在产品中心查看
      </p>
      <div v-else class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="card group cursor-pointer overflow-hidden p-0 transition-transform hover:scale-105"
          @click="goToProduct(product.id)"
        >
          <!-- 产品图片 -->
          <div class="relative overflow-hidden">
            <img
              :src="product.image"
              :alt="product.name"
              class="h-80 w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="onRemoteImageError"
            />
            <!-- 标签 -->
            <div class="absolute left-4 top-4 flex flex-col gap-2">
              <span
                v-if="product.isNew"
                class="rounded-full bg-gradient-to-r from-accent-pink to-accent-coral px-3 py-1 text-xs font-semibold text-white shadow-sm"
              >
                NEW
              </span>
              <span
                v-if="product.isHot"
                class="rounded-full bg-gradient-to-r from-accent-gold to-primary px-3 py-1 text-xs font-semibold text-white shadow-sm"
              >
                HOT
              </span>
            </div>
            <!-- 快速操作按钮 -->
            <div
              class="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <button class="btn btn-primary flex-1" @click.stop="addToCart(product)">
                加入购物车
              </button>
            </div>
          </div>

          <!-- 产品信息 -->
          <div class="p-6 bg-gradient-to-b from-white to-neutral-cream/30">
            <h3 class="mb-2 text-lg font-semibold text-text-primary line-clamp-2">
              {{ product.name }}
            </h3>
            <p class="mb-3 text-sm text-text-secondary line-clamp-1">
              {{ product.subtitle }}
            </p>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold text-primary"> ¥{{ product.price }} </span>
                <span v-if="product.originalPrice" class="text-sm text-gray-400 line-through">
                  ¥{{ product.originalPrice }}
                </span>
              </div>
              <div class="flex items-center gap-1 text-sm text-gray-500">
                <StarIcon class="h-4 w-4 text-accent-gold" />
                <span>{{ product.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loadError && products.length > 0" class="mt-12 text-center">
        <RouterLink to="/products" class="btn btn-secondary btn-lg"> 查看全部产品 </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import StarIcon from '@/components/icons/StarIcon.vue'
import { getProducts, type Product as ApiProduct } from '@/api/product'
import { onRemoteImageError, REMOTE_IMAGE_FALLBACK } from '@/utils/remoteImage'

interface Product {
  id: number
  name: string
  subtitle: string
  image: string
  price: number
  originalPrice?: number
  rating: number
  isNew: boolean
  isHot: boolean
  stock: number
}

const router = useRouter()
const cartStore = useCartStore()

const products = ref<Product[]>([])
const loadError = ref(false)
const loading = ref(true)

function mapFromApi(p: ApiProduct & { subTitle?: string; images: string[] }): Product {
  const img0 = p.images?.[0]
  return {
    id: p.id,
    name: p.name,
    subtitle: p.subTitle || '',
    image: img0 && img0.length > 0 ? img0 : REMOTE_IMAGE_FALLBACK,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
    rating: p.rating != null && !Number.isNaN(Number(p.rating)) ? Number(p.rating) : 4.8,
    isNew: p.isNew,
    isHot: p.isHot,
    stock: p.stock ?? 99,
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const tryHot = await getProducts({ page: 1, pageSize: 4, isHot: true, sortBy: 'sales' })
    let list: ApiProduct[] = []
    if (tryHot?.success && (tryHot.data as { items?: ApiProduct[] })?.items?.length) {
      list = (tryHot.data as { items: ApiProduct[] }).items
    } else {
      const fallback = await getProducts({ page: 1, pageSize: 4, sortBy: 'createdAt' })
      if (fallback?.success && (fallback.data as { items?: ApiProduct[] })?.items?.length) {
        list = (fallback.data as { items: ApiProduct[] }).items
      }
    }
    products.value = list.map(mapFromApi)
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})

const goToProduct = (id: number) => {
  router.push(`/product/${id}`)
}

const addToCart = (product: Product) => {
  cartStore.addToCart({
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    quantity: 1,
    selected: true,
    stock: product.stock,
  })
  // TODO: 显示添加成功提示
  console.log('已添加到购物车:', product.name)
}
</script>
