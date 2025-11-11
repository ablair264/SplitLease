import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Bot, RefreshCw, Play, Download, X, Loader2 } from 'lucide-react'

export default function LexRobot() {
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState({ total: 0, withCodes: 0, withoutCodes: 0 })
  const [quoteRequests, setQuoteRequests] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progressStatus, setProgressStatus] = useState('')
  const [results, setResults] = useState([])
  const pollingRef = useRef(null)

  useEffect(() => {
    reloadAll()
    // Cleanup polling on unmount
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current)
      }
    }
  }, [])

  const reloadAll = async () => {
    await Promise.all([loadVehicles(), loadStats()])
  }

  const loadVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .not('lex_make_code', 'is', null)
      .not('lex_model_code', 'is', null)
      .not('lex_variant_code', 'is', null)
      .order('manufacturer', { ascending: true })
      .order('model', { ascending: true })
      .order('variant', { ascending: true })

    if (!error) setVehicles(data || [])
  }

  const loadStats = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, lex_make_code')

    if (error) return
    const total = data.length
    const withCodes = data.filter(v => v.lex_make_code !== null).length
    setStats({ total, withCodes, withoutCodes: total - withCodes })
  }

  const addVehicleToQuotes = (vehicle) => {
    const request = {
      id: Date.now(),
      vehicleId: vehicle.id,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      variant: vehicle.variant,
      makeCode: vehicle.lex_make_code,
      modelCode: vehicle.lex_model_code,
      variantCode: vehicle.lex_variant_code,
      co2: vehicle.co2_emissions,
      capCode: vehicle.cap_code,
      terms: ['ALL'],
      mileages: ['ALL'],
      discountType: 'system',
      discountPercent: null,
      maintenance: false
    }
    setQuoteRequests(prev => [...prev, request])
  }

  const updateRequest = (id, field, value) => {
    setQuoteRequests(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const removeRequest = (id) => {
    setQuoteRequests(prev => prev.filter(r => r.id !== id))
  }

  const expandRequests = () => {
    const terms = ['24', '36', '48', '60']
    const mileages = ['5000', '8000', '10000', '12000', '15000', '20000', '25000', '30000']
    const expanded = []
    for (const r of quoteRequests) {
      const t = r.terms.includes('ALL') ? terms : r.terms
      const m = r.mileages.includes('ALL') ? mileages : r.mileages
      for (const term of t) {
        for (const mileage of m) {
          expanded.push({ ...r, term, mileage, expandedId: `${r.id}-${term}-${mileage}` })
        }
      }
    }
    return expanded
  }

  const cancelProcessing = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current)
      pollingRef.current = null
    }
    setProcessing(false)
    setProgressStatus('')
  }

  const fetchPricing = async () => {
    setProcessing(true)
    setProgressStatus('Submitting job to backend...')
    setResults([])
    try {
      // Submit as a backend job; backend worker will process with Puppeteer
      const payload = {
        vehicles: quoteRequests.map(r => ({
          id: r.vehicleId,
          manufacturer: r.manufacturer,
          model: r.model,
          variant: r.variant,
          lex_make_code: r.makeCode,
          lex_model_code: r.modelCode,
          lex_variant_code: r.variantCode,
        })),
        config: {
          terms: quoteRequests.some(r => r.terms.includes('ALL')) ? 'ALL' : (quoteRequests[0]?.terms?.[0] || '36'),
          mileages: quoteRequests.some(r => r.mileages.includes('ALL')) ? 'ALL' : (quoteRequests[0]?.mileages?.[0] || '10000'),
          discountType: quoteRequests[0]?.discountType || 'system',
          discountPercent: quoteRequests[0]?.discountPercent || null,
          maintenance: !!quoteRequests[0]?.maintenance
        }
      }
      const { data } = await api.submitLexJob(payload)
      const jobId = data.id
      setProgressStatus('Job submitted. Waiting for worker to process...')

      // Poll results periodically
      const poll = async () => {
        try {
          const jobsResp = await api.getLexJobs()
          const job = (jobsResp.data || []).find(j => j.id === jobId)
          if (job) {
            if (job.status === 'completed') {
              setProgressStatus('Job completed! Loading results...')
              const res = await api.getLexJobResults(jobId)
              // Map to UI results table minimal shape
              const mapped = (res.data || []).map(q => ({
                manufacturer: q.manufacturer,
                model: q.model,
                variant: q.variant,
                term: q.term,
                mileage: q.mileage,
                monthlyRental: q.monthly_rental,
                initialRental: q.initial_rental,
                totalCost: q.total_cost,
                co2: q.co2,
                fuelType: q.fuel_type,
                p11d: q.p11d,
                success: true
              }))
              setResults(mapped)
              setProcessing(false)
              setProgressStatus('')
              return
            } else if (job.status === 'processing') {
              setProgressStatus(`Processing quotes... (${job.metadata?.successCount || 0} completed)`)
            } else if (job.status === 'failed') {
              setProgressStatus('Job failed. Check logs.')
              setProcessing(false)
              return
            }
          }
        } catch (_) {
          setProgressStatus('Checking job status...')
        }
        pollingRef.current = setTimeout(poll, 2000)
      }
      poll()
    } catch (e) {
      setProcessing(false)
      setProgressStatus('')
      alert(e.message)
    }
  }

  const saveResults = async (batch) => {
    const successful = batch.filter(b => b.success)
    if (successful.length === 0) return
    const rows = successful.map(r => ({
      vehicle_id: r.vehicleId,
      manufacturer: r.manufacturer,
      model: r.model,
      variant: r.variant,
      term: parseInt(r.term),
      mileage: parseInt(r.mileage),
      monthly_rental: r.monthlyRental ? parseFloat(r.monthlyRental) : null,
      initial_rental: r.initialRental ? parseFloat(r.initialRental) : null,
      total_cost: r.totalCost ? parseFloat(r.totalCost) : null,
      co2: r.co2 ?? null,
      fuel_type: r.fuelType ?? null,
      p11d: r.p11d ? parseFloat(r.p11d) : null,
      vat: r.vat ? parseFloat(r.vat) : null,
      maintenance: !!r.maintenance,
      discount_type: r.discountType || null,
      discount_percent: r.discountPercent ? parseFloat(r.discountPercent) : null,
      quote_id: r.quoteId || null,
      lex_line_number: r.lineNumber || null,
      fetched_at: r.timestamp
    }))
    await supabase.from('lex_quotes').insert(rows)
  }

  const exportCsv = () => {
    if (results.length === 0) return
    const headers = ['Manufacturer','Model','Variant','CAP Code','Term','Mileage','Monthly Rental','Initial Rental','Total Cost','CO2','Fuel Type','P11D','Maintenance','Success','Error']
    const rows = results.map(r => [
      r.manufacturer, r.model, r.variant, r.capCode || '', r.term, r.mileage,
      r.monthlyRental || '', r.initialRental || '', r.totalCost || '',
      r.co2 || '', r.fuelType || '', r.p11d || '',
      r.maintenance ? 'Yes' : 'No',
      r.success ? 'Yes' : 'No',
      r.error || ''
    ])
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lex-quotes-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pt-8 px-7 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lex Autolease Automation</h1>
          <p className="text-muted-foreground">Build and run quote batches using Lex codes</p>
        </div>
      </div>

      <Card className="p-6 bg-card border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Status</h2>
          <Button variant="outline" onClick={reloadAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="px-4 py-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Vehicles</div>
          </div>
          <div className="px-4 py-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{stats.withCodes}</div>
            <div className="text-xs text-muted-foreground">With Lex Codes</div>
          </div>
          <div className="px-4 py-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{stats.withoutCodes}</div>
            <div className="text-xs text-muted-foreground">Missing Lex Codes</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Build Quote Batch</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Add Vehicle ({vehicles.length} available)
          </label>
          <select
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            onChange={(e) => {
              const v = vehicles.find(v => v.id === parseInt(e.target.value))
              if (v) addVehicleToQuotes(v)
              e.target.value = ''
            }}
          >
            <option value="">-- Select a vehicle to add --</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.manufacturer} {v.model} — {v.variant}
              </option>
            ))}
          </select>
        </div>

        {quoteRequests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-2">Vehicle</th>
                  <th className="p-2">Terms</th>
                  <th className="p-2">Mileages</th>
                  <th className="p-2">Discount</th>
                  <th className="p-2">Maint.</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quoteRequests.map(r => (
                  <tr key={r.id} className="border-b border-border align-top">
                    <td className="p-2">
                      <div className="font-medium text-foreground">{r.manufacturer} {r.model}</div>
                      <div className="text-xs text-muted-foreground max-w-md truncate">{r.variant}</div>
                    </td>
                    <td className="p-2">
                      <select multiple className="w-32 p-1 border border-border rounded text-xs h-20 bg-background text-foreground"
                        value={r.terms}
                        onChange={(e) => {
                          const vals = Array.from(e.target.selectedOptions, o => o.value)
                          updateRequest(r.id, 'terms', vals.length ? vals : ['ALL'])
                        }}
                      >
                        <option value="ALL">ALL (24,36,48,60)</option>
                        <option value="24">24</option>
                        <option value="36">36</option>
                        <option value="48">48</option>
                        <option value="60">60</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <select multiple className="w-32 p-1 border border-border rounded text-xs h-20 bg-background text-foreground"
                        value={r.mileages}
                        onChange={(e) => {
                          const vals = Array.from(e.target.selectedOptions, o => o.value)
                          updateRequest(r.id, 'mileages', vals.length ? vals : ['ALL'])
                        }}
                      >
                        <option value="ALL">ALL</option>
                        <option value="5000">5,000</option>
                        <option value="8000">8,000</option>
                        <option value="10000">10,000</option>
                        <option value="12000">12,000</option>
                        <option value="15000">15,000</option>
                        <option value="20000">20,000</option>
                        <option value="25000">25,000</option>
                        <option value="30000">30,000</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        className="w-32 p-1 border border-border rounded text-xs bg-background text-foreground"
                        value={r.discountType}
                        onChange={(e) => updateRequest(r.id, 'discountType', e.target.value)}
                      >
                        <option value="system">System</option>
                        <option value="custom">Custom</option>
                      </select>
                      {r.discountType === 'custom' && (
                        <input
                          type="number"
                          step="0.1"
                          placeholder="%"
                          className="mt-1 w-32 p-1 border border-border rounded text-xs bg-background text-foreground"
                          value={r.discountPercent || ''}
                          onChange={(e) => updateRequest(r.id, 'discountPercent', e.target.value)}
                        />
                      )}
                    </td>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={r.maintenance}
                        onChange={(e) => updateRequest(r.id, 'maintenance', e.target.checked)}
                      />
                    </td>
                    <td className="p-2">
                      <button className="text-red-600 text-sm" onClick={() => removeRequest(r.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <Button onClick={fetchPricing} disabled={processing || quoteRequests.length === 0}>
            <Play className="w-4 h-4 mr-2" />
            {processing ? 'Processing...' : `Fetch Pricing (${expandRequests().length})`}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={exportCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {processing && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <div>
                  <div className="font-medium text-foreground">Processing Quote Request</div>
                  <div className="text-sm text-muted-foreground">{progressStatus}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelProcessing}
                className="border-red-500/20 text-red-500 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {results.length > 0 && (
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-2">Vehicle</th>
                  <th className="p-2 text-center">Term</th>
                  <th className="p-2 text-center">Mileage</th>
                  <th className="p-2 text-right">Monthly</th>
                  <th className="p-2 text-right">Initial</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="p-2">
                      <div className="font-medium text-foreground">{r.manufacturer} {r.model}</div>
                      <div className="text-xs text-muted-foreground max-w-md truncate">{r.variant}</div>
                    </td>
                    <td className="p-2 text-center">{r.term}m</td>
                    <td className="p-2 text-center">{parseInt(r.mileage).toLocaleString()}</td>
                    <td className="p-2 text-right">{r.monthlyRental ? `£${parseFloat(r.monthlyRental).toFixed(2)}` : '-'}</td>
                    <td className="p-2 text-right">{r.initialRental ? `£${parseFloat(r.initialRental).toFixed(2)}` : '-'}</td>
                    <td className="p-2 text-right">{r.totalCost ? `£${parseFloat(r.totalCost).toFixed(2)}` : '-'}</td>
                    <td className="p-2 text-center">{r.success ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

