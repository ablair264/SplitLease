import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, ChevronDown } from 'lucide-react'
import { Card } from './ui/card'
import { api } from '../lib/api'

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [providers, setProviders] = useState([])

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
      m.push({
        title: 'Active Offers',
        value: (stats.total_active_offers ?? 0).toLocaleString(),
        isPrimary: true
      })
      m.push({
        title: 'Vehicles',
        value: (stats.total_vehicles ?? 0).toLocaleString()
      })
      m.push({
        title: 'Avg Deal Score',
        value: stats.avg_deal_score != null ? Math.round(stats.avg_deal_score) : '—'
      })
      m.push({
        title: 'Top Manufacturer',
        value: stats.top_manufacturer || '—',
        isText: true
      })
    }
    return m
  }, [stats])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <button className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors">
          <span>Today</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading && metrics.length === 0 && (
          <Card className="p-6 col-span-full">
            <div className="flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3 text-muted-foreground">Loading metrics...</span>
            </div>
          </Card>
        )}
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className={`p-6 border-none ${
              metric.isPrimary
                ? 'bg-primary text-primary-foreground'
                : 'bg-card'
            }`}
          >
            <div className="space-y-2">
              <div className={`text-sm font-medium ${
                metric.isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {metric.title}
              </div>
              <div className="flex items-end justify-between">
                <div className={`${
                  metric.isText ? 'text-xl' : 'text-3xl'
                } font-bold ${
                  metric.isPrimary ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {metric.value}
                </div>
                <TrendingUp className={`w-5 h-5 ${
                  metric.isPrimary ? 'text-primary-foreground/60' : 'text-green-500'
                }`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {(providers || []).slice(0, 5).map((p, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{p.provider_name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Avg {Math.round(p.avg_monthly_rental || 0).toLocaleString()} • Best deals: {p.best_deals_count || 0} • Market share: {Math.round(p.market_share_percent || 0)}%
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 ml-4 flex-shrink-0"></div>
              </div>
            ))}
            {(!providers || providers.length === 0) && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No provider stats yet.
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">
                {stats ? Math.round(stats.avg_monthly_payment || 0).toLocaleString() : 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg Monthly Payment</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-3xl font-bold text-green-500 mb-1">
                {stats ? Math.round(stats.avg_deal_score || 0) : 0}
              </div>
              <div className="text-xs text-muted-foreground">Avg Deal Score</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {stats ? (stats.total_providers || 0) : 0}
              </div>
              <div className="text-xs text-muted-foreground">Active Providers</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-lg font-bold text-foreground mb-1">
                {stats && stats.latest_upload ? new Date(stats.latest_upload).toLocaleDateString() : '—'}
              </div>
              <div className="text-xs text-muted-foreground">Latest Upload</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 bg-secondary/50 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-secondary transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">📤</div>
              <div className="font-medium text-foreground mb-1">Upload New Ratebook</div>
              <div className="text-xs text-muted-foreground">Add pricing from providers</div>
            </div>
          </button>
          <button className="p-6 bg-secondary/50 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-secondary transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="font-medium text-foreground mb-1">View Best Deals</div>
              <div className="text-xs text-muted-foreground">Browse top offers</div>
            </div>
          </button>
          <button className="p-6 bg-secondary/50 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-secondary transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <div className="font-medium text-foreground mb-1">Analytics</div>
              <div className="text-xs text-muted-foreground">View detailed reports</div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
