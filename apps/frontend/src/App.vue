<template>
  <div id="app" class="min-h-screen bg-neutral-white">
    <RouterView />

    <!-- 认证模态窗口 -->
    <LoginModal
      v-model:isOpen="authModalStore.showLoginModal"
      @switch-to-register="authModalStore.switchToRegister"
    />
    <RegisterModal
      v-model:isOpen="authModalStore.showRegisterModal"
      @switch-to-login="authModalStore.switchToLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { useAuthModalStore } from '@/stores/auth-modal'
import LoginModal from '@/components/auth/LoginModal.vue'
import RegisterModal from '@/components/auth/RegisterModal.vue'

const authModalStore = useAuthModalStore()
</script>

<style>
#app {
  font-family: PingFang SC, Microsoft YaHei, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
