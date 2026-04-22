<template>
  <div class="cart-page min-h-screen bg-gradient-to-b from-neutral-gray to-white pt-20">
    <AppHeader />

    <section class="py-12">
      <div class="container">
        <!-- 页面标题 -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">购物车</h1>
            <p class="mt-2 text-sm text-gray-600">
              {{
                cartStore.items.length > 0
                  ? `共 ${cartStore.items.length} 件商品`
                  : '还没有添加商品'
              }}
            </p>
          </div>
          <RouterLink to="/products" class="btn btn-secondary inline-flex items-center gap-2">
            <AdIcon icon="ant-design:shopping-outlined" size-class="h-4 w-4" />
            继续购物
          </RouterLink>
        </div>

        <!-- 空购物车状态 -->
        <div v-if="cartStore.items.length === 0" class="text-center py-20">
          <div
            class="mb-6 inline-flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent-pink/10"
          >
            <div class="text-primary">
              <AdIcon icon="ant-design:shopping-cart-outlined" size-class="h-20 w-20" />
            </div>
          </div>
          <p class="mb-2 text-2xl font-semibold text-gray-900">购物车是空的</p>
          <p class="mb-8 text-gray-500">快去挑选心仪的商品吧</p>
          <RouterLink
            to="/products"
            class="btn btn-primary btn-lg inline-flex items-center gap-2 shadow-lg transition-all hover:shadow-xl"
          >
            <AdIcon icon="ant-design:shop-outlined" size-class="h-5 w-5" />
            去选购
          </RouterLink>
        </div>

        <div v-else class="grid gap-8 lg:grid-cols-3">
          <!-- 购物车列表 -->
          <div class="lg:col-span-2 space-y-4">
            <!-- 全选和清空 -->
            <div class="card">
              <div class="flex items-center justify-between p-4">
                <label class="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    class="mr-3 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    @change="toggleAllSelected"
                  />
                  <span class="font-medium text-gray-900 group-hover:text-primary transition-colors"
                    >全选</span
                  >
                </label>
                <button
                  class="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-red-500"
                  type="button"
                  @click="clearCart"
                >
                  <AdIcon icon="ant-design:delete-outlined" size-class="h-4 w-4" />
                  清空购物车
                </button>
              </div>
            </div>

            <!-- 商品列表 -->
            <div class="space-y-4">
              <div
                v-for="item in cartStore.items"
                :key="`${item.id}-${item.skuId || ''}`"
                class="card group hover:shadow-lg transition-all duration-300"
              >
                <div class="flex gap-4 p-4">
                  <!-- 选择框 -->
                  <div class="flex items-center pt-2">
                    <input
                      v-model="item.selected"
                      type="checkbox"
                      class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  <!-- 商品图片 -->
                  <div class="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      :src="item.image"
                      :alt="item.name"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <!-- 商品信息 -->
                  <div class="flex flex-1 flex-col justify-between">
                    <div>
                      <h3
                        class="font-semibold text-gray-900 group-hover:text-primary transition-colors"
                      >
                        {{ item.name }}
                      </h3>
                      <p v-if="item.specs" class="mt-1 flex flex-wrap gap-2 text-sm">
                        <span
                          v-for="spec in item.specs"
                          :key="spec.name"
                          class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          {{ spec.name }}: {{ spec.value }}
                        </span>
                      </p>
                    </div>
                    <div class="flex items-center justify-between mt-3">
                      <div class="flex items-baseline gap-2">
                        <span class="text-xl font-bold text-primary">¥{{ item.price }}</span>
                        <span class="text-sm text-gray-400">x {{ item.quantity }}</span>
                      </div>
                      <span class="text-sm text-gray-500">库存: {{ item.stock }}</span>
                    </div>
                  </div>

                  <!-- 数量控制 -->
                  <div class="flex flex-col items-end justify-between">
                    <div class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white">
                      <button
                        class="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        :disabled="item.quantity <= 1"
                        @click="updateQuantity(item, item.quantity - 1)"
                      >
                        <span class="text-lg">−</span>
                      </button>
                      <input
                        :value="item.quantity"
                        type="number"
                        min="1"
                        :max="item.stock"
                        class="h-9 w-14 text-center border-0 text-gray-900 font-medium focus:ring-0"
                        @change="handleQuantityChange(item, $event)"
                      />
                      <button
                        class="flex h-9 w-9 items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        :disabled="item.quantity >= item.stock"
                        @click="updateQuantity(item, item.quantity + 1)"
                      >
                        <span class="text-lg">+</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      class="mt-2 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-500"
                      @click="removeItem(item)"
                    >
                      <AdIcon icon="ant-design:delete-outlined" size-class="h-4 w-4" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 订单摘要 -->
          <div class="lg:col-span-1">
            <div class="card sticky top-24 shadow-lg">
              <div class="mb-6">
                <h2 class="text-xl font-bold text-gray-900">订单摘要</h2>
                <p class="mt-1 text-sm text-gray-500">已选择 {{ selectedItemCount }} 件商品</p>
              </div>

              <div class="space-y-4 border-b border-gray-200 pb-5">
                <div class="flex justify-between">
                  <span class="text-gray-600">商品件数</span>
                  <span class="font-medium text-gray-900">{{ selectedItemCount }} 件</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">商品总价</span>
                  <span class="font-medium text-gray-900"
                    >¥{{ cartStore.selectedTotalPrice.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">运费</span>
                  <span
                    v-if="shippingFee === 0"
                    class="inline-flex items-center gap-1 font-medium text-green-600"
                  >
                    <AdIcon icon="ant-design:check-circle-outlined" size-class="h-4 w-4" />
                    免运费
                  </span>
                  <span v-else class="font-medium text-gray-900"
                    >¥{{ shippingFee.toFixed(2) }}</span
                  >
                </div>
              </div>

              <div
                class="my-5 flex items-center justify-between rounded-lg bg-gradient-to-r from-primary/10 to-accent-pink/10 p-4"
              >
                <span class="text-lg font-semibold text-gray-900">应付总额</span>
                <span class="text-2xl font-bold text-primary">¥{{ totalAmount.toFixed(2) }}</span>
              </div>

              <div class="px-3">
                <button
                  class="btn btn-primary w-full btn-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="cartStore.selectedItems.length === 0"
                  @click="goToCheckout"
                >
                  <span v-if="cartStore.selectedItems.length === 0">请选择商品</span>
                  <span v-else class="inline-flex items-center justify-center gap-2">
                    <AdIcon icon="ant-design:credit-card-outlined" size-class="h-5 w-5" />
                    去结算 ({{ selectedItemCount }})
                  </span>
                </button>
              </div>

              <!-- 优惠提示 -->
              <div class="mt-5 space-y-3">
                <div class="rounded-lg bg-gradient-to-r from-accent-pink/10 to-primary/10 p-4">
                  <div class="flex items-start gap-2">
                    <span class="pt-0.5 text-primary">
                      <AdIcon icon="ant-design:gift-outlined" size-class="h-5 w-5" />
                    </span>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">满299元免运费</p>
                      <p
                        v-if="cartStore.selectedTotalPrice < 299"
                        class="mt-1 text-sm text-gray-600"
                      >
                        再买
                        <span class="font-semibold text-primary"
                          >¥{{ (299 - cartStore.selectedTotalPrice).toFixed(2) }}</span
                        >
                        即可免运费
                      </p>
                      <p v-else class="mt-1 inline-flex items-center gap-1 text-sm text-green-600">
                        <AdIcon icon="ant-design:check-outlined" size-class="h-3.5 w-3.5" />
                        已享受免运费
                      </p>
                    </div>
                  </div>
                </div>

                <div class="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
                  <div class="flex items-start gap-2">
                    <span class="pt-0.5 text-primary">
                      <AdIcon icon="ant-design:tag-outlined" size-class="h-5 w-5" />
                    </span>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">新人专享</p>
                      <p class="mt-1 text-sm text-gray-600">首单立减50元优惠券</p>
                    </div>
                  </div>
                </div>
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import AdIcon from '@/components/icons/AdIcon.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import type { CartItem } from '@/types'

const router = useRouter()
const cartStore = useCartStore()

const allSelected = computed(() => {
  return cartStore.items.length > 0 && cartStore.items.every(item => item.selected)
})

const selectedItemCount = computed(() => {
  return cartStore.selectedItems.reduce((total, item) => total + item.quantity, 0)
})

const shippingFee = computed(() => {
  return cartStore.selectedTotalPrice >= 299 ? 0 : 15
})

const totalAmount = computed(() => {
  return cartStore.selectedTotalPrice + shippingFee.value
})

const toggleAllSelected = () => {
  cartStore.toggleAllSelected(!allSelected.value)
}

const updateQuantity = (item: CartItem, quantity: number) => {
  if (quantity >= 1 && quantity <= item.stock) {
    cartStore.updateQuantity(item.id, quantity, item.skuId)
  }
}

const handleQuantityChange = (item: CartItem, event: Event) => {
  const target = event.target as HTMLInputElement
  const quantity = Number(target.value)
  updateQuantity(item, quantity)
}

const removeItem = (item: CartItem) => {
  if (confirm('确定要删除该商品吗？')) {
    cartStore.removeFromCart(item.id, item.skuId)
  }
}

const clearCart = () => {
  if (confirm('确定要清空购物车吗？')) {
    cartStore.clearCart()
  }
}

const goToCheckout = () => {
  if (cartStore.selectedItems.length === 0) {
    alert('请选择要结算的商品')
    return
  }
  router.push('/checkout')
}
</script>
