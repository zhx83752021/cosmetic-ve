<template>
  <!-- 遮罩层 -->
  <Transition name="modal-fade">
    <div
      v-if="authModalStore.showRegisterModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <!-- 模态窗口 -->
      <Transition name="modal-slide">
        <div
          v-if="authModalStore.showRegisterModal"
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
            <div class="bg-gradient-to-r from-accent-pink to-primary p-8 text-center text-white">
              <div
                class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white"
              >
                <AdIcon icon="ant-design:user-add-outlined" size-class="h-9 w-9" />
              </div>
              <h2 class="text-2xl font-bold">注册</h2>
              <p class="mt-2 text-sm opacity-90">手机号 + 密码，约一分钟</p>
            </div>

            <!-- 注册表单 -->
            <div class="p-6">
              <form @submit.prevent="handleRegister">
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
                      minlength="6"
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
                  <div class="mt-2 flex gap-1">
                    <div
                      v-for="level in 3"
                      :key="level"
                      class="h-1 flex-1 rounded-full transition-colors"
                      :class="[
                        passwordStrength >= level
                          ? passwordStrength === 1
                            ? 'bg-red-500'
                            : passwordStrength === 2
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          : 'bg-gray-200',
                      ]"
                    ></div>
                  </div>
                </div>

                <!-- 确认密码 -->
                <div class="mb-4">
                  <label class="mb-2 block text-sm font-semibold text-gray-700">
                    <span class="flex items-center gap-2">
                      <span class="text-primary"
                        ><AdIcon icon="ant-design:key-outlined" size-class="h-4 w-4"
                      /></span>
                      确认密码
                    </span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="formData.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="请再次输入密码"
                      class="input w-full pr-12"
                      required
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      :aria-pressed="showConfirmPassword"
                      aria-label="显示或隐藏确认密码"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <AdIcon
                        :icon="
                          showConfirmPassword
                            ? 'ant-design:eye-invisible-outlined'
                            : 'ant-design:eye-outlined'
                        "
                        size-class="h-5 w-5"
                      />
                    </button>
                  </div>
                  <p
                    v-if="
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                    "
                    class="mt-1 text-xs text-red-500"
                  >
                    两次输入的密码不一致
                  </p>
                </div>

                <!-- 服务条款 -->
                <div class="mb-5">
                  <label class="flex cursor-pointer items-start gap-2">
                    <input
                      v-model="formData.agreement"
                      type="checkbox"
                      class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      required
                    />
                    <span class="text-xs text-gray-600">
                      我已阅读并同意
                      <a href="#" class="text-primary hover:underline">用户协议</a>
                      和
                      <a href="#" class="text-primary hover:underline">隐私政策</a>
                    </span>
                  </label>
                </div>

                <!-- 注册按钮 -->
                <div class="px-3">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg w-full shadow-lg transition-all hover:scale-105"
                    :disabled="isLoading || !isFormValid"
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
                      注册中...
                    </span>
                    <span v-else>立即注册</span>
                  </button>
                </div>
              </form>

              <!-- 登录提示 -->
              <div class="mt-6 text-center text-sm text-gray-600">
                已有账户？
                <button
                  type="button"
                  class="font-semibold text-primary hover:text-primary-dark hover:underline"
                  @click="switchToLogin"
                >
                  立即登录
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
import { ref, computed } from 'vue'
import AdIcon from '@/components/icons/AdIcon.vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthModalStore } from '@/stores/auth-modal'
import { useUserStore } from '@/stores/user'
import { register as registerApi, mapAuthUserToUserInfo } from '@/api/auth'

const authModalStore = useAuthModalStore()
const userStore = useUserStore()
const router = useRouter()

const formData = ref({
  phone: '',
  password: '',
  confirmPassword: '',
  agreement: false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = formData.value.password
  if (!pwd) return 0

  let strength = 0
  if (pwd.length >= 6) strength++
  if (/[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  return strength
})

// 表单验证
const isFormValid = computed(() => {
  return (
    formData.value.phone.length === 11 &&
    formData.value.password.length >= 6 &&
    formData.value.password === formData.value.confirmPassword &&
    formData.value.agreement
  )
})

const handleClose = () => {
  authModalStore.closeAllModals()
}

const switchToLogin = () => {
  authModalStore.switchToLogin()
}

// 处理注册
const handleRegister = async () => {
  if (!isFormValid.value) {
    return
  }

  isLoading.value = true

  try {
    const res = await registerApi({
      phone: formData.value.phone.trim(),
      password: formData.value.password,
    })
    if (res?.success && res.data) {
      const { user, accessToken, refreshToken } = res.data
      userStore.setToken(accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      userStore.setUserInfo(mapAuthUserToUserInfo(user as Record<string, unknown>))
      ElMessage.success(res.message || '注册成功')
      authModalStore.closeAllModals()
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
