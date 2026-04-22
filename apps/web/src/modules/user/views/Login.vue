<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent-pink/5 pt-16"
  >
    <AppHeader />

    <div class="w-full max-w-md px-4">
      <!-- 登录卡片 -->
      <div class="card overflow-hidden shadow-2xl">
        <!-- 头部装饰 -->
        <div class="bg-gradient-to-r from-primary to-primary-dark p-8 text-center text-white">
          <div
            class="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            <UserIcon class="h-10 w-10" />
          </div>
          <h1 class="text-3xl font-bold">欢迎回来</h1>
          <p class="mt-2 text-sm opacity-90">登录您的账户，开启美丽之旅</p>
        </div>

        <!-- 登录表单 -->
        <div class="p-8">
          <form @submit.prevent="handleLogin">
            <!-- 手机号 -->
            <div class="mb-6">
              <label class="mb-2 block text-sm font-semibold text-gray-700">
                <span class="flex items-center gap-2">
                  <span>📱</span>
                  手机号
                </span>
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="请输入手机号"
                class="input w-full"
                required
                pattern="[0-9]{11}"
              />
            </div>

            <!-- 密码 -->
            <div class="mb-6">
              <label class="mb-2 block text-sm font-semibold text-gray-700">
                <span class="flex items-center gap-2">
                  <span>🔒</span>
                  密码
                </span>
              </label>
              <div class="relative">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="input w-full pr-12"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <!-- 记住我和忘记密码 -->
            <div class="mb-6 flex items-center justify-between">
              <label class="flex cursor-pointer items-center gap-2">
                <input
                  v-model="formData.remember"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm text-gray-600">记住我</span>
              </label>
              <button
                type="button"
                class="text-sm text-primary hover:text-primary-dark hover:underline"
              >
                忘记密码？
              </button>
            </div>

            <!-- 登录按钮 -->
            <div class="px-3">
              <button
                type="submit"
                class="btn btn-primary btn-lg w-full shadow-lg transition-all hover:scale-105"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="inline-flex items-center gap-2">
                  <svg
                    class="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  登录中...
                </span>
                <span v-else>立即登录</span>
              </button>
            </div>
          </form>

          <!-- 注册提示 -->
          <div class="mt-8 text-center text-sm text-gray-600">
            还没有账户？
            <RouterLink
              to="/register"
              class="font-semibold text-primary hover:text-primary-dark hover:underline"
            >
              立即注册
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="mt-6 text-center text-xs text-gray-500">
        登录即表示您同意我们的
        <a href="#" class="text-primary hover:underline">服务条款</a>
        和
        <a href="#" class="text-primary hover:underline">隐私政策</a>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login as loginApi, mapAuthUserToUserInfo } from '@/api/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import UserIcon from '@/components/icons/UserIcon.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formData = ref({
  phone: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  try {
    const res = await loginApi({
      account: formData.value.phone.trim(),
      password: formData.value.password,
    })
    if (res?.success && res.data) {
      const { user, accessToken, refreshToken } = res.data
      userStore.setToken(accessToken)
      if (formData.value.remember) {
        localStorage.setItem('refreshToken', refreshToken)
      } else {
        localStorage.removeItem('refreshToken')
      }
      userStore.setUserInfo(mapAuthUserToUserInfo(user as Record<string, unknown>))
      ElMessage.success(res.message || '登录成功')
      const redirect = route.query.redirect as string | undefined
      router.push(
        redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/user'
      )
    }
  } catch {
    /* 错误信息已由 axios 拦截器提示 */
  } finally {
    isLoading.value = false
  }
}
</script>
