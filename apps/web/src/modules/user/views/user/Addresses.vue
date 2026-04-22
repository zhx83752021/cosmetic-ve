<template>
  <div class="card p-6">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">收货地址</h2>
      <button class="btn btn-primary" @click="showModal = true">+ 新增地址</button>
    </div>

    <div v-if="addresses.length === 0" class="py-20 text-center text-gray-500">
      <div class="mb-4 flex justify-center text-primary">
        <AdIcon icon="ant-design:environment-outlined" size-class="h-14 w-14" />
      </div>
      <p>暂无收货地址</p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="rounded-lg border-2 p-6 transition-colors"
        :class="address.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <span class="font-semibold text-gray-900">{{ address.name }}</span>
            <span class="ml-3 text-gray-600">{{ address.phone }}</span>
          </div>
          <span v-if="address.isDefault" class="rounded bg-primary px-2 py-1 text-xs text-white">
            默认
          </span>
        </div>

        <p class="mb-4 text-gray-600">
          {{ address.province }} {{ address.city }} {{ address.district }}
          {{ address.detail }}
        </p>

        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" @click="editAddress(address)">编辑</button>
          <button
            v-if="!address.isDefault"
            class="btn btn-secondary btn-sm"
            @click="setDefault(address)"
          >
            设为默认
          </button>
          <button class="btn btn-secondary btn-sm text-red-600" @click="deleteAddress(address)">
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑地址弹窗 -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showModal = false"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-8">
        <h3 class="mb-6 text-xl font-bold">
          {{ editingAddress ? '编辑地址' : '新增地址' }}
        </h3>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium">收货人</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input w-full"
                placeholder="请输入收货人姓名"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">手机号</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                pattern="1[3-9]\d{9}"
                class="input w-full"
                placeholder="请输入手机号"
              />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-2 block text-sm font-medium">省份</label>
              <select v-model="form.province" required class="input w-full">
                <option value="">请选择</option>
                <option value="北京市">北京市</option>
                <option value="上海市">上海市</option>
                <option value="广东省">广东省</option>
                <option value="浙江省">浙江省</option>
              </select>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">城市</label>
              <input
                v-model="form.city"
                type="text"
                required
                class="input w-full"
                placeholder="请输入城市"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">区县</label>
              <input
                v-model="form.district"
                type="text"
                required
                class="input w-full"
                placeholder="请输入区县"
              />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium">详细地址</label>
            <textarea
              v-model="form.detail"
              required
              rows="3"
              class="input w-full"
              placeholder="请输入详细地址，如街道、楼栋号等"
            ></textarea>
          </div>

          <div>
            <label class="flex items-center cursor-pointer">
              <input v-model="form.isDefault" type="checkbox" class="mr-2" />
              <span>设为默认地址</span>
            </label>
          </div>

          <div class="flex justify-end gap-4">
            <button type="button" class="btn btn-secondary" @click="cancelEdit">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdIcon from '@/components/icons/AdIcon.vue'
import type { Address } from '@/types'

const showModal = ref(false)
const editingAddress = ref<Address | null>(null)

const addresses = ref<Address[]>([
  {
    id: 1,
    userId: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '某某街道某某小区1号楼101室',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
])

const form = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

const editAddress = (address: Address) => {
  editingAddress.value = address
  form.value = {
    name: address.name,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    detail: address.detail,
    isDefault: address.isDefault,
  }
  showModal.value = true
}

const handleSubmit = () => {
  if (editingAddress.value) {
    // 更新地址
    const index = addresses.value.findIndex(a => a.id === editingAddress.value?.id)
    if (index !== -1) {
      addresses.value[index] = {
        ...addresses.value[index],
        ...form.value,
      }
    }
  } else {
    // 新增地址
    addresses.value.push({
      id: Date.now(),
      userId: 1,
      ...form.value,
      createdAt: new Date().toISOString(),
    })
  }

  // 如果设为默认，取消其他默认地址
  if (form.value.isDefault) {
    addresses.value.forEach(addr => {
      if (addr.id !== editingAddress.value?.id) {
        addr.isDefault = false
      }
    })
  }

  showModal.value = false
  editingAddress.value = null
  resetForm()
}

const setDefault = (address: Address) => {
  addresses.value.forEach(addr => {
    addr.isDefault = addr.id === address.id
  })
}

const deleteAddress = (address: Address) => {
  if (confirm('确定要删除该地址吗？')) {
    const index = addresses.value.findIndex(a => a.id === address.id)
    if (index !== -1) {
      addresses.value.splice(index, 1)
    }
  }
}

const cancelEdit = () => {
  showModal.value = false
  editingAddress.value = null
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  }
}
</script>
