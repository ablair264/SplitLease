import { useState, useCallback, useEffect } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, Upload, AlertTriangle, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import ResultsDisplay from './ResultsDisplay'
import { api } from '../lib/api'

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

// Smart mapping dictionary for common field variations
const FIELD_MAPPING_PATTERNS = {
  cap_code: [
    'cap_code', 'cap code', 'capcode', 'cap_id', 'cap id', 'cap',
    'vehicle_code', 'vehicle code', 'model_code', 'model code',
    'product_code', 'product code', 'vin_code', 'vin code'
  ],
  manufacturer: [
    'manufacturer', 'make', 'brand', 'marque', 'vehicle_make', 'vehicle make',
    'car_make', 'car make', 'mfr', 'mfg', 'manuf'
  ],
  model: [
    'model', 'vehicle_model', 'vehicle model', 'car_model', 'car model',
    'model_name', 'model name', 'vehicle_description', 'vehicle description',
    'description', 'vehicle_desc', 'vehicle desc', 'product_name', 'product name'
  ],
  variant: [
    'variant', 'trim', 'grade', 'specification', 'spec', 'edition',
    'version', 'model_variant', 'model variant', 'trim_level', 'trim level'
  ],
  monthly_rental: [
    'monthly_rental', 'monthly rental', 'monthly', 'rental', 'monthly_payment', 'monthly payment',
    'payment', 'lease_payment', 'lease payment', 'monthly_cost', 'monthly cost',
    'cost_per_month', 'cost per month', 'monthly_charge', 'monthly charge',
    'monthly_fee', 'monthly fee', 'basic_rental', 'basic rental'
  ],
  p11d: [
    'p11d', 'p11d_price', 'p11d price', 'list_price', 'list price', 'listprice',
    'vehicle_price', 'vehicle price', 'retail_price', 'retail price',
    'cap_price', 'cap price', 'basic_price', 'basic price', 'srp',
    'manufacturer_price', 'manufacturer price', 'full_price', 'full price'
  ],
  otr_price: [
    'otr_price', 'otr price', 'otr', 'on_road_price', 'on road price',
    'on_the_road', 'on the road', 'otrp', 'otrd', 'delivered_price', 'delivered price'
  ],
  term: [
    'term', 'term_months', 'term months', 'contract_term', 'contract term',
    'lease_term', 'lease term', 'duration', 'period', 'months',
    'contract_length', 'contract length', 'agreement_term', 'agreement term'
  ],
  mileage: [
    'mileage', 'annual_mileage', 'annual mileage', 'miles', 'yearly_mileage', 'yearly mileage',
    'mileage_allowance', 'mileage allowance', 'miles_per_year', 'miles per year',
    'contract_mileage', 'contract mileage', 'allowance', 'mile_allowance', 'mile allowance'
  ],
  mpg: [
    'mpg', 'fuel_economy', 'fuel economy', 'miles_per_gallon', 'miles per gallon',
    'economy', 'fuel_consumption', 'fuel consumption', 'consumption',
    'combined_mpg', 'combined mpg', 'official_mpg', 'official mpg'
  ],
  co2: [
    'co2', 'co2_emissions', 'co2 emissions', 'emissions', 'carbon_emissions', 'carbon emissions',
    'co2_gkm', 'co2 gkm', 'co2_g_km', 'co2 g km', 'gkm', 'g_km', 'g km'
  ],
  fuel_type: [
    'fuel_type', 'fuel type', 'fuel', 'engine_type', 'engine type',
    'propulsion', 'power_type', 'power type', 'drivetrain'
  ],
  electric_range: [
    'electric_range', 'electric range', 'ev_range', 'ev range', 'range',
    'battery_range', 'battery range', 'electric_miles', 'electric miles',
    'zero_emission_range', 'zero emission range'
  ],
  insurance_group: [
    'insurance_group', 'insurance group', 'ins_group', 'ins group',
    'insurance_rating', 'insurance rating', 'group', 'rating'
  ],
  body_style: [
    'body_style', 'body style', 'body_type', 'body type', 'bodywork',
    'style', 'configuration', 'type'
  ],
  transmission: [
    'transmission', 'gearbox', 'trans', 'gear_type', 'gear type',
    'drivetrain', 'drive_type', 'drive type'
  ],
  euro_rating: [
    'euro_rating', 'euro rating', 'euro_standard', 'euro standard',
    'emissions_standard', 'emissions standard', 'euro'
  ],
  upfront: [
    'upfront', 'upfront_payment', 'upfront payment', 'initial_payment', 'initial payment',
    'advance_payment', 'advance payment', 'deposit', 'down_payment', 'down payment',
    'initial_rental', 'initial rental', 'advance_rental', 'advance rental'
  ]
}

