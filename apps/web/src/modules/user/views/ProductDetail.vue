<template>
  <div class="product-detail min-h-screen bg-white pt-20">
    <AppHeader />

    <section v-if="product" class="py-12">
      <div class="container overflow-hidden">
        <div class="grid gap-12 lg:grid-cols-2">
          <!-- 产品图片 -->
          <div>
            <!-- 主图 -->
            <div class="mb-4 overflow-hidden rounded-card">
              <img :src="currentImage" :alt="product.name" class="h-[600px] w-full object-cover" />
            </div>
            <!-- 缩略图 -->
            <div class="grid grid-cols-4 gap-4">
              <div
                v-for="(image, index) in product.images"
                :key="index"
                :class="[
                  'cursor-pointer overflow-hidden rounded-lg border-2 transition-colors',
                  currentImage === image ? 'border-primary' : 'border-transparent',
                ]"
                @click="currentImage = image"
              >
                <img
                  :src="image"
                  :alt="`${product.name} ${index + 1}`"
                  class="h-24 w-full object-cover"
                />
              </div>
            </div>
          </div>

          <!-- 产品信息 -->
          <div>
            <!-- 标签 -->
            <div class="mb-4 flex gap-2">
              <span
                v-if="product.isNew"
                class="rounded-full bg-accent-pink px-3 py-1 text-xs font-semibold text-white"
              >
                NEW
              </span>
              <span
                v-if="product.isHot"
                class="rounded-full bg-accent-gold px-3 py-1 text-xs font-semibold text-white"
              >
                HOT
              </span>
            </div>

            <h1 class="mb-2 text-3xl font-bold text-gray-900">{{ product.name }}</h1>
            <p class="mb-4 text-lg text-gray-600">{{ product.subTitle }}</p>

            <!-- 评分 -->
            <div class="mb-6 flex items-center gap-4">
              <div class="flex items-center gap-1">
                <StarIcon class="h-5 w-5 text-accent-gold" />
                <span class="font-semibold">{{ (product as any).rating || 5.0 }}</span>
              </div>
              <span class="text-gray-500">{{ (product as any).reviewCount || 100 }} 条评价</span>
              <span class="text-gray-500">已售 {{ product.sales }}+</span>
            </div>

            <!-- 价格 -->
            <div class="mb-8 rounded-lg bg-neutral-gray p-6">
              <div class="flex items-baseline gap-4">
                <span class="text-4xl font-bold text-primary">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="text-xl text-gray-400 line-through">
                  ¥{{ product.originalPrice }}
                </span>
              </div>
              <p class="mt-2 text-sm text-gray-600">VIP会员可享受更多优惠</p>
            </div>

            <!-- SKU选择 -->
            <div v-if="product.skus && product.skus.length" class="mb-6">
              <h3 class="mb-3 font-semibold">选择规格</h3>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="sku in (product as any).skus"
                  :key="sku.id"
                  :class="[
                    'rounded-lg border-2 px-4 py-2 transition-colors',
                    selectedSku?.id === sku.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-300 hover:border-primary',
                  ]"
                  @click="selectedSku = sku"
                >
                  {{ sku.name }}
                </button>
              </div>
            </div>

            <!-- 数量选择 -->
            <div class="mb-6">
              <h3 class="mb-3 font-semibold">数量</h3>
              <div class="flex items-center gap-3">
                <button
                  class="btn btn-secondary h-10 w-10 p-0"
                  :disabled="quantity <= 1"
                  @click="quantity--"
                >
                  -
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="product.stock"
                  class="input h-10 w-20 text-center"
                />
                <button
                  class="btn btn-secondary h-10 w-10 p-0"
                  :disabled="quantity >= product.stock"
                  @click="quantity++"
                >
                  +
                </button>
                <span class="text-sm text-gray-500">库存 {{ product.stock }} 件</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-4">
              <button class="btn btn-primary flex-1 btn-lg" @click="addToCart">加入购物车</button>
              <button class="btn btn-secondary btn-lg" @click="buyNow">立即购买</button>
            </div>
          </div>
        </div>

        <!-- 产品详情 -->
        <div class="mt-16">
          <div class="mb-8 border-b border-gray-200 overflow-x-auto">
            <div class="flex gap-8 whitespace-nowrap">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                :class="[
                  'pb-4 text-lg font-semibold transition-colors',
                  activeTab === tab.value
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-primary',
                ]"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="prose max-w-none">
            <div v-if="activeTab === 'description'" v-html="product.description"></div>
            <div v-if="activeTab === 'details'" v-html="product.details"></div>
            <div v-if="activeTab === 'ingredients'" v-html="product.ingredients"></div>
            <div v-if="activeTab === 'usage'" v-html="product.usage"></div>
          </div>
        </div>

        <!-- 相关推荐 -->
        <div class="mt-20 border-t pt-16">
          <h3 class="mb-8 text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span class="text-primary">✨</span> 猜你喜欢
          </h3>
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="related in relatedProducts" :key="related.id" 
              class="group cursor-pointer rounded-card bg-neutral-cream/20 p-4 transition-all hover:bg-white hover:shadow-xl"
              @click="goToRelated(related.id)">
              <div class="mb-4 overflow-hidden rounded-lg">
                <img :src="related.images[0]" :alt="related.name" class="h-48 w-full object-cover transition-transform group-hover:scale-110" />
              </div>
              <h4 class="mb-1 font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{{ related.name }}</h4>
              <p class="mb-2 text-sm text-gray-500 line-clamp-1">{{ related.subTitle }}</p>
              <div class="flex items-center justify-between">
                <span class="font-bold text-primary">¥{{ related.price }}</span>
                <span class="text-xs text-gray-400">已售 {{ related.sales }}+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import StarIcon from '@/components/icons/StarIcon.vue'
import { getProductById, getProducts, type Product } from '@/api/product'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const currentImage = ref('')
const selectedSku = ref<any>(null)
const quantity = ref(1)
const activeTab = ref('description')
const relatedProducts = ref<Product[]>([])

const tabs = [
  { value: 'description', label: '产品介绍' },
  { value: 'details', label: '产品详情' },
  { value: 'ingredients', label: '成分说明' },
  { value: 'usage', label: '使用方法' },
]

const initProductData = async (productId: any) => {
  if (!productId) return

  try {
    const res = await getProductById(Number(productId))
    if (res && res.data) {
      const data = res.data as any
      product.value = data
      currentImage.value = data.images && data.images.length > 0 ? data.images[0] : ''
      
      if (data.skus && data.skus.length > 0) {
        selectedSku.value = data.skus[0]
      }

      const relRes = await getProducts({ categoryId: data.categoryId, pageSize: 5 })
      if (relRes && relRes.data) {
        relatedProducts.value = ((relRes.data as any).items || []).filter((p: any) => p.id !== Number(productId)).slice(0, 4)
      }
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
  }
}

onMounted(() => {
  initProductData(route.params.id)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    initProductData(newId)
  }
})

const goToRelated = (id: number) => {
  router.push(`/product/${id}`)
}

const addToCart = () => {
  if (!product.value) return

  cartStore.addToCart({
    id: product.value.id,
    skuId: selectedSku.value?.id,
    name: product.value.name,
    image: product.value.images[0],
    price: selectedSku.value?.price || product.value.price,
    quantity: quantity.value,
    selected: true,
    stock: product.value.stock,
    specs: selectedSku.value ? [{ name: '规格', value: selectedSku.value.name }] : undefined,
  })
}

const buyNow = () => {
  addToCart()
  router.push('/checkout')
}
</script>
