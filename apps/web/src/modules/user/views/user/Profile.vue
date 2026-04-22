<template>
  <div class="card p-6">
    <h2 class="mb-6 text-2xl font-bold">个人信息</h2>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="grid gap-6 md:grid-cols-2">
        <!-- 用户名 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">用户名 / 手机</label>
          <input v-model="form.username" type="text" disabled class="input w-full bg-gray-50" />
          <p class="mt-1 text-xs text-gray-500">登录标识不可修改，可与昵称区分展示</p>
        </div>

        <!-- 昵称 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">昵称</label>
          <input
            v-model="form.nickname"
            type="text"
            class="input w-full"
            placeholder="请输入昵称"
          />
        </div>

        <!-- 邮箱（当前接口仅展示，不写入后端） -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="input w-full bg-gray-50"
            placeholder="暂未绑定"
            disabled
          />
        </div>

        <!-- 手机号 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">手机号</label>
          <input v-model="form.phone" type="tel" class="input w-full bg-gray-50" disabled />
        </div>

        <!-- 性别 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">性别</label>
          <div class="flex gap-4">
            <label class="flex items-center cursor-pointer">
              <input v-model="form.gender" type="radio" value="male" class="mr-2" />
              <span>男</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input v-model="form.gender" type="radio" value="female" class="mr-2" />
              <span>女</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input v-model="form.gender" type="radio" value="other" class="mr-2" />
              <span>保密</span>
            </label>
          </div>
        </div>

        <!-- 生日 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">生日</label>
          <input v-model="form.birthday" type="date" class="input w-full" />
        </div>
      </div>

      <!-- 会员信息 -->
      <div class="rounded-lg bg-gradient-to-r from-primary/10 to-primary-dark/10 p-6">
        <h3 class="mb-4 text-lg font-semibold">会员信息</h3>
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <p class="text-sm text-gray-600">会员等级</p>
            <p class="text-2xl font-bold text-primary">VIP{{ form.level }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">当前积分</p>
            <p class="text-2xl font-bold text-primary">{{ form.points }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">注册时间</p>
            <p class="text-sm text-gray-700">{{ formatDate(form.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-end gap-4">
        <button type="button" class="btn btn-secondary" @click="resetForm">取消</button>
        <button type="submit" class="btn btn-primary">保存修改</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { updateProfile, getCurrentUser, mapAuthUserToUserInfo } from '@/api/auth'

const userStore = useUserStore()

interface ProfileForm {
  username: string
  nickname?: string
  email: string
  phone?: string
  gender?: string
  birthday?: string
  level: number
  points: number
  createdAt: string
}

const form = ref<ProfileForm>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  level: 1,
  points: 0,
  createdAt: new Date().toISOString(),
})

function loadFormFromUser() {
  if (userStore.userInfo) {
    const u = userStore.userInfo
    form.value = {
      username: u.username || u.phone,
      nickname: u.nickname,
      email: u.email || '',
      phone: u.phone || '',
      gender: u.gender,
      birthday: u.birthday,
      level: u.level,
      points: u.points,
      createdAt: u.createdAt,
    }
  }
}

onMounted(async () => {
  loadFormFromUser()
  try {
    const res = await getCurrentUser()
    if (res?.success && res.data) {
      userStore.setUserInfo(mapAuthUserToUserInfo(res.data as Record<string, unknown>))
      loadFormFromUser()
    }
  } catch {
    /* 未登录或已过期，由其它页面处理 */
  }
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const handleSubmit = async () => {
  try {
    const res = await updateProfile({
      nickname: form.value.nickname,
      gender: form.value.gender,
      birthday: form.value.birthday || undefined,
    })
    if (res?.success) {
      const me = await getCurrentUser()
      if (me?.success && me.data) {
        userStore.setUserInfo(mapAuthUserToUserInfo(me.data as Record<string, unknown>))
        loadFormFromUser()
      }
      ElMessage.success(res.message || '保存成功')
    }
  } catch {
    /* 拦截器会提示 */
  }
}

const resetForm = () => {
  loadFormFromUser()
}
</script>