const UploadPage = () => {
  // Upload states
  const [uploadState, setUploadState] = useState('idle') // idle, mapping, processing, results
  const [fileData, setFileData] = useState(null)
  const [fieldMappings, setFieldMappings] = useState({})
  const [providerName, setProviderName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [savedMappings, setSavedMappings] = useState([])
  const [useDatabaseStorage, setUseDatabaseStorage] = useState(true)
  const [processingResults, setProcessingResults] = useState(null)

  // Smart mapping function to automatically detect field mappings
  const performSmartMapping = (headers) => {
    const smartMappings = {}
    const usedIndices = new Set()
    
    // Normalize header text for comparison
    const normalizeText = (text) => {
      return text.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')  // Replace non-alphanumeric with underscore
        .replace(/_+/g, '_')         // Collapse multiple underscores
        .replace(/^_|_$/g, '')       // Remove leading/trailing underscores
    }
    
    // Create normalized headers for matching
    const normalizedHeaders = headers.map(header => normalizeText(header || ''))
    
    // Match each standard field to the best header
    Object.entries(FIELD_MAPPING_PATTERNS).forEach(([standardField, patterns]) => {
      let bestMatch = null
      let bestScore = 0
      let bestIndex = -1
      
      patterns.forEach(pattern => {
        const normalizedPattern = normalizeText(pattern)
        
        normalizedHeaders.forEach((normalizedHeader, index) => {
          if (usedIndices.has(index)) return // Skip already used headers
          
          let score = 0
          
          // Exact match gets highest score
          if (normalizedHeader === normalizedPattern) {
            score = 100
          }
          // Contains pattern gets medium score
          else if (normalizedHeader.includes(normalizedPattern)) {
            score = 80
          }
          // Pattern contains header gets lower score
          else if (normalizedPattern.includes(normalizedHeader) && normalizedHeader.length > 2) {
            score = 60
          }
          // Similarity check for partial matches
          else {
            const similarity = calculateStringSimilarity(normalizedHeader, normalizedPattern)
            if (similarity > 0.7) {
              score = Math.round(similarity * 50) // Scale similarity to 0-50 range
            }
          }
          
          if (score > bestScore) {
            bestScore = score
            bestMatch = pattern
            bestIndex = index
          }
        })
      })
      
      // Only auto-map if we have a good confidence score
      if (bestScore >= 60 && bestIndex !== -1) {
        smartMappings[standardField] = bestIndex
        usedIndices.add(bestIndex)
      }
    })
    
    return { mappings: smartMappings, confidence: Object.keys(smartMappings).length }
  }
  
  // Helper function to calculate string similarity
  const calculateStringSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }
  
  // Levenshtein distance calculation
  const levenshteinDistance = (str1, str2) => {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Preview parse (first ~10 rows) using robust CSV/XLSX parsers
  const previewFirst10 = async () => {
    const missingRequired = validateMapping()
    if (missingRequired.length > 0) {
      setError(`Please map required fields: ${missingRequired.map(f => STANDARD_FIELDS[f].label).join(', ')}`)
      return
    }
    if (!providerName.trim()) {
      setError('Please enter a provider name')
      return
    }
    if (!selectedFile) {
      setError('No file selected')
      return
    }

    setUploadState('processing')
    setError('')
    try {
      const ext = selectedFile.name.toLowerCase().split('.').pop()
      const vehicles = []

      const buildFromRows = (rows) => {
        const limit = Math.min(11, rows.length)
        for (let i = 1; i < limit; i++) {
          const row = rows[i] || []
          const vehicleData = {}
          Object.entries(fieldMappings).forEach(([field, headerIndex]) => {
            if (headerIndex !== undefined && row[headerIndex] !== undefined) {
              vehicleData[field] = row[headerIndex]
            }
          })
          if (!vehicleData.manufacturer || !vehicleData.model || !vehicleData.monthly_rental) continue
          const scoreBreakdown = computeScoreBreakdown(vehicleData)
          vehicles.push({
            ...vehicleData,
            score: scoreBreakdown.score,
            scoreInfo: { category: getScoreCategory(scoreBreakdown.score) },
            scoreBreakdown
          })
        }
      }

      if (ext === 'csv') {
        await new Promise((resolve, reject) => {
          Papa.parse(selectedFile, {
            skipEmptyLines: true,
            complete: (results) => { buildFromRows(results.data || []); resolve() },
            error: reject
          })
        })
      } else if (ext === 'xlsx' || ext === 'xls') {
        const rows = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const workbook = XLSX.read(e.target.result, { type: 'array' })
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
              const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
              resolve(data)
            } catch (err) { reject(err) }
          }
          reader.onerror = reject
          reader.readAsArrayBuffer(selectedFile)
        })
        buildFromRows(rows)
      } else {
        throw new Error('Unsupported file format. Please upload CSV or XLSX.')
      }

      vehicles.sort((a, b) => b.score - a.score)
      const total = vehicles.length
      const averageScore = total > 0 ? Math.round((vehicles.reduce((s, v) => s + v.score, 0) / total) * 10) / 10 : 0
      const topScore = total > 0 ? Math.max(...vehicles.map(v => v.score)) : 0
      const results = {
        success: true,
        fileName: selectedFile.name,
        stats: {
          totalVehicles: total,
          averageScore,
          topScore,
          scoreDistribution: {
            exceptional: vehicles.filter(v => v.score >= 90).length,
            excellent: vehicles.filter(v => v.score >= 70 && v.score < 90).length,
            good: vehicles.filter(v => v.score >= 50 && v.score < 70).length,
            fair: vehicles.filter(v => v.score >= 30 && v.score < 50).length,
            poor: vehicles.filter(v => v.score < 30).length
          }
        },
        topDeals: vehicles.slice(0, 100),
        allVehicles: vehicles.slice(0, 1000).map(v => ({
          m: v.manufacturer?.substring(0, 15) || '',
          d: v.model?.substring(0, 40) || '',
          p: Math.round(parseFloat(v.monthly_rental) || 0),
          v: Math.round(parseFloat(v.p11d) || 0),
          t: parseFloat(v.term) || 0,
          mi: parseFloat(v.mileage) || 0,
          s: v.score,
          c: v.scoreInfo.category.substring(0, 4)
        })),
        detectedFormat: { format: ext },
        scoringInfo: {
          baseline: 'P11D',
          formula: 'Enhanced cost efficiency scoring',
          provider: providerName.trim(),
          storedInDatabase: false,
          processedCount: vehicles.length
        }
      }
      console.log('Processing Results:', results)
      setProcessingResults(results)
      setUploadState('results')
    } catch (e) {
      setError(e.message)
      setUploadState('mapping')
    }
  }
  // Load saved mappings on mount
  useEffect(() => {
    const loadSavedMappings = async () => {
      try {
        // Simulate getting saved mappings - replace with actual API call
        const mockMappings = [
          { id: '1', provider_name: 'Lex Autolease', column_mappings: { manufacturer: 0, model: 1, monthly_rental: 2 } },
          { id: '2', provider_name: 'Arval', column_mappings: { manufacturer: 1, model: 2, monthly_rental: 3 } }
        ]
        setSavedMappings(mockMappings)
      } catch (error) {
        console.warn('Could not load saved mappings:', error.message)
      }
    }
    loadSavedMappings()
  }, [])

  const parseFile = useCallback((file) => {
    const extension = file.name.toLowerCase().split('.').pop()
    
    if (extension === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          const headers = results.data[0] || []
          const sampleRows = results.data.slice(1, 11)
          
          // Perform smart mapping automatically
          const smartMapping = performSmartMapping(headers)
          setFieldMappings(smartMapping.mappings)
          
          setFileData({
            headers,
            sampleRows,
            totalRows: results.data.length - 1,
            format: 'csv',
            smartMapping: {
              detectedFields: Object.keys(smartMapping.mappings).length,
              totalFields: Object.keys(STANDARD_FIELDS).length,
              confidence: smartMapping.confidence
            }
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
          
          const headers = data[0] || []
          const sampleRows = data.slice(1, 11)
          
          // Perform smart mapping automatically
          const smartMapping = performSmartMapping(headers)
          setFieldMappings(smartMapping.mappings)
          
          setFileData({
            headers,
            sampleRows,
            totalRows: data.length - 1,
            format: 'xlsx',
            smartMapping: {
              detectedFields: Object.keys(smartMapping.mappings).length,
              totalFields: Object.keys(STANDARD_FIELDS).length,
              confidence: smartMapping.confidence
            }
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

  const getHeaderPreview = (headerIndex) => {
    if (!fileData?.sampleRows?.length || headerIndex === undefined) return ''
    return fileData.sampleRows.map(row => row[headerIndex] || '').join(', ')
  }

  const loadSavedMapping = (savedMapping) => {
    setProviderName(savedMapping.provider_name)
    setFieldMappings(savedMapping.column_mappings || {})
  }

  const parseNumeric = (value) => {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return 0
    
    // Handle empty or null values
    if (!value || value.trim() === '') return 0
    
    // Remove currency symbols, commas, spaces, and other non-numeric characters except decimal points
    const cleaned = value.toString().replace(/[£$€,\\s%]/g, '')
    
    // Parse as float and handle edge cases
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  const calculateScore = (vehicle) => {
    const monthly = parseNumeric(vehicle.monthly_rental)
    const p11d = parseNumeric(vehicle.p11d)
    const otr = parseNumeric(vehicle.otr_price)
    const mpg = parseNumeric(vehicle.mpg)
    const co2 = parseNumeric(vehicle.co2)
    let term = parseNumeric(vehicle.term)
    let mileage = parseNumeric(vehicle.mileage)

    // Fallback: if term/mileage missing, use defaults for scoring
    if (term === 0) term = 36 // Default 36 month term
    if (mileage === 0) mileage = 10000 // Default 10k miles

    if (monthly === 0 || p11d === 0) return 0

    // Calculate total lease cost
    const totalLeaseCost = monthly * term
    
    // Calculate total cost as percentage of vehicle value (lower is better)
    const totalCostVsValue = (totalLeaseCost / p11d) * 100
    
    // Score based on total lease cost efficiency (lower percentage = better deal)
    // Excellent deals: <40% of vehicle value, Poor deals: >80% of vehicle value
    let costEfficiencyScore
    if (totalCostVsValue <= 30) costEfficiencyScore = 100
    else if (totalCostVsValue <= 40) costEfficiencyScore = 90
    else if (totalCostVsValue <= 50) costEfficiencyScore = 75
    else if (totalCostVsValue <= 60) costEfficiencyScore = 60
    else if (totalCostVsValue <= 70) costEfficiencyScore = 40
    else if (totalCostVsValue <= 80) costEfficiencyScore = 20
    else costEfficiencyScore = 0
    
    // Mileage allowance score (higher allowance = better value)
    const mileageScore = mileage > 0 ? Math.min(100, (mileage / 15000) * 100) : 50
    
    // Handle hybrid MPG figures which are unrealistic due to WLTP test methodology
    let adjustedMpg = mpg
    const fuelType = (vehicle.fuel_type || '').toString().toLowerCase()
    const isHybrid = fuelType.includes('hybrid') || fuelType.includes('plugin') || fuelType.includes('phev')
    
    if (isHybrid && mpg > 100) {
      // For hybrids with unrealistic MPG (>100), use a more realistic estimate
      if (co2 > 0 && co2 < 50) {
        // Very low CO2 suggests good PHEV - estimate 60-75 MPG real-world
        adjustedMpg = Math.min(75, 55 + (50 - co2))
      } else {
        // Regular hybrid or less efficient PHEV - assume ~50-65 MPG real-world
        adjustedMpg = Math.min(65, mpg * 0.25) // Dramatically reduce unrealistic figures
      }
    }
    
    // Fuel efficiency score (higher adjusted MPG is better)
    const fuelScore = adjustedMpg > 0 ? Math.min(100, adjustedMpg * 1.5) : 50
    
    // Emissions score (lower CO2 is better)
    const emissionsScore = co2 > 0 ? Math.max(0, 100 - co2 / 2) : 50

    // Updated scoring weights - cost efficiency is most important
    const totalScore = (
      costEfficiencyScore * 0.6 +  // 60% weight on cost efficiency
      mileageScore * 0.2 +         // 20% weight on mileage allowance
      fuelScore * 0.1 +            // 10% weight on fuel efficiency
      emissionsScore * 0.1         // 10% weight on emissions
    )

    return Math.round(totalScore * 10) / 10
  }

  // Provide a full score breakdown for transparency in reports
  const computeScoreBreakdown = (vehicle) => {
    const monthly = parseNumeric(vehicle.monthly_rental)
    const p11d = parseNumeric(vehicle.p11d)
    const mpg = parseNumeric(vehicle.mpg)
    const co2 = parseNumeric(vehicle.co2)
    const otr = parseNumeric(vehicle.otr_price)
    const insuranceGroup = parseNumeric(vehicle.insurance_group)
    let term = parseNumeric(vehicle.term)
    let mileage = parseNumeric(vehicle.mileage)

    const usedDefaultTerm = term === 0
    const usedDefaultMileage = mileage === 0
    if (usedDefaultTerm) term = 36
    if (usedDefaultMileage) mileage = 10000

    // Base calculations
    const totalLeaseCost = monthly * term
    const totalCostVsValue = p11d > 0 ? (totalLeaseCost / p11d) * 100 : 0
    const costPerMile = mileage > 0 ? (totalLeaseCost / (mileage * (term / 12))) * 100 : 0

    // Component scores (mirrors calculateScore)
    let costEfficiencyScore
    if (p11d === 0 || monthly === 0) costEfficiencyScore = 0
    else if (totalCostVsValue <= 30) costEfficiencyScore = 100
    else if (totalCostVsValue <= 40) costEfficiencyScore = 90
    else if (totalCostVsValue <= 50) costEfficiencyScore = 75
    else if (totalCostVsValue <= 60) costEfficiencyScore = 60
    else if (totalCostVsValue <= 70) costEfficiencyScore = 40
    else if (totalCostVsValue <= 80) costEfficiencyScore = 20
    else costEfficiencyScore = 0

    const mileageScore = mileage > 0 ? Math.min(100, (mileage / 15000) * 100) : 50

    // Handle hybrid MPG figures - same logic as calculateScore
    let adjustedMpg = mpg
    const fuelType = (vehicle.fuel_type || '').toString().toLowerCase()
    const isHybrid = fuelType.includes('hybrid') || fuelType.includes('plugin') || fuelType.includes('phev')
    
    if (isHybrid && mpg > 100) {
      if (co2 > 0 && co2 < 50) {
        adjustedMpg = Math.min(75, 55 + (50 - co2))
      } else {
        adjustedMpg = Math.min(65, mpg * 0.25)
      }
    }
    
    const fuelScore = adjustedMpg > 0 ? Math.min(100, adjustedMpg * 1.5) : 50
    const emissionsScore = co2 > 0 ? Math.max(0, 100 - co2 / 2) : 50
    const insuranceScore = (insuranceGroup > 0 && insuranceGroup <= 50)
      ? Math.round((100 - ((insuranceGroup - 1) / 49) * 100) * 10) / 10
      : null

    const operatingCostScore = costPerMile > 0 ? Math.max(0, 100 - costPerMile) : 50
    const evRangeScore = vehicle.electric_range ? Math.min(100, (parseNumeric(vehicle.electric_range) / 300) * 100) : null

    const weights = { costEfficiency: 0.6, mileage: 0.2, fuel: 0.1, emissions: 0.1 }
    const score = Math.round((
      costEfficiencyScore * weights.costEfficiency +
      mileageScore * weights.mileage +
      fuelScore * weights.fuel +
      emissionsScore * weights.emissions
    ) * 10) / 10

    return {
      score,
      inputs: {
        monthly: monthly || 0,
        term,
        mileage,
        p11d: p11d || 0,
        otr: otr || 0,
        mpg: mpg || 0,
        adjustedMpg: isHybrid && mpg > 100 ? adjustedMpg : null,
        co2: co2 || 0,
        insuranceGroup: insuranceGroup || null,
        defaultsApplied: {
          term: usedDefaultTerm,
          mileage: usedDefaultMileage
        }
      },
      derived: {
        totalLeaseCost: Math.round(totalLeaseCost * 100) / 100,
        totalCostVsP11DPercent: Math.round(totalCostVsValue * 10) / 10,
        costPerMile: Math.round(costPerMile * 100) / 100
      },
      components: {
        costEfficiencyScore,
        mileageScore,
        fuelScore,
        emissionsScore,
        operatingCostScore,
        evRangeScore,
        insuranceScore // Informational only
      },
      weights
    }
  }

  const getScoreCategory = (score) => {
    if (score >= 90) return 'Exceptional'
    if (score >= 70) return 'Excellent'
    if (score >= 50) return 'Good'
    if (score >= 30) return 'Fair'
    return 'Poor'
  }

  const getSmartMappingSummary = () => {
    const mappedFields = Object.keys(fieldMappings)
    const mappedFieldLabels = mappedFields.map(field => 
      STANDARD_FIELDS[field]?.label.replace('*', '') || field
    )
    
    if (mappedFieldLabels.length === 0) return ''
    if (mappedFieldLabels.length <= 3) return mappedFieldLabels.join(', ')
    return `${mappedFieldLabels.slice(0, 3).join(', ')} + ${mappedFieldLabels.length - 3} more`
  }

  const resetUpload = () => {
    setUploadState('idle')
    setFileData(null)
    setFieldMappings({})
    setProviderName('')
    setSelectedFile(null)
    setError('')
    setProcessingResults(null)
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
        const lines = text.split('\\n').filter(line => line.trim())
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

          const scoreBreakdown = computeScoreBreakdown(vehicleData)
          const processedVehicle = {
            ...vehicleData,
            score: scoreBreakdown.score,
            scoreInfo: { category: getScoreCategory(scoreBreakdown.score) },
            scoreBreakdown
          }

          vehicles.push(processedVehicle)
        }

        vehicles.sort((a, b) => b.score - a.score)
        
        const stats = {
          totalVehicles: vehicles.length,
          averageScore: Math.round(vehicles.reduce((sum, v) => sum + v.score, 0) / vehicles.length * 10) / 10,
          topScore: Math.max(...vehicles.map(v => v.score)),
          scoreDistribution: {
            exceptional: vehicles.filter(v => v.score >= 90).length,
            excellent: vehicles.filter(v => v.score >= 70 && v.score < 90).length,
            good: vehicles.filter(v => v.score >= 50 && v.score < 70).length,
            fair: vehicles.filter(v => v.score >= 30 && v.score < 50).length,
            poor: vehicles.filter(v => v.score < 30).length
          }
        }

        const results = {
          success: true,
          fileName: selectedFile.name,
          stats,
          topDeals: vehicles.slice(0, 100),
          allVehicles: vehicles.slice(0, 1000).map(v => ({
            m: v.manufacturer?.substring(0, 15) || '',
            d: v.model?.substring(0, 40) || '',
            p: Math.round(parseFloat(v.monthly_rental) || 0),
            v: Math.round(parseFloat(v.p11d) || 0),
            t: parseFloat(v.term) || 0,
            mi: parseFloat(v.mileage) || 0,
            s: v.score,
            c: v.scoreInfo.category.substring(0, 4)
          })),
          detectedFormat: { format: 'flexible-csv' },
          scoringInfo: {
            baseline: 'P11D',
            formula: 'Enhanced cost efficiency scoring',
            provider: providerName.trim(),
            storedInDatabase: useDatabaseStorage,
            processedCount: vehicles.length
          }
        }

        // Show results page
        console.log('Processing Results:', results)
        setProcessingResults(results)
        setUploadState('results')
      }
      
      reader.readAsText(selectedFile)
    } catch (error) {
      setError(error.message)
      setUploadState('mapping')
    }
  }

  // Upload to backend API (Railway service)
  const uploadToServer = async () => {
    const missingRequired = validateMapping()
    if (missingRequired.length > 0) {
      setError(`Please map required fields: ${missingRequired.map(f => STANDARD_FIELDS[f].label).join(', ')}`)
      return
    }
    if (!providerName.trim()) {
      setError('Please enter a provider name')
      return
    }
    if (!selectedFile) {
      setError('No file selected')
      return
    }

    setUploadState('processing')
    setError('')
    try {
      const response = await api.upload({
        file: selectedFile,
        providerName: providerName.trim(),
        fieldMappings,
      })
      // Build a compact results object to show confirmation
      const results = {
        server: true,
        upload: response,
        fileName: selectedFile.name,
      }
      setProcessingResults(results)
      setUploadState('results')
    } catch (e) {
      setError(e.message)
      setUploadState('mapping')
    }
  }

  // Render upload content based on state
  const renderUploadContent = () => {
    if (uploadState === 'idle') {
      return (
        <div className="flex flex-col justify-start items-start gap-8">
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="flex justify-start items-center gap-1">
              <div className="flex-1 flex justify-start items-center gap-0.5">
                <div className="text-Contents-Primary text-2xl font-semibold font-inter leading-8">Upload Ratebook</div>
              </div>
            </div>
            <div className="w-full max-w-2xl text-Contents-Tertiary text-xs font-light font-avenir leading-6 tracking-wide">
              Upload a rate book from any provider and then use the dropdown menus to match the fields together.
            </div>
            <div 
              {...getRootProps()}
              className={`self-stretch h-40 p-6 rounded-xl border border-input flex flex-col justify-center items-center gap-5 cursor-pointer transition-colors ${
                isDragActive ? 'border-amber-400 bg-amber-50' : 'bg-zinc-700/20 hover:bg-zinc-700/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="p-2.5 bg-Primary-50 rounded-full flex justify-center items-center">
                <Upload className="w-7 h-7 text-amber-400" />
              </div>
              <div className="self-stretch flex flex-col justify-center items-center gap-1.5">
                <div className="flex justify-start items-center gap-1">
                  <div className="text-Contents-Primary text-sm font-normal font-mulish leading-4">Drop your files here or</div>
                  <div className="text-amber-400 text-sm font-semibold font-mulish leading-4">Click to upload</div>
                </div>
                <div className="self-stretch text-center text-Contents-Tertiary/60 text-xs font-normal font-mulish leading-4">CSV or XLSX</div>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (uploadState === 'mapping') {
      return (
        <div className="flex flex-col justify-start items-start gap-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-Contents-Primary text-2xl font-semibold font-inter leading-8">Map Data Fields</div>
              <div className="text-Contents-Tertiary text-sm font-normal leading-5">Match your file headers to standard fields</div>
            </div>
            <Button variant="ghost" onClick={resetUpload} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Smart Mapping Results */}
          {fileData?.smartMapping && (
            <Card className="p-4 w-full border-green-200 bg-green-50">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    🧠 Smart Mapping Applied
                  </span>
                </div>
                <div className="text-xs text-green-600">
                  Automatically mapped {fileData.smartMapping.detectedFields} of {fileData.smartMapping.totalFields} standard fields. 
                  Review and adjust mappings below before processing.
                </div>
                <div className="flex items-center gap-4 text-xs text-green-600">
                  <span>✓ Auto-detected: {getSmartMappingSummary()}</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 w-full">
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

              {savedMappings.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Or load saved mapping:</label>
                  <Select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const mapping = savedMappings.find(m => m.id === e.target.value)
                        if (mapping) loadSavedMapping(mapping)
                      }
                    }}
                    className="max-w-md"
                  >
                    <option value="">-- Select saved provider --</option>
                    {savedMappings.map(mapping => (
                      <option key={mapping.id} value={mapping.id}>
                        {mapping.provider_name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className={`p-3 rounded-lg border ${useDatabaseStorage ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-2">
                  {useDatabaseStorage ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Database connected - Data will be stored for best price comparison</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-700">Database not configured - Analysis only (no storage)</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div>File: {selectedFile?.name}</div>
                <div>Rows: {fileData?.totalRows?.toLocaleString()}</div>
                <div>Headers found: {fileData?.headers?.length}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 w-full max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {Object.entries(STANDARD_FIELDS).map(([fieldKey, fieldInfo]) => {
                const isAutoMapped = fieldMappings[fieldKey] !== undefined
                const borderColor = fieldInfo.required 
                  ? (isAutoMapped ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')
                  : (isAutoMapped ? 'border-blue-200 bg-blue-50' : 'border-gray-200')
                
                return (
                  <div key={fieldKey} className={`space-y-2 p-3 rounded-lg border ${borderColor}`}>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {isAutoMapped && <span className="text-green-600 text-xs">🧠</span>}
                        {fieldInfo.label}
                        {fieldInfo.required && <span className="text-red-500 text-xs">*Required</span>}
                        {isAutoMapped && <span className="text-green-600 text-xs font-medium">Auto-mapped</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{fieldInfo.description}</div>
                    </div>
                    <Select
                      value={fieldMappings[fieldKey] ?? ''}
                      onChange={(e) => handleFieldMapping(fieldKey, e.target.value)}
                      className="max-w-md"
                    >
                      <option value="">-- Skip this field --</option>
                      {fileData?.headers?.map((header, index) => (
                        <option key={index} value={index}>{header || `Column ${index + 1}`}</option>
                      ))}
                    </Select>
                    {fieldMappings[fieldKey] !== undefined && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        <strong>Preview:</strong> {getHeaderPreview(fieldMappings[fieldKey]) || 'No data'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="flex justify-between items-center w-full">
            <div className="flex gap-4">
              <Button onClick={previewFirst10} variant="outline">
                Test First 10 Rows
              </Button>
              <Button onClick={uploadToServer} className="bg-amber-400 hover:bg-amber-500">
                Upload to Database
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
      )
    }

    if (uploadState === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full"></div>
          <div className="text-xl font-semibold">Processing file...</div>
          <div className="text-muted-foreground">This may take a few moments</div>
        </div>
      )
    }
  }

  // Show results if processing is complete
  if (uploadState === 'results' && processingResults) {
    if (processingResults.server && processingResults.upload) {
      const u = processingResults.upload
      return (
        <div className="pt-24 px-7">
          <div className="mb-6">
            <div className="text-2xl font-semibold">✅ Upload Complete</div>
            <div className="text-sm text-muted-foreground">{processingResults.fileName} processed and stored</div>
          </div>
          <Card className="p-6 max-w-xl">
            <div className="space-y-2 text-sm">
              <div><strong>Session ID:</strong> {u.sessionId}</div>
              <div><strong>Total rows:</strong> {u.totalRows}</div>
              <div><strong>Valid rows:</strong> {u.validRows}</div>
              <div><strong>Processed:</strong> {u.processed}</div>
              <div><strong>Errors:</strong> {u.errors}</div>
              {u.errorDetails?.length > 0 && (
                <div className="mt-2">
                  <strong>Error details (first few):</strong>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(u.errorDetails, null, 2)}</pre>
                </div>
              )}
            </div>
          </Card>
          <div className="mt-6 flex gap-3">
            <Button onClick={resetUpload} variant="outline">Upload Another File</Button>
            <Button onClick={resetUpload} className="bg-amber-400 hover:bg-amber-500">Done</Button>
          </div>
        </div>
      )
    }
    return <ResultsDisplay results={processingResults} onReset={resetUpload} />
  }

  return (
    <div className="pt-24 px-7">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-black-100% text-sm font-semibold font-inter leading-5">Upload & Process</div>
      </div>

      {/* Upload Section */}
      <Card className="max-w-4xl p-8 bg-muted rounded-2xl border border-input">
        {renderUploadContent()}
      </Card>
    </div>
  )
}

export default UploadPage
