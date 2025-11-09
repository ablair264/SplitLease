import { useEffect, useMemo, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Users, CarFront, ClipboardList } from 'lucide-react'
import { api } from '../lib/api'

const sampleCustomers = []

export default function SSCustomers() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('orders_desc')

  const [rows, setRows] = useState(sampleCustomers)
  const [metrics, setMetrics] = useState({ live_customers: 0, vehicles_delivered: 0, vehicles_ordered: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const r = await api.getSSCustomers({ search: query, sort })
        if (!cancelled && r && r.success) {
          setRows(r.data || [])
          setMetrics(r.metrics || { live_customers: 0, vehicles_delivered: 0, vehicles_ordered: 0 })
        }
      } catch (e) { /* ignore */ } finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [query, sort])

  const liveCustomers = metrics.live_customers
  const vehiclesDelivered = metrics.vehicles_delivered
  const vehiclesOrdered = metrics.vehicles_ordered

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = rows.filter(c => !q || c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q))
    return filtered
  }, [query, sort, rows])

  return (
    <div className="pt-8 px-7 space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={Users} title="Live Customers" value={liveCustomers} color="text-amber-400" />
        <MetricCard icon={CarFront} title="Vehicles Delivered" value={vehiclesDelivered} color="text-green-400" />
        <MetricCard icon={ClipboardList} title="Vehicles Ordered" value={vehiclesOrdered} color="text-blue-400" />
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="md:col-span-2">
            <Input placeholder="Search by company or email" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div>
            <Select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="orders_desc">Orders: High → Low</option>
              <option value="orders_asc">Orders: Low → High</option>
              <option value="newest">Newest → Oldest</option>
              <option value="oldest">Oldest → Newest</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden bg-card border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicles Ordered</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-secondary/40">
                  <td className="px-6 py-3 whitespace-nowrap text-foreground">{row.name}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-foreground">{row.region}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-foreground">{row.vehicles_ordered || 0}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-right">
                    <Button variant="outline" className="mr-2">View Customer</Button>
                    <Button variant="outline" className="mr-2">View Orders</Button>
                    <Button className="bg-amber-400 text-black hover:bg-amber-500">New Order</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function MetricCard({ icon: Icon, title, value, color }) {
  return (
    <Card className="p-5 bg-card border border-border flex items-center justify-between">
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
      </div>
      <Icon className={`w-6 h-6 ${color}`} />
    </Card>
  )
}
