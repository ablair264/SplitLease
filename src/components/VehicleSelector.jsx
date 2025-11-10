import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Select } from './ui/select'
import { X, Plus, Upload, Car } from 'lucide-react'
import { vehicleService } from '../lib/supabase'

export default function VehicleSelector({ selectedVehicles, onVehiclesChange }) {
  // Dropdown state
  const [manufacturers, setManufacturers] = useState([])
  const [models, setModels] = useState([])
  const [variants, setVariants] = useState([])

  // Selection state
  const [selectedManufacturer, setSelectedManufacturer] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)

  // Loading states
  const [loadingManufacturers, setLoadingManufacturers] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVariants, setLoadingVariants] = useState(false)

  // CSV upload state
  const [uploadingCSV, setUploadingCSV] = useState(false)

  // Load manufacturers on mount
  useEffect(() => {
    loadManufacturers()
  }, [])

  const loadManufacturers = async () => {
    try {
      setLoadingManufacturers(true)
      const data = await vehicleService.getManufacturers()
      setManufacturers(data)
    } catch (error) {
      console.error('Failed to load manufacturers:', error)
      alert('Failed to load manufacturers. Please refresh the page.')
    } finally {
      setLoadingManufacturers(false)
    }
  }

  const handleManufacturerChange = async (manufacturer) => {
    setSelectedManufacturer(manufacturer)
    setSelectedModel('')
    setSelectedVariant(null)
    setModels([])
    setVariants([])

    if (!manufacturer) return

    try {
      setLoadingModels(true)
      const data = await vehicleService.getModels(manufacturer)
      setModels(data)
    } catch (error) {
      console.error('Failed to load models:', error)
      alert('Failed to load models')
    } finally {
      setLoadingModels(false)
    }
  }

  const handleModelChange = async (model) => {
    setSelectedModel(model)
    setSelectedVariant(null)
    setVariants([])

    if (!model) return

    try {
      setLoadingVariants(true)
      const data = await vehicleService.getVariants(selectedManufacturer, model)
      setVariants(data)
    } catch (error) {
      console.error('Failed to load variants:', error)
      alert('Failed to load variants')
    } finally {
      setLoadingVariants(false)
    }
  }

  const handleVariantChange = (variantId) => {
    const variant = variants.find(v => v.id === parseInt(variantId))
    setSelectedVariant(variant)
  }

  const handleAddVehicle = () => {
    if (!selectedVariant) return

    // Check if vehicle already added
    const alreadyAdded = selectedVehicles.some(v => v.id === selectedVariant.id)
    if (alreadyAdded) {
      alert('This vehicle has already been added')
      return
    }

    // Add vehicle to list
    const newVehicle = {
      id: selectedVariant.id,
      manufacturer: selectedManufacturer,
      model: selectedModel,
      variant: selectedVariant.variant,
      lex_make_code: selectedVariant.lex_make_code,
      lex_model_code: selectedVariant.lex_model_code,
      lex_variant_code: selectedVariant.lex_variant_code,
      co2_emissions: selectedVariant.co2_emissions,
      fuel_type: selectedVariant.fuel_type,
      p11d_price: selectedVariant.p11d_price
    }

    onVehiclesChange([...selectedVehicles, newVehicle])

    // Reset selections
    setSelectedManufacturer('')
    setSelectedModel('')
    setSelectedVariant(null)
    setModels([])
    setVariants([])
  }

  const handleRemoveVehicle = (vehicleId) => {
    onVehiclesChange(selectedVehicles.filter(v => v.id !== vehicleId))
  }

  const handleCSVUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCSV(true)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      // Skip header row if it exists
      const dataLines = lines[0].toLowerCase().includes('make') || lines[0].toLowerCase().includes('manufacturer')
        ? lines.slice(1)
        : lines

      const newVehicles = []
      const errors = []

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim()
        if (!line) continue

        const parts = line.split(',').map(p => p.trim())

        if (parts.length < 3) {
          errors.push(`Line ${i + 1}: Invalid format (expected Make, Model, Variant)`)
          continue
        }

        const [manufacturer, model, variant] = parts

        try {
          // Search for exact match
          const variantData = await vehicleService.getVariants(manufacturer, model)
          const match = variantData.find(v =>
            v.variant.toLowerCase().includes(variant.toLowerCase()) ||
            variant.toLowerCase().includes(v.variant.toLowerCase())
          )

          if (match) {
            // Check if already added
            const alreadyExists = [...selectedVehicles, ...newVehicles].some(v => v.id === match.id)
            if (!alreadyExists) {
              newVehicles.push({
                id: match.id,
                manufacturer,
                model,
                variant: match.variant,
                lex_make_code: match.lex_make_code,
                lex_model_code: match.lex_model_code,
                lex_variant_code: match.lex_variant_code,
                co2_emissions: match.co2_emissions,
                fuel_type: match.fuel_type,
                p11d_price: match.p11d_price
              })
            }
          } else {
            errors.push(`Line ${i + 1}: No match found for "${manufacturer} ${model} ${variant}"`)
          }
        } catch (error) {
          errors.push(`Line ${i + 1}: Error searching for vehicle - ${error.message}`)
        }
      }

      if (newVehicles.length > 0) {
        onVehiclesChange([...selectedVehicles, ...newVehicles])
      }

      if (errors.length > 0) {
        alert(`CSV import completed with ${newVehicles.length} vehicles added.\n\nErrors:\n${errors.join('\n')}`)
      } else {
        alert(`Successfully imported ${newVehicles.length} vehicles!`)
      }

    } catch (error) {
      console.error('CSV upload error:', error)
      alert('Failed to process CSV file')
    } finally {
      setUploadingCSV(false)
      event.target.value = '' // Reset file input
    }
  }

  return (
    <div className="space-y-4">
      {/* Cascading Dropdowns */}
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-foreground">Select Vehicles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Manufacturer Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Manufacturer
            </label>
            <Select
              value={selectedManufacturer}
              onChange={(e) => handleManufacturerChange(e.target.value)}
              disabled={loadingManufacturers}
            >
              <option value="">
                {loadingManufacturers ? 'Loading...' : 'Select Manufacturer'}
              </option>
              {manufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </Select>
          </div>

          {/* Model Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Model
            </label>
            <Select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!selectedManufacturer || loadingModels}
            >
              <option value="">
                {loadingModels ? 'Loading...' : 'Select Model'}
              </option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </Select>
          </div>

          {/* Variant Dropdown */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Variant
            </label>
            <Select
              value={selectedVariant?.id || ''}
              onChange={(e) => handleVariantChange(e.target.value)}
              disabled={!selectedModel || loadingVariants}
            >
              <option value="">
                {loadingVariants ? 'Loading...' : 'Select Variant'}
              </option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.variant}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Add Vehicle Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddVehicle}
            disabled={!selectedVariant}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Vehicle
          </Button>

          {/* CSV Upload */}
          <label className="inline-flex">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={uploadingCSV}
              className="hidden"
            />
            <Button
              as="span"
              variant="outline"
              disabled={uploadingCSV}
              className="cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-1" />
              {uploadingCSV ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </label>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          CSV format: Manufacturer, Model, Variant (one vehicle per line)
        </p>
      </Card>

      {/* Selected Vehicles List */}
      {selectedVehicles.length > 0 && (
        <Card className="p-4 bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-3">
            Selected Vehicles ({selectedVehicles.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-2 bg-secondary/20 rounded border border-border"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">
                    {vehicle.manufacturer} {vehicle.model}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vehicle.variant}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveVehicle(vehicle.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
