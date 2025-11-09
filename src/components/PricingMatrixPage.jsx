import { useState, useEffect, useCallback } from 'react'
import { Upload, Download, Filter, X, Trash2 } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Modal } from './ui/modal'
import { api } from '../lib/api'
import UploadPage from './UploadPage'

const PricingMatrixPage = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    manufacturer: '',
    provider: '',
    fuelType: '',
    bodyStyle: '',
    maxMonthly: '',
    minScore: ''
  })
  const [totalOffers, setTotalOffers] = useState(0)
  const [manufacturers, setManufacturers] = useState([])
  const [providers, setProviders] = useState([])
  const [fuelTypes, setFuelTypes] = useState([])
  const [bodyStyles, setBodyStyles] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [error, setError] = useState('')

  const loadLeaseOffers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const resp = await api.getLeaseOffers({
        manufacturer: filters.manufacturer || undefined,
        provider: filters.provider || undefined,
        fuelType: filters.fuelType || undefined,
        bodyStyle: filters.bodyStyle || undefined,
        maxMonthly: filters.maxMonthly || undefined,
        minScore: filters.minScore || undefined,
        limit: 500,
      })
      const rows = resp.data || []
      setOffers(rows)
      setTotalOffers(rows.length)
      
      // Extract unique values for filters
      if (rows.length > 0) {
        const uniqueManufacturers = Array.from(new Set(rows.map(r => r.manufacturer).filter(Boolean)))
        const uniqueProviders = Array.from(new Set(rows.map(r => r.provider_name).filter(Boolean)))
        const uniqueFuelTypes = Array.from(new Set(rows.map(r => r.fuel_type).filter(Boolean)))
        const uniqueBodyStyles = Array.from(new Set(rows.map(r => r.body_style).filter(Boolean)))
        
        setManufacturers(uniqueManufacturers)
        setProviders(uniqueProviders)
        setFuelTypes(uniqueFuelTypes)
        setBodyStyles(uniqueBodyStyles)
      }
    } catch (e) {
      console.error('Error loading lease offers:', e)
      setError(e.message)
      setOffers([])
      setTotalOffers(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLeaseOffers()
  }, [loadLeaseOffers])

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      manufacturer: '',
      provider: '',
      fuelType: '',
      bodyStyle: '',
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

  const downloadCSV = () => {
    if (offers.length === 0) return

    const headers = [
      'Manufacturer', 'Model', 'Variant', 'CAP Code', 'Provider', 'Monthly Rental',
      'Upfront Payment', 'Term (Months)', 'Annual Mileage', 'P11D Price',
      'Fuel Type', 'CO2 Emissions', 'MPG', 'Body Style', 'Deal Score', 'Total Cost'
    ]

    const csvContent = [
      headers.join(','),
      ...offers.map(offer => [
        offer.manufacturer,
        offer.model,
        offer.variant || '',
        offer.cap_code || '',
        offer.provider_name || '',
        offer.monthly_rental,
        offer.upfront_payment || 0,
        offer.term_months,
        offer.annual_mileage,
        offer.p11d_price || '',
        offer.fuel_type || '',
        offer.co2_emissions || '',
        offer.mpg || '',
        offer.body_style || '',
        offer.deal_score || '',
        offer.total_cost || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'pricing-matrix.csv')
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
          <p className="text-lg font-semibold">Loading pricing matrix...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-8 px-7">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-black-100% mb-2">📊 Pricing Matrix</h1>
          <p className="text-sm text-Contents-Tertiary">Complete lease offer database with vehicle details</p>
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowUploadModal(true)} 
            className="bg-amber-400 hover:bg-amber-500 text-black"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Ratebook
          </Button>
          <Button onClick={downloadCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download CSV ({totalOffers} offers)
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-medium">Filter Offers</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              <label className="block text-sm font-medium mb-2">Provider:</label>
              <Select 
                value={filters.provider} 
                onChange={(e) => handleFilterChange('provider', e.target.value)}
              >
                <option value="">All Providers</option>
                {providers.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
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
              <label className="block text-sm font-medium mb-2">Body Style:</label>
              <Select 
                value={filters.bodyStyle}
                onChange={(e) => handleFilterChange('bodyStyle', e.target.value)}
              >
                <option value="">All Body Styles</option>
                {bodyStyles.map(bs => (
                  <option key={bs} value={bs}>{bs}</option>
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
              <strong>{totalOffers}</strong> offers found
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {offers.length === 0 ? (
        <Card className="p-12 text-center bg-zinc-900 border border-zinc-800 text-foreground">
          <h3 className="text-xl font-semibold mb-2">No offers found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or upload some rate sheets first.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-zinc-900 border border-zinc-800 text-foreground">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Monthly
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    P11D
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Term/Mileage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Fuel/CO2
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                {offers.map((offer, index) => (
                  <tr key={offer.id || index} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-zinc-100">{offer.manufacturer}</div>
                        <div className="text-sm text-zinc-400">{offer.model}</div>
                        {offer.variant && (
                          <div className="text-xs text-zinc-500">{offer.variant}</div>
                        )}
                        {offer.cap_code && (
                          <div className="text-xs text-zinc-500">CAP: {offer.cap_code}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-zinc-100">{offer.provider_name || '—'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-zinc-100">{formatCurrency(offer.monthly_rental)}</div>
                      {offer.upfront_payment > 0 && (
                        <div className="text-xs text-zinc-400">
                          + {formatCurrency(offer.upfront_payment)} upfront
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-zinc-100">
                      {formatCurrency(offer.p11d_price)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-100">{offer.term_months || 'N/A'} months</div>
                      <div className="text-xs text-zinc-400">{formatNumber(offer.annual_mileage)} miles/year</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-100">{offer.fuel_type || 'N/A'}</div>
                      {offer.co2_emissions !== null && (
                        <div className="text-xs text-zinc-400">{offer.co2_emissions}g CO2</div>
                      )}
                      {offer.mpg && (
                        <div className="text-xs text-zinc-400">{offer.mpg} MPG</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {offer.deal_score && (
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getScoreColor(offer.deal_score) }}
                        >
                          {Math.round(offer.deal_score)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-zinc-100">
                      {formatCurrency(offer.total_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden m-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Upload Ratebook</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-secondary rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              <UploadPage />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingMatrixPage