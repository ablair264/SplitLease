import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Upload, AlertTriangle, X } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Card } from './ui/card'

const STANDARD_FIELDS = {
  cap_code: { label: 'CAP Code', description: 'Unique vehicle identifier', required: false },
  manufacturer: { label: 'Manufacturer*', description: 'Vehicle make (e.g., BMW, Audi)', required: true },
  model: { label: 'Model*', description: 'Vehicle model name', required: true },
  variant: { label: 'Variant', description: 'Specific vehicle variant/trim', required: false },
  monthly_rental: { label: 'Monthly Rental*', description: 'Monthly lease payment', required: true },
  p11d: { label: 'P11D Price*', description: 'List price including VAT', required: true },
  otr_price: { label: 'OTR Price', description: 'On-the-road price', required: false },
  term: { label: 'Term (Months)', description: 'Contract length in months', required: false },
  mileage: { label: 'Annual Mileage', description: 'Mileage allowance per year', required: false },
  mpg: { label: 'Fuel Economy', description: 'Miles per gallon', required: false },
  co2: { label: 'CO2 Emissions', description: 'CO2 emissions in g/km', required: false },
  fuel_type: { label: 'Fuel Type', description: 'Petrol, Diesel, Electric, Hybrid', required: false },
  electric_range: { label: 'Electric Range', description: 'EV/PHEV range in miles', required: false },
  insurance_group: { label: 'Insurance Group', description: 'Insurance group (1-50)', required: false },
  body_style: { label: 'Body Style', description: 'Car body type (Hatchback, Saloon, etc.)', required: false },
  transmission: { label: 'Transmission', description: 'Manual or Automatic', required: false },
  euro_rating: { label: 'Euro Rating', description: 'Euro emissions standard', required: false },
  upfront: { label: 'Upfront Payment', description: 'Initial rental payment', required: false }
}

