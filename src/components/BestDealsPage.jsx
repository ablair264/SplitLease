import { useState, useEffect, useCallback } from 'react'
import { Download, Filter, X } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Modal } from './ui/modal'

const BestDealsPage = () => {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    manufacturer: '',
    fuelType: '',
    maxMonthly: '',
    minScore: ''
  })
  const [totalDeals, setTotalDeals] = useState(0)
  const [manufacturers, setManufacturers] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState(null)

  const computeBreakdown = (deal) => {
    // Mirror the high-level logic used in results display; simplified
    const monthly = parseFloat(deal.best_monthly_rental) || 0
    const p11d = parseFloat(deal.p11d_price) || 0
    const term = parseFloat(deal.best_term_months) || 36
    const upfront = parseFloat(deal.best_upfront_payment) || 0
    const mileage = parseFloat(deal.best_annual_mileage) || 10000

    const totalPaid = monthly * term + upfront
    const costEfficiency = p11d > 0 ? Math.max(0, Math.min(100, 100 - ((totalPaid / p11d) * 100 - 30) * 2)) : 75
    const termScore = term >= 36 ? 10 : Math.max(0, (term / 36) * 10)
    const mileageScore = mileage >= 10000 ? 10 : Math.max(0, (mileage / 10000) * 10)
    const upfrontScore = upfront === 0 ? 10 : Math.max(0, 10 - Math.min(10, upfront / (monthly || 1)))

    const score = Math.round((costEfficiency * 0.7 + termScore * 0.15 + mileageScore * 0.1 + upfrontScore * 0.05) * 10) / 10
    return {
      score,
      factors: {
        costEfficiency: Math.round(costEfficiency),
        termScore: Math.round(termScore),
        mileageScore: Math.round(mileageScore),
        upfrontScore: Math.round(upfrontScore),
      },
      totals: { totalPaid, p11d, term, mileage, upfront, monthly }
    }
  }
  const [error, setError] = useState('')

  // Lazy import to avoid circulars
  const loadFiltersFromAPI = useCallback(async () => {
    try {
      const { api } = await import('../lib/api')
      const resp = await api.getFilters()
      if (resp.success) {
        setManufacturers(resp.manufacturers || [])
        setFuelTypes(resp.fuelTypes || [])
      }
    } catch (e) {
      // Non-fatal for page
      console.warn('Filters load failed:', e.message)
    }
  }, [])

  const loadBestDeals = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { api } = await import('../lib/api')
      const resp = await api.getBestDeals({
        manufacturer: filters.manufacturer || undefined,
        fuelType: filters.fuelType || undefined,
        maxMonthly: filters.maxMonthly || undefined,
        minScore: filters.minScore || undefined,
        limit: 200,
      })
      const rows = resp.data || []
      setDeals(rows)
      setTotalDeals(rows.length)
    } catch (e) {
      console.error('Error loading best deals:', e)
      setError(e.message)
      setDeals([])
      setTotalDeals(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load initial data
  useEffect(() => {
    loadFiltersFromAPI()
    loadBestDeals()
  }, [loadFiltersFromAPI, loadBestDeals])

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      manufacturer: '',
      fuelType: '',
      maxMonthly: '',
      minScore: ''
    })
  }

  const formatCurrency = (value) => {
    const num = parseFloat(value)
    return isNaN(num) ? '£0' : `£${num.toLocaleString()}`
  }

  const formatNumber = (value) => {
    const num = parseFloat(value)
    return isNaN(num) ? '0' : num.toLocaleString()
  }

  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981'
    if (score >= 70) return '#22C55E'
    if (score >= 50) return '#EAB308'
    if (score >= 30) return '#F97316'
    return '#EF4444'
  }

  const openBreakdown = (deal) => {
    setSelectedDeal({ ...deal, breakdown: computeBreakdown(deal) })
    setShowBreakdown(true)
  }

  const downloadCSV = () => {
    if (deals.length === 0) return

    const headers = [
      'Manufacturer', 'Model', 'CAP Code', 'Best Monthly Rental', 
      'Best Provider', 'P11D Price', 'Term (Months)', 'Annual Mileage',
      'Fuel Type', 'CO2 Emissions', 'MPG', 'Score'
    ]

    const csvContent = [
      headers.join(','),
      ...deals.map(deal => [
        deal.manufacturer,
        deal.model,
        deal.cap_code || '',
        deal.best_monthly_rental,
        deal.best_provider_name || '',
        deal.p11d_price || '',
        deal.best_term_months || '',
        deal.best_annual_mileage || '',
        deal.fuel_type || '',
        deal.co2_emissions || '',
        deal.mpg || '',
        deal.best_deal_score || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'best-lease-deals.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="pt-8 px-7">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg font-semibold">Loading best deals from database...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 px-7">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-black-100% mb-2">🏆 Best Lease Deals Database</h1>
          <p className="text-sm text-Contents-Tertiary">Aggregated best prices across all providers</p>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
        <Button onClick={downloadCSV} className="bg-amber-400 hover:bg-amber-500 text-black">
          <Download className="w-4 h-4 mr-2" />
          Download CSV ({totalDeals} deals)
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-medium">Filter Deals</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Manufacturer:</label>
              <Select 
                value={filters.manufacturer} 
                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map(mfr => (
                  <option key={mfr} value={mfr}>{mfr}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fuel Type:</label>
              <Select 
                value={filters.fuelType} 
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              >
                <option value="">All Fuel Types</option>
                {fuelTypes.map(fuel => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Monthly (£):</label>
              <Input 
                type="number" 
                placeholder="e.g. 500"
                value={filters.maxMonthly}
                onChange={(e) => handleFilterChange('maxMonthly', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Score:</label>
              <Input 
                type="number" 
                placeholder="e.g. 70"
                value={filters.minScore}
                onChange={(e) => handleFilterChange('minScore', e.target.value)}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button onClick={clearFilters} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              <strong>{totalDeals}</strong> deals found
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {deals.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">No deals found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or upload some rate sheets first.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Monthly
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P11D
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Term/Mileage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fuel/CO2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals.map((deal, index) => (
                  <tr key={deal.vehicle_id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{deal.manufacturer}</div>
                        <div className="text-sm text-gray-500">{deal.model}</div>
                        {deal.cap_code && (
                          <div className="text-xs text-gray-400">CAP: {deal.cap_code}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{formatCurrency(deal.best_monthly_rental)}</div>
                      {deal.best_upfront_payment > 0 && (
                        <div className="text-xs text-gray-500">
                          + {formatCurrency(deal.best_upfront_payment)} upfront
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{deal.best_provider_name || '—'}</div>
                      <div className="text-xs text-gray-500">
                        {deal.last_updated ? new Date(deal.last_updated).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatCurrency(deal.p11d_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.best_term_months || 'N/A'} months</div>
                      <div className="text-xs text-gray-500">{formatNumber(deal.best_annual_mileage)} miles/year</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.fuel_type || 'N/A'}</div>
                      {deal.co2_emissions !== null && (
                        <div className="text-xs text-gray-500">{deal.co2_emissions}g CO2</div>
                      )}
                      {deal.mpg && (
                        <div className="text-xs text-gray-500">{deal.mpg} MPG</div>
                      )}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      {deal.best_deal_score && (
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getScoreColor(deal.best_deal_score) }}
                        >
                          {Math.round(deal.best_deal_score)}
                        </span>
                      )}
                      <button className="ml-2 text-xs text-blue-600 underline" onClick={() => openBreakdown(deal)}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <BreakdownModal open={showBreakdown} onClose={() => setShowBreakdown(false)} deal={selectedDeal} />
    </div>
  )
}

// Modal rendering for breakdown
// Attach after component to keep file simple
const BreakdownModal = ({ open, onClose, deal }) => {
  if (!open || !deal) return null
  const b = deal.breakdown
  return (
    <Modal open={open} title={`${deal.manufacturer} ${deal.model} – Score details`}>
      <div className="space-y-3 text-sm">
        <div>
          <strong>Total paid:</strong> £{Math.round(b.totals.totalPaid).toLocaleString()} over {b.totals.term} months @ £{Math.round(b.totals.monthly).toLocaleString()}/mo
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>Cost efficiency: {b.factors.costEfficiency}/100</div>
          <div>Term factor: {b.factors.termScore}/10</div>
          <div>Mileage factor: {b.factors.mileageScore}/10</div>
          <div>Upfront factor: {b.factors.upfrontScore}/10</div>
        </div>
        <div className="mt-2">
          <span className="font-semibold">Overall score: {b.score}</span>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  )
}

export { BreakdownModal }

export default BestDealsPage
