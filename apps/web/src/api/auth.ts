import { post, get, put, type AppRequestConfig } from './request'
import type { UserInfo } from '@/types'

// 登录参数
export interface LoginParams {
  account: string
  password: string
}

export interface RegisterParams {
  phone: string
  password: string
}

// 登录 / 注册 成功载荷
export interface LoginResponse {
  user: Record<string, unknown>
  accessToken: string
  refreshToken: string
}

/** 将后端用户对象转为前台 UserInfo */
export function mapAuthUserToUserInfo(u: Record<string, unknown>): UserInfo {
  const phone = (u.phone as string) || ''
  return {
    id: Number(u.id),
    username: (u.username as string) || phone || '用户',
    email: (u.email as string) || '',
    phone,
    nickname: u.nickname as string | undefined,
    avatar: u.avatar as string | undefined,
    gender: u.gender as UserInfo['gender'],
    birthday: u.birthday ? String(u.birthday).split('T')[0] : undefined,
    level: Number(u.level ?? 1),
    points: Number(u.points ?? 0),
    createdAt: (u.createdAt as string) || new Date().toISOString(),
  }
}

const publicAuthConfig: AppRequestConfig = { __skipAuthSessionHandlers: true }

/**
 * 用户登录
 */
export const login = (data: LoginParams) => {
  return post<LoginResponse>('/auth/login', data, publicAuthConfig)
}

/**
 * 用户注册（当前后端未接短信，不传 captcha）
 */
export const register = (data: RegisterParams) => {
  return post<LoginResponse>('/auth/register', data, publicAuthConfig)
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return get<Record<string, unknown>>('/auth/me')
}

/**
 * 刷新令牌
 */
export const refreshToken = (refreshToken: string) => {
  return post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
    refreshToken,
  })
}

/** 可提交的个人信息字段（与后端 /auth/profile 一致） */
export type ProfileUpdatePayload = Pick<UserInfo, 'nickname' | 'avatar' | 'gender' | 'birthday'>

/**
 * 更新个人信息
 */
export const updateProfile = (data: ProfileUpdatePayload) => {
  return put<Record<string, unknown>>('/auth/profile', data)
}

/**
 * 修改密码
 */
export const changePassword = (oldPassword: string, newPassword: string) => {
  return put('/auth/password', { oldPassword, newPassword })
}
