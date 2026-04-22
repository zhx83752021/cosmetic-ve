/** 从 Pinia 持久化或独立键读取前台用户 accessToken（与路由守卫一致） */
export function getUserAccessToken(): string | null {
  const flat = localStorage.getItem('token')
  if (flat) return flat
  try {
    const raw = localStorage.getItem('user-store')
    if (!raw) return null
    const p = JSON.parse(raw) as { token?: string }
    return p?.token || null
  } catch {
    return null
  }
}
