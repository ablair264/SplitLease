const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const toQuery = (params = {}) => {
  const qp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qp.set(k, String(v))
  })
  return qp.toString()
}

async function fetchJson(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const contentType = res.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) {
    const message = typeof body === 'object' && body !== null ? (body.error || JSON.stringify(body)) : String(body)
    throw new Error(message || `Request failed: ${res.status}`)
  }
  return body
}

export const api = {
  baseUrl: API_BASE_URL,
  health: () => fetchJson('/health'),
  getFilters: () => fetchJson('/api/filters'),
  getBestDeals: (filters = {}) => {
    const qs = toQuery(filters)
    return fetchJson(`/api/best-deals${qs ? `?${qs}` : ''}`)
  },
  search: (q, limit = 20) => fetchJson(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  upload: async ({ file, providerName, fieldMappings, uploadedBy }) => {
    const form = new FormData()
    form.append('file', file)
    form.append('providerName', providerName)
    if (uploadedBy) form.append('uploadedBy', uploadedBy)
    form.append('fieldMappings', JSON.stringify(fieldMappings || {}))
    const res = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: form })
    const data = await res.json().catch(() => ({ success: false, error: 'Invalid JSON response' }))
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Upload failed (${res.status})`)
    }
    return data
  },
  refreshCache: () => fetchJson('/api/refresh-cache', { method: 'POST' }),
}

