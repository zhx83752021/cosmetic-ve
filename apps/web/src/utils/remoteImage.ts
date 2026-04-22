/** 外链图加载失败时的备用图（与种子/精选区常用图一致，便于各地网络访问） */
export const REMOTE_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80&auto=format&fit=crop'

/**
 * 用于 <img @error="onRemoteImageError" />
 * 防循环：仅当当前 src 不是备用地址时才替换
 */
export function onRemoteImageError(ev: Event) {
  const el = ev.target as HTMLImageElement | null
  if (!el) return
  if (el.src === REMOTE_IMAGE_FALLBACK) return
  el.onerror = null
  el.src = REMOTE_IMAGE_FALLBACK
}
