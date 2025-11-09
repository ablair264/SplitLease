// Normalize base URL: allow values without scheme (e.g., "my-app.up.railway.app")
let __RAW_BASE__ = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
if (__RAW_BASE__ && !__RAW_BASE__.startsWith('http')) {
  __RAW_BASE__ = `https://${__RAW_BASE__.replace(/^\/+/, '')}`
}
const API_BASE_URL = (__RAW_BASE__ || '').replace(/\/+$/, '')

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
  getLeaseOffers: (filters = {}) => {
    const qs = toQuery(filters)
    return fetchJson(`/api/lease-offers${qs ? `?${qs}` : ''}`)
  },
  getDashboard: () => fetchJson('/api/dashboard/stats'),
  getRecentUploads: (limit = 10) => fetchJson(`/api/dashboard/activity?limit=${limit}`),
  getTopOffers: (limit = 10) => fetchJson(`/api/dashboard/top-offers?limit=${limit}`),
  // Salary Sacrifice
  getSSCustomers: ({ search = '', sort = 'orders_desc', limit = 100, offset = 0 } = {}) =>
    fetchJson(`/api/ss/customers?search=${encodeURIComponent(search)}&sort=${encodeURIComponent(sort)}&limit=${limit}&offset=${offset}`),
  createSSCustomer: (payload) => fetchJson('/api/ss/customers', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  }),
  getSSEnquiries: ({ search = '', limit = 100, offset = 0 } = {}) =>
    fetchJson(`/api/ss/enquiries?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`),
  createSSEnquiry: (payload) => fetchJson('/api/ss/enquiries', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  }),
  getSSReport: (salesperson) => fetchJson(`/api/ss/enquiries/report?salesperson=${encodeURIComponent(salesperson)}`),
  search: (q, limit = 20) => fetchJson(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  upload: async ({ file, providerName, fieldMappings, headerNames, uploadedBy }) => {
    const form = new FormData()
    form.append('file', file)
    form.append('providerName', providerName)
    if (uploadedBy) form.append('uploadedBy', uploadedBy)
    form.append('fieldMappings', JSON.stringify(fieldMappings || {}))
    if (headerNames && Array.isArray(headerNames)) {
      form.append('headerNames', JSON.stringify(headerNames))
    }
    const res = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: form })
    const data = await res.json().catch(() => ({ success: false, error: 'Invalid JSON response' }))
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Upload failed (${res.status})`)
    }
    return data
  },
  getUploadStatus: async (id) => fetchJson(`/api/upload/${encodeURIComponent(id)}/status`),
  getMappings: async (limit = 50) => fetchJson(`/api/mappings?limit=${limit}`),
  getMappingByProvider: async (provider) => fetchJson(`/api/mappings?provider=${encodeURIComponent(provider)}`),
  saveMapping: async ({ providerName, fieldMappings, headerNames }) => fetchJson(`/api/mappings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerName, fieldMappings, headerNames }),
  }),
  refreshCache: () => fetchJson('/api/refresh-cache', { method: 'POST' }),
}
