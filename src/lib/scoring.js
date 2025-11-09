// Utility scoring used in Results and Best Deals modal

const parseNumeric = (value) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  if (!value || value.trim() === '') return 0
  const cleaned = value.toString().replace(/[£$€,\s%]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export const computeScoreBreakdown = (vehicle) => {
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

  // Component scores (mirrors UploadPage)
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

  let adjustedMpg = mpg
  const fuelType = (vehicle.fuel_type || '').toString().toLowerCase()
  const isHybrid = fuelType.includes('hybrid') || fuelType.includes('plugin') || fuelType.includes('phev')
  if (isHybrid && mpg > 100) {
    if (co2 > 0 && co2 < 50) adjustedMpg = Math.min(75, 55 + (50 - co2))
    else adjustedMpg = Math.min(65, mpg * 0.25)
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
    inputs: { monthly: monthly || 0, term, mileage, p11d: p11d || 0, otr: otr || 0, mpg: mpg || 0, adjustedMpg: isHybrid && mpg > 100 ? adjustedMpg : null, co2: co2 || 0, insuranceGroup: insuranceGroup || null, defaultsApplied: { term: usedDefaultTerm, mileage: usedDefaultMileage } },
    derived: { totalLeaseCost: Math.round(totalLeaseCost * 100) / 100, totalCostVsP11DPercent: Math.round(totalCostVsValue * 10) / 10, costPerMile: Math.round(costPerMile * 100) / 100 },
    components: { costEfficiencyScore, mileageScore, fuelScore, emissionsScore, operatingCostScore, evRangeScore, insuranceScore },
    weights
  }
}

// DB-aligned scoring (matches insert_lease_offer in queries.sql)
// v_deal_score := 100 - (((total_cost / p11d) * 100 - 30) * 2), clamped 0..100
export const computeDbScoreBreakdown = (vehicle) => {
  const monthly = parseNumeric(vehicle.monthly_rental)
  const term = Number(vehicle.term || vehicle.term_months || 0) || 0
  const upfront = parseNumeric(vehicle.upfront || vehicle.upfront_payment || 0)
  const p11d = parseNumeric(vehicle.p11d || vehicle.p11d_price)

  const totalLeaseCost = monthly * term + upfront
  let score
  let costVsValue = null
  if (p11d > 0) {
    costVsValue = (totalLeaseCost / p11d) * 100
    score = 100 - ((costVsValue - 30) * 2)
    if (score > 100) score = 100
    if (score < 0) score = 0
  } else {
    score = 75
  }
  // Round like UI
  const rounded = Math.round(score * 10) / 10
  return {
    score: rounded,
    inputs: {
      monthly,
      term,
      upfront,
      p11d,
    },
    derived: {
      totalLeaseCost: Math.round(totalLeaseCost * 100) / 100,
      totalCostVsP11DPercent: costVsValue != null ? Math.round(costVsValue * 10) / 10 : null,
    },
  }
}