const FileUpload = ({ onBack }) => {
  const [uploadState, setUploadState] = useState('idle') // idle, mapping, processing
  const [fileData, setFileData] = useState(null)
  const [fieldMappings, setFieldMappings] = useState({})
  const [providerName, setProviderName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')

  const parseFile = useCallback((file) => {
    const extension = file.name.toLowerCase().split('.').pop()
    
    if (extension === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          const headers = results.data[0] || []
          const sampleRows = results.data.slice(1, 11)
          setFileData({
            headers,
            sampleRows,
            totalRows: results.data.length - 1,
            format: 'csv'
          })
          setUploadState('mapping')
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`)
        }
      })
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
          
          const headers = (data[0] || []).map(h => String(h ?? ''))
          const sampleRows = data.slice(1, 11)
          setFileData({
            headers,
            sampleRows,
            totalRows: data.length - 1,
            format: 'xlsx'
          })
          setUploadState('mapping')
        } catch (err) {
          setError(`Error parsing Excel file: ${err.message}`)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      setError('Please upload a CSV or Excel file')
    }
  }, [])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      parseFile(file)
    }
  }, [parseFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleFieldMapping = (standardField, headerIndex) => {
    setFieldMappings(prev => ({
      ...prev,
      [standardField]: headerIndex === '' ? undefined : parseInt(headerIndex)
    }))
  }

  const validateMapping = () => {
    const requiredFields = Object.keys(STANDARD_FIELDS).filter(key => STANDARD_FIELDS[key].required)
    return requiredFields.filter(field => fieldMappings[field] === undefined)
  }

  const calculateScore = (vehicleData) => {
    const monthly = parseFloat(vehicleData.monthly_rental) || 0
    const p11d = parseFloat(vehicleData.p11d) || 0
    const term = parseFloat(vehicleData.term) || 36

    if (monthly === 0 || p11d === 0) return 0

    const totalCost = monthly * term
    const costRatio = (totalCost / p11d) * 100

    if (costRatio <= 30) return 100
    if (costRatio <= 40) return 90
    if (costRatio <= 50) return 75
    if (costRatio <= 60) return 60
    if (costRatio <= 70) return 40
    if (costRatio <= 80) return 20
    return 0
  }

  const getScoreCategory = (score) => {
    if (score >= 90) return 'Exceptional'
    if (score >= 70) return 'Excellent'
    if (score >= 50) return 'Good'
    if (score >= 30) return 'Fair'
    return 'Poor'
  }

  const processFile = async (testMode = false) => {
    const missingRequired = validateMapping()
    if (missingRequired.length > 0) {
      setError(`Please map required fields: ${missingRequired.map(f => STANDARD_FIELDS[f].label).join(', ')}`)
      return
    }

    if (!providerName.trim()) {
      setError('Please enter a provider name')
      return
    }

    setUploadState('processing')
    setError('')

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        const vehicles = []
        
        const maxRows = testMode ? Math.min(11, lines.length) : lines.length
        for (let i = 1; i < maxRows; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''))
          if (row.length < 3) continue

          const vehicleData = {}
          Object.entries(fieldMappings).forEach(([field, headerIndex]) => {
            if (headerIndex !== undefined && row[headerIndex]) {
              vehicleData[field] = row[headerIndex]
            }
          })

          if (!vehicleData.manufacturer || !vehicleData.model || !vehicleData.monthly_rental) {
            continue
          }

          const score = calculateScore(vehicleData)
          const processedVehicle = {
            ...vehicleData,
            score,
            scoreInfo: { category: getScoreCategory(score) }
          }

          vehicles.push(processedVehicle)
        }

        vehicles.sort((a, b) => b.score - a.score)
        
        // Show results
        console.log(`Processed ${vehicles.length} vehicles`)
        console.log('Top 10 deals:', vehicles.slice(0, 10))
        
        alert(`Successfully processed ${vehicles.length} vehicles! Check console for details.`)
        onBack()
      }
      
      reader.readAsText(selectedFile)
    } catch (error) {
      setError(error.message)
      setUploadState('mapping')
    }
  }

  const resetUpload = () => {
    setUploadState('idle')
    setFileData(null)
    setFieldMappings({})
    setProviderName('')
    setSelectedFile(null)
    setError('')
  }

  if (uploadState === 'idle') {
    return (
      <div className="min-h-screen bg-background-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Upload Ratebook</h1>
          </div>

          <Card className="p-8 bg-muted border border-input">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Upload Rate Sheet</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload a rate book from any provider and then use the dropdown menus to match the fields together.
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`h-40 p-6 border-2 border-dashed rounded-xl flex flex-col justify-center items-center gap-4 cursor-pointer transition-colors ${
                  isDragActive ? 'border-amber-400 bg-amber-50' : 'border-input bg-zinc-700/20 hover:bg-zinc-700/30'
                }`}
              >
                <input {...getInputProps()} />
                <div className="p-2.5 bg-Primary-50 rounded-full">
                  <Upload className="w-7 h-7 text-amber-400" />
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center mb-1.5">
                    <span className="text-sm text-Contents-Primary">Drop your files here or</span>
                    <span className="text-sm font-semibold text-amber-400">Click to upload</span>
                  </div>
                  <div className="text-xs text-Contents-Tertiary/60">CSV or XLSX</div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (uploadState === 'mapping') {
    return (
      <div className="min-h-screen bg-background-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={resetUpload} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Map Data Fields</h1>
                <p className="text-sm text-muted-foreground">Match your file headers to standard fields</p>
              </div>
            </div>
            <Button variant="ghost" onClick={resetUpload} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Provider Name */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Provider Name:</label>
                  <Input 
                    placeholder="e.g., Lex Autolease, Arval, etc."
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">Database not configured - Analysis only (no storage)</span>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <div>File: {selectedFile?.name}</div>
                  <div>Rows: {fileData?.totalRows?.toLocaleString()}</div>
                  <div>Headers found: {fileData?.headers?.length}</div>
                </div>
              </div>
            </Card>

            {/* Field Mappings */}
            <Card className="p-6">
              <div className="space-y-4">
                {Object.entries(STANDARD_FIELDS).map(([fieldKey, fieldInfo]) => (
                  <div key={fieldKey} className="space-y-2">
                    <div>
                      <div className="font-medium text-sm">{fieldInfo.label}</div>
                      <div className="text-xs text-muted-foreground">{fieldInfo.description}</div>
                    </div>
                    <Select
                      value={fieldMappings[fieldKey] || ''}
                      onChange={(e) => handleFieldMapping(fieldKey, e.target.value)}
                      className="max-w-md"
                    >
                      <option value="">-- Skip this field --</option>
                      {fileData?.headers?.map((header, index) => (
                        <option key={index} value={index}>{header}</option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Button onClick={() => processFile(true)} variant="outline">
                  Test First 10 Rows
                </Button>
                <Button onClick={() => processFile(false)} className="bg-amber-400 hover:bg-amber-500">
                  Process All {fileData?.totalRows?.toLocaleString()} Rows
                </Button>
              </div>
              
              {validateMapping().length > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <X className="w-4 h-4" />
                  <span className="text-sm">
                    Missing: {validateMapping().map(f => STANDARD_FIELDS[f].label.replace('*', '')).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (uploadState === 'processing') {
    return (
      <div className="min-h-screen bg-background-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing file...</h2>
          <p className="text-muted-foreground">This may take a few moments</p>
        </div>
      </div>
    )
  }

  return null
}

export default FileUpload
