import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Access token is now stored in HTTP-only cookie, so no need to set Authorization header
// Cookies are automatically sent with requests when withCredentials: true
apiClient.interceptors.request.use((config) => {
  // Token is in HTTP-only cookie, sent automatically
  console.log('request', config)
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                            originalRequest.url?.includes('/auth/register')
      const isLoginError = error.response?.data?.detail === 'Invalid email or password'

      if (isAuthEndpoint || isLoginError) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        return apiClient(originalRequest)
      } catch (refreshError) {
        console.log('refreshError', refreshError)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface MessageResponse {
  message: string
}

export interface UserResponse {
  id: number
  email: string
  is_verified: boolean
  created_at: string
}

export interface BlogItem {
  id: number
  title: string
  slug: string
  content: any
  sources: string[]
  views?: number
  status?: string
  created_at?: string
  updated_at?: string
}

export interface GetAllBlogsResponse {
  blogs: BlogItem[]
}

export const register = async (email: string, password: string): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/register', {
    email,
    password,
  })
  return response.data
}

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>('/auth/login', {
    email,
    password,
  })
  // Access token is now stored in HTTP-only cookie by the backend
  // No need to store in localStorage
  return response.data
}

export const logout = async (): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/logout')
  // Cookies are cleared by the backend
  // No need to remove from localStorage
  return response.data
}

export const refreshToken = async (): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>('/auth/refresh')
  // Access token is now stored in HTTP-only cookie by the backend
  // No need to store in localStorage
  return response.data
}

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>('/auth/me')
  return response.data
}

export const verifyEmail = async (token: string, signal?: AbortSignal): Promise<MessageResponse> => {
  const response = await apiClient.get<MessageResponse>(`/auth/verify-email/${token}`, { signal })
  return response.data
}

// Blog APIs
export interface CreateBlogRequest {
  title: string
  content: any
  sources: string[]
  status: 'draft' | 'published'
}

export interface UpdateBlogRequest extends CreateBlogRequest {
  id: number
  slug?: string
  user_id?: number
}

export const createBlog = async (data: CreateBlogRequest): Promise<BlogItem> => {
  const response = await apiClient.post<BlogItem>('/blog/create-blog', data)
  return response.data
}

export const updateBlog = async (data: UpdateBlogRequest): Promise<BlogItem> => {
  const response = await apiClient.post<BlogItem>('/blog/update-blog', data)
  return response.data
}

export const getBlog = async (id: number): Promise<BlogItem> => {
  const response = await apiClient.post<BlogItem>(`/blog/get_blog/${id}`)
  return response.data
}

export const getBlogBySlug = async (slug: string): Promise<BlogItem> => {
  const response = await apiClient.post<BlogItem>(`/blog/get_blog_by_slug/${slug}`)
  return response.data
}

export const deleteBlog = async (id: number): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(`/blog/delete_blog/${id}`)
  return response.data
}

export const getAllBlogs = async (): Promise<GetAllBlogsResponse> => {
  const response = await apiClient.post<GetAllBlogsResponse>('blog/get_all_blogs')
  return response.data
}

export interface BlogAnalytics {
  total_blogs: number
  published_count: number
  draft_count: number
  total_views: number
  most_viewed_blog?: BlogItem
  blogs: BlogItem[]
  views_over_time: Array<{ date: string; views: number }>
}

export interface MyBlogsResponse {
  blogs: BlogItem[]
  total: number
}

export const getMyBlogs = async (status?: string): Promise<MyBlogsResponse> => {
  const params = status ? { status } : {}
  const response = await apiClient.get<MyBlogsResponse>('/blog/my-blogs', { params })
  return response.data
}

export const incrementBlogViews = async (blogId: number): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(`/blog/increment-views/${blogId}`)
  return response.data
}

export const getBlogAnalytics = async (): Promise<BlogAnalytics> => {
  const response = await apiClient.get<BlogAnalytics>('/blog/analytics')
  return response.data
}

