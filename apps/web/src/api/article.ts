import { get, post, put, del } from './request'

// 文章接口
export interface Article {
  id: number
  title: string
  cover: string
  summary?: string
  content: string
  categoryId?: number | null
  author: string
  views: number
  likes: number
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
}

/** 前台列表项（无正文） */
export interface ArticleListItem {
  id: number
  title: string
  cover: string
  summary?: string | null
  categoryId?: number | null
  author: string
  views: number
  likes: number
  tags: string[]
  createdAt: string
}

export interface ArticleListPayload {
  items: ArticleListItem[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// 文章查询参数
export interface ArticleQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  categoryId?: number
}

/**
 * 获取已发布文章列表（前台）
 */
export const getPublishedArticles = (params?: {
  page?: number
  pageSize?: number
  keyword?: string
  categoryId?: number
}) => {
  return get<ArticleListPayload>('/articles', { params })
}

/**
 * 获取文章列表（管理员）
 */
export const getArticles = (params: ArticleQuery) => {
  return get<ArticleListPayload>('/articles/admin', { params })
}

/**
 * 获取文章详情
 */
export const getArticleById = (id: number) => {
  return get<Article>(`/articles/${id}`)
}

/**
 * 创建文章
 */
export const createArticle = (data: Partial<Article>) => {
  return post<Article>('/articles', data)
}

/**
 * 更新文章
 */
export const updateArticle = (id: number, data: Partial<Article>) => {
  return put<Article>(`/articles/${id}`, data)
}

/**
 * 删除文章
 */
export const deleteArticle = (id: number) => {
  return del(`/articles/${id}`)
}

/**
 * 点赞文章
 */
export const likeArticle = (id: number) => {
  return post(`/articles/${id}/like`)
}
