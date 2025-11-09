import { useEffect, useState } from 'react'
import { DollarSign, Award, BarChart3, Building2, Upload, Users, Briefcase, Tag, ClipboardList, CarFront, FileText } from 'lucide-react'
import { api } from '../lib/api'

const MasterLayout = ({ children, currentPage = 'pricing' }) => {
  const [activePage, setActivePage] = useState(currentPage)

  const menuItems = [
    { id: 'pricing', label: 'Pricing', icon: DollarSign, active: true },
    { id: 'upload', label: 'Upload', icon: Upload, active: false },
    { id: 'deals', label: 'Best Deals', icon: Award, active: false },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, active: false },
    { id: 'providers', label: 'Providers', icon: Building2, active: false }
  ]

  const [activity, setActivity] = useState([])
  const [topOffers, setTopOffers] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [a, t] = await Promise.all([
          api.getRecentUploads(5).catch(() => ({ data: [] })),
          api.getTopOffers(10).catch(() => ({ data: [] })),
        ])
        if (!cancelled) {
          setActivity(a.data || [])
          setTopOffers(t.data || [])
        }
      } catch (_) {}
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="w-full h-screen bg-background">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-56 border-r border-border bg-card flex flex-col p-3">
          {/* Logo */}
          <div className="px-3 py-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">LA</span>
              </div>
              <div className="font-semibold text-foreground">Lease Analyzer</div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}

            {/* Salary Sacrifice section header */}
            <div className="px-3 pt-4 pb-1 text-xs uppercase tracking-wider text-muted-foreground">Salary Sacrifice</div>
            {[ 
              { id: 'ss_customers', label: 'Customers', icon: Users },
              { id: 'ss_sales', label: 'Sales', icon: Briefcase },
              { id: 'ss_pricing', label: 'Pricing', icon: Tag },
              { id: 'ss_orders', label: 'Orders', icon: ClipboardList },
              { id: 'ss_fleet', label: 'Fleet', icon: CarFront },
              { id: 'ss_documents', label: 'Documents', icon: FileText },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="pt-4 mt-4 border-t border-border">
            <div className="px-3 py-2 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground text-center">
                Lease Analyzer v1.0
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 overflow-y-auto">
            {children({ activePage, setActivePage })}
          </div>

          {/* Right Sidebar */}
          <div className="w-72 border-l border-border bg-card p-4 overflow-y-auto">
            {/* Activities Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Activities</h3>
              <div className="space-y-3">
                {(activity || []).map((a, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{a.provider_name || 'Upload'}</div>
                      <div className="text-xs text-muted-foreground">{a.filename} • {new Date(a.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {(!activity || activity.length === 0) && (
                  <div className="text-xs text-muted-foreground">No recent uploads.</div>
                )}
              </div>
            </div>

            {/* Top Offers Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 10 Offers</h3>
              <div className="space-y-2">
                {(topOffers || []).map((offer, index) => (
                  <div key={index} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                    </div>
                    <span className="text-sm text-foreground">{offer.manufacturer} {offer.model}</span>
                  </div>
                ))}
                {(!topOffers || topOffers.length === 0) && (
                  <div className="text-xs text-muted-foreground">No top offers yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MasterLayout
