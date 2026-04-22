<template>
  <div class="card p-6">
    <h2 class="mb-6 text-2xl font-bold">我的订单</h2>

    <!-- 订单状态Tab -->
    <div class="mb-6 flex gap-4 border-b border-gray-200">
      <button
        v-for="status in orderStatuses"
        :key="status.value"
        :class="[
          'pb-3 text-sm font-medium transition-colors',
          currentStatus === status.value
            ? 'border-b-2 border-primary text-primary'
            : 'text-gray-600 hover:text-primary',
        ]"
        @click="currentStatus = status.value"
      >
        {{ status.label }}
        <span v-if="status.count" class="ml-1">({{ status.count }})</span>
      </button>
    </div>

    <!-- 订单列表 -->
    <div v-if="filteredOrders.length === 0" class="py-20 text-center text-gray-500">
      <div class="mb-4 flex justify-center text-primary">
        <AdIcon icon="ant-design:inbox-outlined" size-class="h-14 w-14" />
      </div>
      <p>暂无订单</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="rounded-lg border border-gray-200 p-6"
      >
        <!-- 订单头部 -->
        <div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">订单号：{{ order.orderNo }}</span>
            <span class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</span>
          </div>
          <span
            :class="['rounded-full px-3 py-1 text-xs font-semibold', getStatusClass(order.status)]"
          >
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <!-- 订单商品 -->
        <div class="mb-4 space-y-3">
          <div v-for="item in order.items" :key="item.id" class="flex gap-4">
            <img :src="item.image" :alt="item.name" class="h-20 w-20 rounded-lg object-cover" />
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">{{ item.name }}</h4>
              <p v-if="item.specs" class="text-sm text-gray-500">
                <span v-for="spec in item.specs" :key="spec.name">
                  {{ spec.name }}: {{ spec.value }}
                </span>
              </p>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-primary font-semibold">¥{{ item.price }}</span>
                <span class="text-gray-500">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单金额 -->
        <div class="mb-4 flex justify-end">
          <div class="text-right">
            <p class="text-sm text-gray-600">共 {{ order.items.length }} 件商品</p>
            <p class="text-lg font-bold text-primary">实付：¥{{ order.payAmount.toFixed(2) }}</p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-2">
          <button
            v-if="order.status === 'pending'"
            class="btn btn-primary btn-sm"
            @click="payOrder(order)"
          >
            去支付
          </button>
          <button
            v-if="order.status === 'pending'"
            class="btn btn-secondary btn-sm"
            @click="cancelOrder(order)"
          >
            取消订单
          </button>
          <button
            v-if="order.status === 'shipped'"
            class="btn btn-primary btn-sm"
            @click="confirmOrder(order)"
          >
            确认收货
          </button>
          <button v-if="order.status === 'completed'" class="btn btn-secondary btn-sm">
            再次购买
          </button>
          <button class="btn btn-secondary btn-sm">查看详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdIcon from '@/components/icons/AdIcon.vue'
import type { Order, OrderStatus } from '@/types'

const currentStatus = ref<string>('all')

const orderStatuses = [
  { value: 'all', label: '全部订单', count: 5 },
  { value: 'pending', label: '待支付', count: 1 },
  { value: 'paid', label: '待发货', count: 1 },
  { value: 'shipped', label: '待收货', count: 2 },
  { value: 'completed', label: '已完成', count: 1 },
]

// 模拟订单数据
const orders = ref<Order[]>([
  {
    id: 1,
    orderNo: '20251121001',
    userId: 1,
    status: 'pending',
    items: [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        name: '精华液 - 深层补水保湿',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
        price: 398,
        quantity: 1,
      },
    ],
    totalAmount: 398,
    discountAmount: 0,
    shippingFee: 0,
    payAmount: 398,
    address: {
      id: 1,
      userId: 1,
      name: '张三',
      phone: '13800000000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '某某街道',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
])

const filteredOrders = computed(() => {
  if (currentStatus.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === currentStatus.value)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    pending: '待支付',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款',
  }
  return statusMap[status]
}

const getStatusClass = (status: OrderStatus) => {
  const classMap: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunding: 'bg-orange-100 text-orange-800',
    refunded: 'bg-red-100 text-red-800',
  }
  return classMap[status]
}

const payOrder = (order: Order) => {
  console.log('支付订单:', order.orderNo)
  // TODO: 跳转支付页面
}

const cancelOrder = (order: Order) => {
  if (confirm('确定要取消该订单吗？')) {
    console.log('取消订单:', order.orderNo)
    // TODO: 调用取消订单API
  }
}

const confirmOrder = (order: Order) => {
  if (confirm('确认收货吗？')) {
    console.log('确认收货:', order.orderNo)
    // TODO: 调用确认收货API
  }
}
</script>
