import { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Textarea } from './ui/textarea'
import { Bot, Car, Clock, CheckCircle, XCircle, Play } from 'lucide-react'
import { api } from '../lib/api'

export default function DrivaliRobot() {
  const [jobConfig, setJobConfig] = useState({
    vehicles: '',
    terms: 'ALL',
    mileages: 'ALL',
    maintenance: false,
    deposit: 0
  })
  
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const response = await api.getDrivaliaJobs()
      if (response?.success) {
        setJobs(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitJob = async () => {
    if (!jobConfig.vehicles.trim()) {
      alert('Please enter vehicle specifications')
      return
    }

    try {
      setSubmitting(true)
      const vehicles = jobConfig.vehicles.split('\n').map(line => {
        const parts = line.trim().split(/[,\t]/)
        if (parts.length >= 3) {
          return {
            make: parts[0].trim(),
            model: parts[1].trim(),
            variant: parts[2].trim()
          }
        }
        return null
      }).filter(Boolean)

      if (vehicles.length === 0) {
        alert('Please enter valid vehicle specifications (Make, Model, Variant)')
        return
      }

      const response = await api.submitDrivaliaJob({
        vehicles,
        config: {
          terms: jobConfig.terms,
          mileages: jobConfig.mileages,
          maintenance: jobConfig.maintenance,
          deposit: jobConfig.deposit
        }
      })

      if (response?.success) {
        setJobConfig({
          vehicles: '',
          terms: 'ALL',
          mileages: 'ALL',
          maintenance: false,
          deposit: 0
        })
        loadJobs()
      }
    } catch (error) {
      console.error('Failed to submit job:', error)
      alert('Failed to submit job. Please try again.')
    } finally {
      setSubmitting(false)
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Vehicle List (one per line: Make, Model, Variant)
            </label>
            <Textarea
              placeholder="BMW, 1 SERIES, 116d 5dr&#10;AUDI, A3, 30 TFSI&#10;MERCEDES, A-CLASS, A180"
              value={jobConfig.vehicles}
              onChange={(e) => setJobConfig({...jobConfig, vehicles: e.target.value})}
              rows={6}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: Make, Model, Variant (separated by commas or tabs)
            </p>
          </div>

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
              disabled={submitting || !jobConfig.vehicles.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Start Quote Job'}
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
                      onClick={() => api.downloadDrivaliaResults(job.id)}
                    >
                      Download Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => api.viewDrivaliaResults(job.id)}
                    >
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
    </div>
  )
}