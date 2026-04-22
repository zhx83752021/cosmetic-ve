<template>
  <!-- 遮罩层 -->
  <Transition name="modal-fade">
    <div
      v-if="authModalStore.showLoginModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <!-- 模态窗口 -->
      <Transition name="modal-slide">
        <div
          v-if="authModalStore.showLoginModal"
          class="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div class="card overflow-hidden shadow-2xl">
            <!-- 关闭按钮 -->
            <button
              type="button"
              class="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-600 transition-all hover:bg-white hover:text-gray-900"
              aria-label="关闭"
              @click="handleClose"
            >
              <AdIcon icon="ant-design:close-outlined" size-class="h-5 w-5" />
            </button>

            <!-- 头部装饰 -->
            <div class="bg-gradient-to-r from-primary to-primary-dark p-8 text-center text-white">
              <div
                class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white"
              >
                <AdIcon icon="ant-design:login-outlined" size-class="h-9 w-9" />
              </div>
              <h2 class="text-2xl font-bold">登录</h2>
              <p class="mt-2 text-sm opacity-90">使用手机号与密码</p>
            </div>

            <!-- 登录表单 -->
            <div class="p-6">
              <form @submit.prevent="handleLogin">
                <!-- 手机号 -->
                <div class="mb-4">
                  <label class="mb-2 block text-sm font-semibold text-gray-700">
                    <span class="flex items-center gap-2">
                      <span class="text-primary"
                        ><AdIcon icon="ant-design:mobile-outlined" size-class="h-4 w-4"
                      /></span>
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
                <div class="mb-4">
                  <label class="mb-2 block text-sm font-semibold text-gray-700">
                    <span class="flex items-center gap-2">
                      <span class="text-primary"
                        ><AdIcon icon="ant-design:lock-outlined" size-class="h-4 w-4"
                      /></span>
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
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      :aria-pressed="showPassword"
                      aria-label="显示或隐藏密码"
                      @click="showPassword = !showPassword"
                    >
                      <AdIcon
                        :icon="
                          showPassword
                            ? 'ant-design:eye-invisible-outlined'
                            : 'ant-design:eye-outlined'
                        "
                        size-class="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>

                <!-- 记住我和忘记密码 -->
                <div class="mb-5 flex items-center justify-between">
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
              <div class="mt-6 text-center text-sm text-gray-600">
                还没有账户？
                <button
                  type="button"
                  class="font-semibold text-primary hover:text-primary-dark hover:underline"
                  @click="switchToRegister"
                >
                  立即注册
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdIcon from '@/components/icons/AdIcon.vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/auth-modal'
import { login as loginApi, mapAuthUserToUserInfo } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()

const formData = ref({
  phone: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const isLoading = ref(false)

const handleClose = () => {
  authModalStore.closeAllModals()
}

const switchToRegister = () => {
  authModalStore.switchToRegister()
}

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
      handleClose()
      router.push('/user')
    }
  } catch {
    /* 拦截器已提示 */
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 模态窗口淡入淡出动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 模态窗口滑入滑出动画 */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.modal-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
