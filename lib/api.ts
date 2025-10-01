const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface ApiRequestConfig {
  url: string
  method?: HttpMethod
  body?: any
  headers?: Record<string, string>
}

export async function apiRequest<T = any>({ url, method = 'GET', body, headers }: ApiRequestConfig): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) {
    const status = res.status
    const contentType = res.headers.get('content-type') || ''
    
    let errorData: any = { status, url }
    
    try {
      if (contentType.includes('application/json')) {
        const data = await res.json()
        errorData = { ...errorData, ...data }
      } else {
        const text = await res.text().catch(() => '')
        errorData.message = text || `HTTP ${status}`
      }
    } catch {
      errorData.message = `HTTP ${status}`
    }
    
    // Créer une erreur avec les détails structurés
    const error = new Error(errorData.message || `HTTP ${status}`) as any
    error.status = status
    error.url = url
    error.response = errorData
    throw error
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return (await res.json()) as T
  // @ts-ignore
  return (await res.text()) as T
}


