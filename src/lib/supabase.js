import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper functions for vehicle data
export const vehicleService = {
  // Get unique manufacturers
  async getManufacturers() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('manufacturer')
      .order('manufacturer')

    if (error) throw error

    // Return unique manufacturers
    const uniqueManufacturers = [...new Set(data.map(v => v.manufacturer))]
    return uniqueManufacturers
  },

  // Get models for a specific manufacturer
  async getModels(manufacturer) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('model')
      .eq('manufacturer', manufacturer)
      .order('model')

    if (error) throw error

    // Return unique models
    const uniqueModels = [...new Set(data.map(v => v.model))]
    return uniqueModels
  },

  // Get variants for a specific manufacturer and model
  async getVariants(manufacturer, model) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, variant, lex_make_code, lex_model_code, lex_variant_code, co2_emissions, fuel_type, p11d_price')
      .eq('manufacturer', manufacturer)
      .eq('model', model)
      .order('variant')

    if (error) throw error
    return data
  },

  // Search vehicles by text
  async searchVehicles(searchText) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, manufacturer, model, variant, lex_make_code, lex_model_code, lex_variant_code')
      .or(`manufacturer.ilike.%${searchText}%,model.ilike.%${searchText}%,variant.ilike.%${searchText}%`)
      .limit(50)

    if (error) throw error
    return data
  }
}

// Helper functions for Drivalia jobs
export const drivaliaService = {
  // Get all jobs for current user
  async getJobs() {
    const { data, error } = await supabase
      .from('drivalia_jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create a new job
  async createJob(vehicles, config) {
    const { data, error } = await supabase
      .from('drivalia_jobs')
      .insert({
        vehicles,
        config,
        vehicle_count: vehicles.length,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get job by ID
  async getJob(jobId) {
    const { data, error } = await supabase
      .from('drivalia_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) throw error
    return data
  },

  // Get quotes for a job
  async getJobQuotes(jobId) {
    const { data, error } = await supabase
      .from('drivalia_quotes')
      .select('*')
      .eq('job_id', jobId)
      .order('manufacturer', { ascending: true })
      .order('model', { ascending: true })
      .order('variant', { ascending: true })
      .order('term', { ascending: true })
      .order('mileage', { ascending: true })

    if (error) throw error
    return data
  },

  // Subscribe to job updates
  subscribeToJobs(callback) {
    const subscription = supabase
      .channel('drivalia-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivalia_jobs'
        },
        callback
      )
      .subscribe()

    return subscription
  }
}
