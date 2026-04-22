<template>
  <div class="space-y-6">
    <!-- 积分概览 -->
    <div class="card bg-gradient-to-r from-primary/10 to-primary-dark/10">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="mb-2 text-lg text-gray-600">我的积分</h2>
          <div class="text-5xl font-bold text-primary">{{ userPoints }}</div>
        </div>
        <div class="text-center">
          <div class="mb-2 text-sm text-gray-600">即将过期积分</div>
          <div class="text-2xl font-bold text-orange-600">{{ expiringPoints }}</div>
          <div class="text-xs text-gray-500">30天后过期</div>
        </div>
      </div>
    </div>

    <!-- 积分规则 -->
    <div class="card p-6">
      <h3 class="mb-4 text-xl font-bold">积分规则</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex items-start gap-3 rounded-lg bg-neutral-gray p-4">
          <span class="text-primary"
            ><AdIcon icon="ant-design:shopping-cart-outlined" size-class="h-6 w-6"
          /></span>
          <div>
            <div class="font-semibold">购物赚积分</div>
            <div class="text-sm text-gray-600">每消费1元获得1积分</div>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-lg bg-neutral-gray p-4">
          <span class="text-primary"
            ><AdIcon icon="ant-design:form-outlined" size-class="h-6 w-6"
          /></span>
          <div>
            <div class="font-semibold">评价赚积分</div>
            <div class="text-sm text-gray-600">每次评价获得20积分</div>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-lg bg-neutral-gray p-4">
          <span class="text-primary"
            ><AdIcon icon="ant-design:calendar-outlined" size-class="h-6 w-6"
          /></span>
          <div>
            <div class="font-semibold">每日签到</div>
            <div class="text-sm text-gray-600">连续签到最高10积分/天</div>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-lg bg-neutral-gray p-4">
          <span class="text-primary"
            ><AdIcon icon="ant-design:gift-outlined" size-class="h-6 w-6"
          /></span>
          <div>
            <div class="font-semibold">积分兑换</div>
            <div class="text-sm text-gray-600">100积分可抵扣1元</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 积分明细 -->
    <div class="card p-6">
      <div class="mb-6 flex items-center justify-between">
        <h3 class="text-xl font-bold">积分明细</h3>
        <select v-model="filterType" class="input w-40">
          <option value="all">全部</option>
          <option value="income">收入</option>
          <option value="expense">支出</option>
        </select>
      </div>

      <div v-if="filteredRecords.length === 0" class="py-20 text-center text-gray-500">
        <div class="mb-4 flex justify-center text-primary">
          <AdIcon icon="ant-design:file-search-outlined" size-class="h-14 w-14" />
        </div>
        <p>暂无积分记录</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full"
              :class="
                record.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              "
            >
              <AdIcon :icon="record.icon" size-class="h-6 w-6" />
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ record.description }}</div>
              <div class="text-sm text-gray-500">{{ formatDateTime(record.createdAt) }}</div>
            </div>
          </div>
          <div
            class="text-xl font-bold"
            :class="record.type === 'income' ? 'text-green-600' : 'text-red-600'"
          >
            {{ record.type === 'income' ? '+' : '-' }}{{ record.points }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdIcon from '@/components/icons/AdIcon.vue'

const userPoints = ref(2580)
const expiringPoints = ref(120)
const filterType = ref('all')

interface PointRecord {
  id: number
  type: 'income' | 'expense'
  points: number
  description: string
  icon: string
  createdAt: string
}

const records = ref<PointRecord[]>([
  {
    id: 1,
    type: 'income',
    points: 398,
    description: '购物获得积分',
    icon: 'ant-design:shopping-cart-outlined',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'income',
    points: 20,
    description: '评价订单',
    icon: 'ant-design:form-outlined',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'income',
    points: 10,
    description: '每日签到',
    icon: 'ant-design:calendar-outlined',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'expense',
    points: 100,
    description: '积分抵扣',
    icon: 'ant-design:transaction-outlined',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    type: 'income',
    points: 568,
    description: '购物获得积分',
    icon: 'ant-design:shopping-cart-outlined',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
])

const filteredRecords = computed(() => {
  if (filterType.value === 'all') {
    return records.value
  }
  return records.value.filter(record => record.type === filterType.value)
})

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>
