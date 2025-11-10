# DrivaliaRobot: Supabase Integration with Cascading Dropdowns

**Date:** 2025-11-10
**Status:** Approved
**Author:** Claude Code

## Overview

Migrate DrivaliaRobot from textarea-based vehicle input to cascading Make/Model/Variant dropdowns connected to Supabase, with support for bulk CSV uploads and real-time job tracking.

## Current State

- DrivaliaRobot uses textarea for vehicle input (format: "Make, Model, Variant")
- Backend uses PostgreSQL + HTTP API for job processing
- No Supabase integration in the frontend
- Supabase already has `vehicles` table with make/model/variant data

## Goals

1. Replace textarea with cascading dropdowns (Make → Model → Variant)
2. Integrate Supabase for vehicle data and job tracking
3. Support bulk CSV uploads for power users
4. Add real-time job status updates
5. Display results in table with Excel download capability

## Architecture

### Supabase Integration Strategy

**Hybrid Approach:**
- Use Supabase for: vehicle dropdowns, Drivalia job tracking, quote storage
- Keep PostgreSQL backend for job processing (gradual migration)
- Future: migrate everything to Supabase

### Database Schema

**Existing Tables:**
- `vehicles` - Contains make, model, variant, codes (already exists)

**New Tables:**

1. **`drivalia_jobs`** - Job tracking
   - `id`, `user_id`, `status`, `vehicles` (JSONB), `config` (JSONB)
   - `vehicle_count`, `success_count`, `failure_count`, `duration_seconds`
   - Timestamps: `created_at`, `started_at`, `completed_at`
   - Status: 'pending', 'processing', 'completed', 'failed'

2. **`drivalia_quotes`** - Quote results
   - `id`, `job_id`, `vehicle_id`
   - `make`, `model`, `variant`
   - `term`, `mileage`, `monthly_rental`, `initial_payment`, `total_cost`
   - `maintenance_included`, `supplier_name`, `quote_reference`
   - `fetched_at` timestamp

**RLS Policies:**
- Users can only see their own jobs and quotes
- Vehicle data is public read-only

## UI Components

### VehicleSelector Component (New)

**File:** `/src/components/VehicleSelector.jsx`

**Features:**
- Three cascading Select dropdowns: Make → Model → Variant
- "Add Vehicle" button to build a list
- "Upload CSV" button for bulk imports
- Selected vehicles list with remove buttons

**Data Flow:**
1. Mount → Fetch unique Makes from Supabase
2. Select Make → Fetch Models for that Make
3. Select Model → Fetch Variants for that Model
4. Select Variant → Enable "Add Vehicle" button
5. Click "Add" → Add to array, reset dropdowns

**Supabase Queries:**
```javascript
// Get unique makes
const { data: makes } = await supabase
  .from('vehicles')
  .select('make')
  .order('make')

// Get models for selected make
const { data: models } = await supabase
  .from('vehicles')
  .select('model')
  .eq('make', selectedMake)
  .order('model')

// Get variants for selected make+model
const { data: variants } = await supabase
  .from('vehicles')
  .select('id, variant, make_code, model_code, variant_code')
  .eq('make', selectedMake)
  .eq('model', selectedModel)
  .order('variant')
```

**CSV Upload:**
- Accept `.csv` files with columns: Make, Model, Variant
- Validate each row against Supabase vehicles table
- Show preview before adding to job

### Updated DrivaliRobot Component

**Changes:**
- Replace textarea with `<VehicleSelector />` component
- Use Supabase instead of HTTP API for job submission
- Load jobs from Supabase on mount
- Subscribe to Realtime updates for job status
- Fetch results from `drivalia_quotes` table
- Add client-side Excel download

**State Management:**
```javascript
const [selectedVehicles, setSelectedVehicles] = useState([])
const [jobConfig, setJobConfig] = useState({
  terms: 'ALL',
  mileages: 'ALL',
  maintenance: false,
  deposit: 0
})
const [jobs, setJobs] = useState([])
```

**Job Submission:**
```javascript
const { data: newJob } = await supabase
  .from('drivalia_jobs')
  .insert({
    user_id: user.id,
    status: 'pending',
    vehicles: selectedVehicles,  // JSONB
    config: jobConfig,           // JSONB
    vehicle_count: selectedVehicles.length
  })
  .select()
  .single()
```

**Realtime Updates:**
```javascript
const subscription = supabase
  .channel('drivalia-jobs')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'drivalia_jobs' },
    (payload) => updateJobInList(payload.new)
  )
  .subscribe()
```

**Results Display:**
- Fetch from `drivalia_quotes` table when job completes
- Display in sortable/filterable table
- Download as Excel using `xlsx` library

## Implementation Phases

### Phase 1: Supabase Setup
- [ ] Create `.env` file with Supabase credentials
- [ ] Install `@supabase/supabase-js`
- [ ] Create `/src/lib/supabase.js`
- [ ] Test connection

### Phase 2: Database Migration
- [ ] Create `drivalia_jobs` table
- [ ] Create `drivalia_quotes` table
- [ ] Apply RLS policies
- [ ] Verify in Supabase dashboard

### Phase 3: VehicleSelector Component
- [ ] Create component file
- [ ] Implement cascading dropdowns
- [ ] Add vehicle list management
- [ ] Implement CSV upload
- [ ] Add validation

### Phase 4: Update DrivaliRobot
- [ ] Integrate VehicleSelector
- [ ] Replace HTTP API with Supabase
- [ ] Add Realtime subscriptions
- [ ] Update results display
- [ ] Add Excel download

### Phase 5: Testing & Polish
- [ ] Test dropdown behavior
- [ ] Test CSV upload
- [ ] Test job submission/tracking
- [ ] Test results display/download
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add toast notifications

## Success Criteria

- Users can select vehicles via cascading dropdowns
- Users can upload CSV files for bulk vehicle selection
- Jobs are tracked in Supabase with real-time updates
- Results display in table format
- Users can download results as Excel
- No regression in existing functionality

## Future Enhancements

- Full migration from PostgreSQL to Supabase
- Advanced filtering in vehicle selection
- Job scheduling/automation
- Email notifications on job completion
- Analytics dashboard for quote comparison
