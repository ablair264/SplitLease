import { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import VehicleSelector from './VehicleSelector'
import { Bot, Clock, CheckCircle, XCircle, Play, Download, Eye } from 'lucide-react'
import { drivaliaService } from '../lib/supabase'

export default function DrivaliRobot() {
  const [selectedVehicles, setSelectedVehicles] = useState([])
  const [jobConfig, setJobConfig] = useState({
    terms: 'ALL',
    mileages: 'ALL',
    maintenance: false,
    deposit: 0
  })

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [viewingResults, setViewingResults] = useState(null)

  useEffect(() => {
    loadJobs()

    // Subscribe to job updates
    const subscription = drivaliaService.subscribeToJobs((payload) => {
      if (payload.eventType === 'INSERT') {
        setJobs(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setJobs(prev => prev.map(job =>
          job.id === payload.new.id ? payload.new : job
        ))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const data = await drivaliaService.getJobs()
      setJobs(data || [])
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitJob = async () => {
    if (selectedVehicles.length === 0) {
      alert('Please select at least one vehicle')
      return
    }

    try {
      setSubmitting(true)

      const job = await drivaliaService.createJob(selectedVehicles, jobConfig)

      alert(`Job #${job.id} submitted successfully!`)

      // Reset form
      setSelectedVehicles([])
      setJobConfig({
        terms: 'ALL',
        mileages: 'ALL',
        maintenance: false,
        deposit: 0
      })

      // Reload jobs
      loadJobs()

    } catch (error) {
      console.error('Failed to submit job:', error)
      alert('Failed to submit job. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewResults = async (jobId) => {
    try {
      const quotes = await drivaliaService.getJobQuotes(jobId)
      setViewingResults({ jobId, quotes })
    } catch (error) {
      console.error('Failed to load results:', error)
      alert('Failed to load results')
    }
  }

  const handleDownloadExcel = async (jobId) => {
    try {
      const quotes = await drivaliaService.getJobQuotes(jobId)

      if (quotes.length === 0) {
        alert('No quotes available to download')
        return
      }

      // Convert to CSV (simple Excel-compatible format)
      const headers = ['Manufacturer', 'Model', 'Variant', 'Term', 'Mileage', 'Monthly Rental', 'Initial Payment', 'Total Cost', 'Maintenance', 'Supplier']
      const rows = quotes.map(q => [
        q.manufacturer,
        q.model,
        q.variant,
        q.term,
        q.mileage,
        q.monthly_rental || '',
        q.initial_payment || '',
        q.total_cost || '',
        q.maintenance_included ? 'Yes' : 'No',
        q.supplier_name || ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drivalia-job-${jobId}-results.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Failed to download results:', error)
      alert('Failed to download results')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="pt-8 px-7 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bot className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drivalia Automation</h1>
          <p className="text-muted-foreground">Automated quote generation using Drivalia FMO API</p>
        </div>
      </div>

      {/* Job Configuration */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">New Quote Job</h2>

        <div className="space-y-4">
          {/* Vehicle Selector with Cascading Dropdowns */}
          <VehicleSelector
            selectedVehicles={selectedVehicles}
            onVehiclesChange={setSelectedVehicles}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Terms</label>
              <Select 
                value={jobConfig.terms} 
                onChange={(e) => setJobConfig({...jobConfig, terms: e.target.value})}
              >
                <option value="ALL">All Terms (24,36,48,60)</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60">60 months</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mileages</label>
              <Select 
                value={jobConfig.mileages} 
                onChange={(e) => setJobConfig({...jobConfig, mileages: e.target.value})}
              >
                <option value="ALL">All Mileages</option>
                <option value="5000">5,000 miles</option>
                <option value="8000">8,000 miles</option>
                <option value="10000">10,000 miles</option>
                <option value="12000">12,000 miles</option>
                <option value="15000">15,000 miles</option>
                <option value="20000">20,000 miles</option>
                <option value="25000">25,000 miles</option>
                <option value="30000">30,000 miles</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Deposit (£)</label>
              <Input
                type="number"
                min="0"
                step="100"
                value={jobConfig.deposit}
                onChange={(e) => setJobConfig({...jobConfig, deposit: Number(e.target.value)})}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={jobConfig.maintenance}
                  onChange={(e) => setJobConfig({...jobConfig, maintenance: e.target.checked})}
                />
                <span className="text-sm text-foreground">Include Maintenance</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmitJob}
              disabled={submitting || selectedVehicles.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : `Start Quote Job (${selectedVehicles.length} vehicles)`}
            </Button>
          </div>
        </div>
      </Card>

      {/* Jobs History */}
      <Card className="p-6 bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quote Jobs</h2>
          <Button variant="outline" onClick={loadJobs} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No quote jobs found. Start your first automation job above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="border border-border rounded-lg p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium text-foreground">
                        Job #{job.id} - {job.vehicle_count} vehicles
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started: {new Date(job.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-foreground">
                      Success: {job.success_count || 0} / {job.vehicle_count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Duration: {job.duration_seconds || 0}s
                    </div>
                  </div>
                </div>
                
                {job.status === 'completed' && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadExcel(job.id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResults(job.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Results
                    </Button>
                  </div>
                )}
                
                {job.error_details && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Error: {JSON.stringify(job.error_details)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Results Display */}
      {viewingResults && (
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Job #{viewingResults.jobId} Results ({viewingResults.quotes.length} quotes)
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingResults(null)}
            >
              Close
            </Button>
          </div>

          {viewingResults.quotes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No quotes available yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="p-2 font-medium text-foreground">Manufacturer</th>
                    <th className="p-2 font-medium text-foreground">Model</th>
                    <th className="p-2 font-medium text-foreground">Variant</th>
                    <th className="p-2 font-medium text-foreground">Term</th>
                    <th className="p-2 font-medium text-foreground">Mileage</th>
                    <th className="p-2 font-medium text-foreground">Monthly</th>
                    <th className="p-2 font-medium text-foreground">Initial</th>
                    <th className="p-2 font-medium text-foreground">Total</th>
                    <th className="p-2 font-medium text-foreground">Maint.</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingResults.quotes.map((quote, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary/20">
                      <td className="p-2 text-foreground">{quote.manufacturer}</td>
                      <td className="p-2 text-foreground">{quote.model}</td>
                      <td className="p-2 text-foreground text-xs">{quote.variant}</td>
                      <td className="p-2 text-foreground">{quote.term}m</td>
                      <td className="p-2 text-foreground">{quote.mileage.toLocaleString()}</td>
                      <td className="p-2 text-foreground font-semibold">
                        £{quote.monthly_rental?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="p-2 text-foreground">
                        £{quote.initial_payment?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="p-2 text-foreground">
                        £{quote.total_cost?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="p-2 text-foreground">
                        {quote.maintenance_included ? '✓' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}