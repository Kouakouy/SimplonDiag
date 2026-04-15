const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back-simplondiag.onrender.com/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestConfig {
  url: string
  method?: HttpMethod
  body?: any
  headers?: Record<string, string>
  isFormData?: boolean
}

export async function apiRequest<T = any>({ url, method = 'GET', body, headers, isFormData = false }: ApiRequestConfig): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  
  const fetchHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  }
  
  // Ne pas ajouter Content-Type pour FormData, le navigateur le fera automatiquement
  if (!isFormData) {
    fetchHeaders['Content-Type'] = 'application/json'
  }
  
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: fetchHeaders,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
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


