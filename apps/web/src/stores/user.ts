import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { getCurrentUser, mapAuthUserToUserInfo } from '@/api/auth'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    const isLoggedIn = computed(() => !!token.value)

    const setToken = (newToken: string) => {
      token.value = newToken
      if (newToken) {
        localStorage.setItem('token', newToken)
      } else {
        localStorage.removeItem('token')
      }
    }

    const setUserInfo = (info: UserInfo | null) => {
      userInfo.value = info
    }

    const logout = () => {
      setToken('')
      setUserInfo(null)
      try {
        const raw = localStorage.getItem('user-store')
        if (raw) {
          const p = JSON.parse(raw)
          delete p.token
          delete p.userInfo
          localStorage.setItem('user-store', JSON.stringify(p))
        }
      } catch {
        /* ignore */
      }
      localStorage.removeItem('refreshToken')
    }

    const fetchUserInfo = async () => {
      if (!token.value) return
      try {
        const res = await getCurrentUser()
        if (res?.success && res.data) {
          setUserInfo(mapAuthUserToUserInfo(res.data as Record<string, unknown>))
        }
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }
    }

    return {
      token,
      userInfo,
      isLoggedIn,
      setToken,
      setUserInfo,
      logout,
      fetchUserInfo,
    }
  },
  {
    persist: {
      key: 'user-store',
      storage: localStorage,
      paths: ['token', 'userInfo'],
    },
  }
)
