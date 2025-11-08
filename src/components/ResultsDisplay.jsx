import { useState } from 'react'
import { TrendingUp, Download, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'

const ResultsDisplay = ({ results, onReset }) => {
  const [currentView, setCurrentView] = useState('overview')
  const [showFullData, setShowFullData] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) return

    // Convert compressed data back to readable format for CSV
    const expandedData = data.map(item => {
      if (item.m) { // Compressed format
        return {
          Manufacturer: item.m,
          Model: item.d,
          'Monthly Payment': item.p,
          'P11D Value': item.v,
          'Term (months)': item.t,
          'Mileage': item.mi,
          'Score': item.s,
          'Category': item.c
        }
      }
      return item // Already in full format (topDeals)
    })

    const headers = Object.keys(expandedData[0])
    const csvContent = [
      headers.join(','),
      ...expandedData.map(row => 
        headers.map(header => {
          const value = row[header]
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  const { stats, topDeals, allVehicles, fileName, detectedFormat, scoringInfo } = results

  return (
    <div className="pt-24 px-7">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" onClick={onReset} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-Contents-Primary">🎉 Analysis Complete!</h1>
          </div>
          <p className="text-Contents-Tertiary">
            Analyzed <strong>{formatNumber(stats.totalVehicles)}</strong> vehicles from <strong>{fileName}</strong>
          </p>
          {detectedFormat && (
            <div className="mt-2 flex items-center gap-4">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                📋 Format: {detectedFormat.format.charAt(0).toUpperCase() + detectedFormat.format.slice(1)}
              </span>
              {scoringInfo && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  🧮 Scoring: {scoringInfo.formula}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'top-deals', label: '🏆 Top Deals', icon: '🏆' },
          { id: 'full-data', label: '📋 All Data', icon: '📋' }
        ].map(tab => (
          <Button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`${
              currentView === tab.id
                ? 'bg-amber-400 hover:bg-amber-500 text-black'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Section */}
      {currentView === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="flex justify-start items-start gap-7 flex-wrap">
            <Card className="flex-1 min-w-48 p-6 bg-amber-400 rounded-[20px] border-none shadow-none">
              <div className="flex flex-col justify-start items-start gap-2">
                <div className="text-white text-sm font-normal font-inter leading-5">Total Vehicles</div>
                <div className="text-white text-2xl font-semibold font-inter leading-8">
                  {formatNumber(stats.totalVehicles)}
                </div>
              </div>
            </Card>

            <Card className="flex-1 min-w-48 p-6 bg-background-4 rounded-[20px] border-none shadow-none">
              <div className="flex flex-col justify-start items-start gap-2">
                <div className="text-black text-sm font-normal font-inter leading-5">Average Score</div>
                <div className="flex justify-between items-center w-full">
                  <div className="text-black text-2xl font-semibold font-inter leading-8">
                    {stats.averageScore}/100
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getScoreColor(stats.averageScore) }}
                  ></div>
                </div>
              </div>
            </Card>

            <Card className="flex-1 min-w-48 p-6 bg-background-5 rounded-[20px] border-none shadow-none">
              <div className="flex flex-col justify-start items-start gap-2">
                <div className="text-black text-sm font-normal font-inter leading-5">Best Deal Score</div>
                <div className="flex justify-between items-center w-full">
                  <div className="text-black text-2xl font-semibold font-inter leading-8">
                    {stats.topScore}/100
                  </div>
                  <TrendingUp 
                    className="w-4 h-4"
                    style={{ color: getScoreColor(stats.topScore) }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Score Distribution */}
          <Card className="p-8 bg-muted rounded-2xl border border-input">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-Contents-Primary">📈 Score Distribution</h3>
              <div className="space-y-4">
                {Object.entries({
                  'Exceptional (90-100)': { count: stats.scoreDistribution.exceptional, color: '#10B981' },
                  'Excellent (70-89)': { count: stats.scoreDistribution.excellent, color: '#22C55E' },
                  'Good (50-69)': { count: stats.scoreDistribution.good, color: '#EAB308' },
                  'Fair (30-49)': { count: stats.scoreDistribution.fair, color: '#F97316' },
                  'Poor (0-29)': { count: stats.scoreDistribution.poor, color: '#EF4444' }
                }).map(([label, { count, color }]) => (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-Contents-Primary">{label}</span>
                      <span className="text-sm text-Contents-Tertiary">
                        {count} vehicles ({((count / stats.totalVehicles) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(count / stats.totalVehicles) * 100}%`,
                          backgroundColor: color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Top 3 Preview */}
          <Card className="p-8 bg-muted rounded-2xl border border-input">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-Contents-Primary">🥇 Top 3 Best Deals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topDeals.slice(0, 3).map((vehicle, index) => (
                  <Card key={index} className="p-6 bg-white rounded-xl border border-input">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-amber-400">#{index + 1}</span>
                        <span 
                          className="px-3 py-1 rounded-full text-white text-sm font-medium"
                          style={{ backgroundColor: getScoreColor(vehicle.score) }}
                        >
                          {vehicle.score}/100
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-Contents-Primary">{vehicle.manufacturer}</h4>
                        <p className="text-Contents-Tertiary">{vehicle.model}</p>
                      </div>
                      <div className="text-xl font-bold text-Contents-Primary">
                        {formatCurrency(vehicle.monthly_rental)}/month
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Download Section */}
          <Card className="p-8 bg-muted rounded-2xl border border-input">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-Contents-Primary">📥 Download Results</h3>
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={() => downloadCSV(topDeals, 'top-100-lease-deals.csv')}
                  className="bg-amber-400 hover:bg-amber-500 text-black"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Top 100 Deals CSV
                </Button>
                <Button 
                  onClick={() => downloadCSV(allVehicles, 'all-lease-deals-scored.csv')}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Complete Dataset CSV
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Top Deals Section */}
      {currentView === 'top-deals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-Contents-Primary">🏆 Top 100 Best Lease Deals</h2>
            <Button 
              onClick={() => downloadCSV(topDeals, 'top-100-lease-deals.csv')}
              className="bg-amber-400 hover:bg-amber-500 text-black"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P11D Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MPG</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CO2</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDeals.map((vehicle, index) => (
                    <>
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{vehicle.manufacturer}</div>
                            <div className="text-sm text-gray-500">{vehicle.model}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {formatCurrency(vehicle.monthly_rental)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatCurrency(vehicle.p11d)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatNumber(vehicle.mpg)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatNumber(vehicle.co2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getScoreColor(vehicle.score) }}
                          >
                            {vehicle.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                          >
                            {expandedRow === index ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                      {expandedRow === index && vehicle.scoreBreakdown && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">Inputs</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Monthly:</span>
                                    <span>{formatCurrency(vehicle.scoreBreakdown.inputs?.monthly || vehicle.monthly_rental)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Term:</span>
                                    <span>
                                      {formatNumber(vehicle.scoreBreakdown.inputs?.term || vehicle.term)} months
                                      {vehicle.scoreBreakdown.inputs?.defaultsApplied?.term && 
                                        <span className="ml-1 text-amber-600">(defaulted)</span>
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Mileage:</span>
                                    <span>
                                      {formatNumber(vehicle.scoreBreakdown.inputs?.mileage || vehicle.mileage)}
                                      {vehicle.scoreBreakdown.inputs?.defaultsApplied?.mileage && 
                                        <span className="ml-1 text-amber-600">(defaulted)</span>
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>P11D:</span>
                                    <span>{formatCurrency(vehicle.scoreBreakdown.inputs?.p11d || vehicle.p11d)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>OTR:</span>
                                    <span>{formatCurrency(vehicle.scoreBreakdown.inputs?.otr || vehicle.otr_price)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>MPG:</span>
                                    <span>
                                      {formatNumber(vehicle.scoreBreakdown.inputs?.mpg || vehicle.mpg)}
                                      {vehicle.scoreBreakdown.inputs?.adjustedMpg && 
                                        <span className="ml-1 text-blue-600">
                                          (adjusted: {formatNumber(vehicle.scoreBreakdown.inputs.adjustedMpg)})
                                        </span>
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>CO2:</span>
                                    <span>{formatNumber(vehicle.scoreBreakdown.inputs?.co2 || vehicle.co2)}</span>
                                  </div>
                                  {(vehicle.scoreBreakdown.inputs?.insuranceGroup || vehicle.insurance_group) && (
                                    <div className="flex justify-between">
                                      <span>Insurance Group:</span>
                                      <span>{formatNumber(vehicle.scoreBreakdown.inputs?.insuranceGroup || vehicle.insurance_group)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">Derived</h4>
                                <div className="space-y-2 text-sm">
                                  {vehicle.scoreBreakdown.derived?.totalLeaseCost && (
                                    <div className="flex justify-between">
                                      <span>Total Lease Cost:</span>
                                      <span>{formatCurrency(vehicle.scoreBreakdown.derived.totalLeaseCost)}</span>
                                    </div>
                                  )}
                                  {vehicle.scoreBreakdown.derived?.totalCostVsP11DPercent && (
                                    <div className="flex justify-between">
                                      <span>Cost vs P11D:</span>
                                      <span>{vehicle.scoreBreakdown.derived.totalCostVsP11DPercent}%</span>
                                    </div>
                                  )}
                                  {vehicle.scoreBreakdown.derived?.costPerMile !== undefined && (
                                    <div className="flex justify-between">
                                      <span>Operating Cost/mi:</span>
                                      <span>£{(vehicle.scoreBreakdown.derived.costPerMile/100).toFixed(2)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">Component Scores</h4>
                                <div className="space-y-3">
                                  {[
                                    { label: 'Cost Efficiency', value: vehicle.scoreBreakdown.components?.costEfficiencyScore },
                                    { label: 'Operating Cost', value: vehicle.scoreBreakdown.components?.operatingCostScore },
                                    { label: 'EV Range', value: vehicle.scoreBreakdown.components?.evRangeScore },
                                    { label: 'Mileage', value: vehicle.scoreBreakdown.components?.mileageScore },
                                    { label: 'Fuel', value: vehicle.scoreBreakdown.components?.fuelScore },
                                    { label: 'Emissions', value: vehicle.scoreBreakdown.components?.emissionsScore }
                                  ].filter(x => x.value !== null && x.value !== undefined).map(({label, value}) => (
                                    <div key={label} className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>{label}:</span>
                                        <span className="font-medium">{Math.round(value)}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="h-2 rounded-full transition-all duration-300"
                                          style={{ 
                                            width: `${value}%`, 
                                            backgroundColor: getScoreColor(value) 
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))}
                                  {vehicle.scoreBreakdown.components?.insuranceScore !== null && vehicle.scoreBreakdown.components?.insuranceScore !== undefined && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Insurance (info only):</span>
                                        <span className="font-medium">{Math.round(vehicle.scoreBreakdown.components.insuranceScore)}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="h-2 rounded-full transition-all duration-300"
                                          style={{ 
                                            width: `${vehicle.scoreBreakdown.components.insuranceScore}%`, 
                                            backgroundColor: '#64748b' 
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3">Weights</h4>
                                <div className="space-y-2 text-sm">
                                  {vehicle.scoreBreakdown.weights && (
                                    <>
                                      <div className="flex justify-between">
                                        <span>Cost:</span>
                                        <span className="font-medium">{Math.round((vehicle.scoreBreakdown.weights.costEfficiency || 0)*100)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Mileage:</span>
                                        <span className="font-medium">{Math.round((vehicle.scoreBreakdown.weights.mileage || 0)*100)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Fuel:</span>
                                        <span className="font-medium">{Math.round((vehicle.scoreBreakdown.weights.fuel || 0)*100)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Emissions:</span>
                                        <span className="font-medium">{Math.round((vehicle.scoreBreakdown.weights.emissions || 0)*100)}%</span>
                                      </div>
                                      {vehicle.scoreBreakdown.weights.operating && (
                                        <div className="flex justify-between">
                                          <span>Operating:</span>
                                          <span className="font-medium">{Math.round(vehicle.scoreBreakdown.weights.operating*100)}%</span>
                                        </div>
                                      )}
                                      {vehicle.scoreBreakdown.weights.evRange && (
                                        <div className="flex justify-between">
                                          <span>EV Range:</span>
                                          <span className="font-medium">{Math.round(vehicle.scoreBreakdown.weights.evRange*100)}%</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                  <div className="text-xs text-blue-700">
                                    <div className="font-medium mb-1">Final Score: {vehicle.scoreBreakdown.score}</div>
                                    <div>Formula: 60% Cost + 20% Mileage + 10% Fuel + 10% Emissions</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Full Data Section */}
      {currentView === 'full-data' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-Contents-Primary">
              📋 Complete Dataset ({formatNumber(allVehicles.length)} vehicles)
            </h2>
            <div className="flex gap-4">
              <Button 
                onClick={() => downloadCSV(allVehicles, 'all-lease-deals-scored.csv')}
                className="bg-amber-400 hover:bg-amber-500 text-black"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Data CSV
              </Button>
              <Button 
                onClick={() => setShowFullData(!showFullData)}
                variant="outline"
              >
                {showFullData ? 'Show Less' : 'Show All'}
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P11D Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(showFullData ? allVehicles : allVehicles.slice(0, 50)).map((vehicle, index) => {
                    // Handle compressed format
                    const v = vehicle.m ? {
                      manufacturer: vehicle.m,
                      model: vehicle.d,
                      monthly_rental: vehicle.p,
                      p11d: vehicle.v,
                      score: vehicle.s,
                      term: vehicle.t,
                      mileage: vehicle.mi,
                      scoreInfo: { category: vehicle.c }
                    } : vehicle
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getScoreColor(v.score) }}
                          >
                            {v.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{v.manufacturer}</div>
                            <div className="text-sm text-gray-500">{v.model}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {formatCurrency(v.monthly_rental)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatCurrency(v.p11d)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {v.term || 'N/A'} months
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatNumber(v.mileage)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {v.scoreInfo.category}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          
          {!showFullData && allVehicles.length > 50 && (
            <div className="text-center py-6">
              <p className="text-Contents-Tertiary mb-4">
                Showing 50 of {formatNumber(allVehicles.length)} vehicles
              </p>
              <Button 
                onClick={() => setShowFullData(true)}
                variant="outline"
              >
                Show All {formatNumber(allVehicles.length)} Vehicles
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResultsDisplay