import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { Card } from './ui/card'
import { api } from '../lib/api'

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null) // get_market_stats()
  const [providers, setProviders] = useState([]) // get_provider_performance()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const resp = await api.getDashboard()
        if (!cancelled) {
          setStats(resp.marketStats || null)
          setProviders(resp.providerStats || [])
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const metrics = useMemo(() => {
    const m = []
    if (stats) {
      m.push({ title: 'Active Offers', value: (stats.total_active_offers ?? 0).toLocaleString(), isPositive: true, change: '', bgColor: 'bg-amber-400' })
      m.push({ title: 'Vehicles', value: (stats.total_vehicles ?? 0).toLocaleString(), isPositive: true, change: '', bgColor: 'bg-background-4' })
      m.push({ title: 'Avg Deal Score', value: stats.avg_deal_score != null ? Math.round(stats.avg_deal_score) : '—', isPositive: true, change: '', bgColor: 'bg-background-5' })
      m.push({ title: 'Top Manufacturer', value: stats.top_manufacturer || '—', isPositive: true, change: '', bgColor: 'bg-background-4', isText: true })
    }
    return m
  }, [stats])

  return (
    <div className="pt-8 px-7">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-black-100% text-sm font-semibold font-inter leading-5">Overview</div>
        <div className="px-2 py-1 rounded-lg flex justify-center items-center gap-1">
          <div className="text-black-100% text-xs font-normal font-inter leading-4">Today</div>
          <ChevronDown className="w-4 h-4 text-black-40%/40" />
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      {/* Metrics Cards */}
      <div className="flex justify-start items-start gap-7 flex-wrap mb-8">
        {loading && metrics.length === 0 && (
          <Card className="p-6">Loading metrics…</Card>
        )}
        {metrics.map((metric, index) => (
          <Card key={index} className={`flex-1 min-w-48 p-6 ${metric.bgColor} rounded-[20px] border-none shadow-none`}>
            <div className="flex flex-col justify-start items-start gap-2">
              <div className="self-stretch text-sm font-normal font-inter leading-5" 
                   style={{ color: metric.bgColor === 'bg-amber-400' ? 'white' : 'black' }}>
                {metric.title}
              </div>
              <div className="self-stretch flex justify-between items-center">
                <div className={`text-2xl font-semibold font-inter leading-8 ${metric.isText ? 'text-lg font-medium leading-7' : ''}`}
                     style={{ color: metric.bgColor === 'bg-amber-400' ? 'white' : 'black' }}>
                  {metric.value}
                </div>
                <div className="flex justify-end items-center gap-2">
                  <div className="text-xs font-normal font-inter leading-4"
                       style={{ color: metric.bgColor === 'bg-amber-400' ? 'white' : 'black' }}>
                    {metric.change}
                  </div>
                  {metric.isPositive ? (
                    <TrendingUp className="w-4 h-4" style={{ color: metric.bgColor === 'bg-amber-400' ? '#04DE71' : 'black' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-black" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="p-6 bg-muted rounded-2xl border border-input">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-Contents-Primary">📈 Recent Activity</h3>
            <div className="space-y-4">
              {(providers || []).slice(0, 5).map((p, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <div className="font-medium text-sm text-Contents-Primary">{p.provider_name}</div>
                    <div className="text-xs text-Contents-Tertiary">Avg £{Math.round(p.avg_monthly_rental || 0)} • Best deals: {p.best_deals_count || 0} • Market share: {Math.round(p.market_share_percent || 0)}%</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              ))}
              {(!providers || providers.length === 0) && (
                <div className="text-sm text-Contents-Tertiary">No provider stats yet.</div>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6 bg-muted rounded-2xl border border-input">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-Contents-Primary">⚡ Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-amber-400">£{stats ? Math.round(stats.avg_monthly_payment || 0) : 0}</div>
                <div className="text-xs text-Contents-Tertiary">Avg Monthly Payment</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-500">{stats ? Math.round(stats.avg_deal_score || 0) : 0}</div>
                <div className="text-xs text-Contents-Tertiary">Avg Deal Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{stats ? (stats.total_providers || 0) : 0}</div>
                <div className="text-xs text-Contents-Tertiary">Active Providers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-500">{stats && stats.latest_upload ? new Date(stats.latest_upload).toLocaleDateString() : '—'}</div>
                <div className="text-xs text-Contents-Tertiary">Latest Upload</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8 p-6 bg-muted rounded-2xl border border-input">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-Contents-Primary">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">📤</div>
                <div className="font-medium text-sm">Upload New Ratebook</div>
                <div className="text-xs text-Contents-Tertiary">Add pricing from providers</div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-medium text-sm">View Best Deals</div>
                <div className="text-xs text-Contents-Tertiary">Browse top offers</div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-sm">Analytics</div>
                <div className="text-xs text-Contents-Tertiary">View detailed reports</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
