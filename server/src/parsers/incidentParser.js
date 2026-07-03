import xlsx from 'xlsx'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

// ─── HELPERS ────────────────────────────────────────────────────────────────

const clean = (v) => v?.toString().trim() || ''

const toNum = (v) => {
  const n = parseFloat(clean(v).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

// Some cells (e.g. RESPONSE TIME) contain MULTIPLE values stacked in one cell,
// e.g. "6MINS\n20MINS\n13MINS" for multi-alarm fires with several units.
// toNum() would concatenate all the digits into one huge garbage number
// (e.g. 620136). We only want the first reported time (first unit on scene).
const toFirstNum = (v) => {
  const s = clean(v)
  const match = s.match(/\d+(\.\d+)?/)
  return match ? parseFloat(match[0]) : null
}

const toDate = (v) => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

const normalizeStatus = (v) => {
  const s = clean(v).toLowerCase()
  if (s.includes('close')) return 'closed'
  if (s.includes('invest')) return 'investigating'
  return 'open'
}

const extractCityFromAddress = (address) => {
  if (!address) return null
  const cities = [
    'Manila', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela',
    'Pasay', 'Makati', 'Paranaque', 'Parañaque', 'Las Pinas', 'Las Piñas', 'Muntinlupa',
    'Marikina', 'Pasig', 'Pateros', 'Taguig', 'Mandaluyong',
    'San Juan', 'Quezon City', 'Naga', 'Legazpi', 'Tabaco',
    'Iriga', 'Sorsogon',
  ]
  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) return city
  }
  return null
}

// The workbook's title block (top ~15 rows of the FIRST populated sheet-ish
// area) usually names the region, e.g. "NATIONAL CAPITAL REGION" or
// "BICOL REGION" / "REGION V". We detect it instead of hardcoding 'NCR', so
// files from other regions aren't silently mislabeled. If nothing matches,
// we return null and let the caller fall back to the uploader's own region
// (files.controller.js already does `region: inc.region || req.user.region`).
const REGION_ALIASES = [
  { match: /NATIONAL CAPITAL REGION/i, code: 'NCR' },
  { match: /BICOL REGION|REGION\s*V\b/i, code: 'REGION V' },
  { match: /REGION\s*I\b|ILOCOS REGION/i, code: 'REGION I' },
  { match: /REGION\s*II\b|CAGAYAN VALLEY/i, code: 'REGION II' },
  { match: /REGION\s*III\b|CENTRAL LUZON/i, code: 'REGION III' },
  { match: /REGION\s*IV-A|CALABARZON/i, code: 'REGION IV-A' },
  { match: /REGION\s*IV-B|MIMAROPA/i, code: 'REGION IV-B' },
  { match: /REGION\s*VI\b|WESTERN VISAYAS/i, code: 'REGION VI' },
  { match: /REGION\s*VII\b|CENTRAL VISAYAS/i, code: 'REGION VII' },
  { match: /REGION\s*VIII\b|EASTERN VISAYAS/i, code: 'REGION VIII' },
  { match: /REGION\s*IX\b|ZAMBOANGA PENINSULA/i, code: 'REGION IX' },
  { match: /REGION\s*X\b|NORTHERN MINDANAO/i, code: 'REGION X' },
  { match: /REGION\s*XI\b|DAVAO REGION/i, code: 'REGION XI' },
  { match: /REGION\s*XII\b|SOCCSKSARGEN/i, code: 'REGION XII' },
  { match: /REGION\s*XIII\b|CARAGA/i, code: 'REGION XIII' },
  { match: /CORDILLERA|\bCAR\b/i, code: 'CAR' },
  { match: /BANGSAMORO|\bBARMM\b/i, code: 'BARMM' },
]

const detectRegion = (sheet) => {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', header: 1 })
  const text = rows.slice(0, 15).flat().map(c => clean(c)).join(' | ')
  for (const { match, code } of REGION_ALIASES) {
    if (match.test(text)) return code
  }
  return null
}

// Sheets like "Format" are blank templates shipped inside these workbooks
// (every BFP office copies the same template into a new tab per month).
// They contain headers and city labels but no real rows, and must never be
// parsed as if they were a month of data.
const isTemplateSheet = (name) => {
  const n = name.trim().toLowerCase()
  return n === 'format' || n === '2 fire incident' || n === 'conso fire incident'
}

// ─── PARSER 1: Consolidated Fire Incident Report (PER-INCIDENT DETAIL) ──────
// NCR_2025_Conso_Fire_Incident_Report.xlsx — one tab per month (Jan'25 … Dec'25)
// Columns: STATION | DATE OF RESPONSE | EXACT LOCATION | RESPONDING UNIT |
//          TIME RECEIVED | TIME DISPATCHED | TIME OF ARRIVAL | RESPONSE TIME |
//          DISTANCE | ALARM STATUS | TIME/DATE LAST ALARM | TYPE OF OCCUPANCY |
//          CASUALTIES (INJURED CIV, INJURED BFP, DEATH CIV, DEATH BFP) | REMARKS
//
// NOTE: the header for the casualty columns is a *merged* 3-row header
// ("CASUALTIES" / "INJURED | DEATH" / "CIVILIAN | BFP | CIVILIAN | BFP").
// The old parser looked for the words "INJURED"/"DEATH" on the same row as
// "STATION"/"DATE" and never found them (they're one row below), so every
// casualty count silently came back as 0. We instead locate the casualty
// columns positionally, right after TYPE OF OCCUPANCY, which is reliable
// because this is BFP's standard RA 9514 form layout.
//
// Also: each monthly sheet ends with a "GRAND TOTAL" / "NNN FIRE INCIDENTS"
// row that has no date but DOES have a location-like value and casualty
// totals in the same columns as real rows — the old parser picked this up
// as one extra fake "incident" carrying the whole month's totals. Requiring
// a real DATE OF RESPONSE fixes this.

const parseConsolidatedIncidentReport = (sheet, region) => {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', header: 1 })
  const incidents = []
  let headerRowIndex = -1
  let stationCol, dateCol, locationCol, responseTimeCol,
      occupancyCol, remarksCol

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(c => clean(c).toUpperCase())
    if (row.some(c => c === 'STATION') && row.some(c => c.includes('DATE OF RESPONSE'))) {
      headerRowIndex = i
      stationCol      = row.findIndex(c => c === 'STATION')
      dateCol         = row.findIndex(c => c.includes('DATE OF RESPONSE'))
      locationCol     = row.findIndex(c => c.includes('LOCATION') || c.includes('ADDRESS'))
      responseTimeCol = row.findIndex(c => c.includes('RESPONSE TIME'))
      occupancyCol    = row.findIndex(c => c.includes('TYPE OF OCCUPANCY'))
      remarksCol      = row.findIndex(c => c === 'REMARKS')
      break
    }
  }

  if (headerRowIndex === -1) return []

  // Casualty columns sit immediately after TYPE OF OCCUPANCY:
  // occupancyCol+1 = INJURED CIVILIAN, +2 = INJURED BFP,
  // occupancyCol+3 = DEATH CIVILIAN,   +4 = DEATH BFP
  const injuredCivCol = occupancyCol > -1 ? occupancyCol + 1 : -1
  const injuredBfpCol = occupancyCol > -1 ? occupancyCol + 2 : -1
  const deathCivCol   = occupancyCol > -1 ? occupancyCol + 3 : -1
  const deathBfpCol   = occupancyCol > -1 ? occupancyCol + 4 : -1

  let currentStation = ''
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every(c => !clean(c))) continue

    const stationVal = clean(row[stationCol] || '')
    const dateVal    = clean(row[dateCol] || '')
    const location   = clean(row[locationCol] || '')

    if (stationVal.toUpperCase().includes('PREPARED BY')) break
    if (stationVal.toUpperCase().includes('NOTED BY')) break

    // Rows without stationVal/date/location are city/district group labels
    // ("FIRE DISTRICT I", "MANILA") — track them, don't emit an incident.
    if (stationVal && !dateVal && !location) {
      currentStation = stationVal
      continue
    }

    // A real incident row ALWAYS has a DATE OF RESPONSE. This also filters
    // out the "GRAND TOTAL" / "NNN FIRE INCIDENTS" summary row at the
    // bottom of every sheet, which has no date but does have text in the
    // location column.
    if (!dateVal) continue

    const city = extractCityFromAddress(location) || currentStation || null

    incidents.push({
      station_responded:  stationVal || currentStation || null,
      incident_datetime:  toDate(dateVal),
      barangay:           null,
      city:               city,
      province:           region,
      region:             region,
      structure_type:     clean(row[occupancyCol] || '') || null,
      cause_of_fire:      remarksCol > -1 ? (clean(row[remarksCol] || '') || null) : null,
      estimated_damage:   0, // this form does not capture a peso damage figure
      injuries:           toNum(row[injuredCivCol]) + toNum(row[injuredBfpCol]),
      fatalities:         toNum(row[deathCivCol]) + toNum(row[deathBfpCol]),
      rescued:            0,
      response_time_min:  toFirstNum(row[responseTimeCol]),
      case_status:        'open',
    })
  }

  return incidents
}

// ─── PARSER 2: Recap of Fire Incidents (MONTHLY TOTAL PER CITY) ─────────────
// Recap_of_Fire_Incidents_2025.xlsx
// Columns: CITY | TOTAL FIRE CALLS | TOTAL FIRE CALLS RESPONDED | ... | TOTAL
//
// This file reports the SAME incidents as the Consolidated report, just
// pre-aggregated to one row per city per month (verified: e.g. Jan'25
// Manila's monthly total here matches the count of individual Manila rows
// in the Consolidated file for the same month). Treating each city-row as
// one "incident" (as the old parser did) massively undercounts real
// incidents and, when combined with the Consolidated file's real per-
// incident rows, corrupts the dashboard's totals. We return these as
// aggregate SUMMARY rows, not individual incidents.

const parseRecapFireIncidents = (sheet, reportLabel, region) => {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', header: 1 })
  const summary = []
  let headerRowIndex = -1
  let totalCol

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(c => clean(c).toUpperCase())
    if (row.some(c => c.includes('TOTAL FIRE CALLS RESPONDED'))) {
      headerRowIndex = i
      totalCol = row.findIndex(c => c.includes('TOTAL FIRE CALLS RESPONDED'))
      break
    }
  }
  if (headerRowIndex === -1) return []

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    const city = clean(row[0])
    if (!city) continue
    if (city.toUpperCase().includes('FIRE DISTRICT')) continue
    if (city.toUpperCase().includes('TOTAL')) continue

    const totalResponded = toNum(row[totalCol])

    summary.push({
      source: 'recap',
      period_label: reportLabel,
      city,
      province: region,
      region: region,
      total_calls_responded: totalResponded,
    })
  }

  return summary
}

// ─── PARSER 3: Monthly Fire Incident Report (NCR-WIDE MONTHLY TOTAL) ────────
// NCR_FIRE-INCIDENT-REPORT-2025.xlsx
// Columns: REGION | RESPONDED | NOT RESPONDED | TOTAL | <occupancy breakdown> |
//          TOTAL | Casualties (Civilian/BFP Injured, Civilian/BFP Death) |
//          TOTAL | REMARKS
//
// The old parser tried to find the casualty columns using `row.length - 5`
// / `row.length - 3`, i.e. counting backward from the END of the row array.
// That only works if every row happens to have exactly the same trailing
// cell layout, which it doesn't (the REMARKS text varies in length/format),
// so it was reading essentially random columns — this is the main source
// of the wildly wrong fatality numbers on the dashboard.
//
// The casualty block is reliably the 5 columns immediately BEFORE REMARKS
// (Injured-Civilian, Injured-BFP, Death-Civilian, Death-BFP, Casualty-Total),
// so we anchor off the REMARKS column instead, which is stable.
//
// Like the Recap file, this is also just the Consolidated file's numbers
// rolled up to one row per month for the whole region, so it's returned as
// a SUMMARY row, not an individual incident.

const parseMonthlyFireIncidentReport = (sheet, reportLabel) => {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', header: 1 })
  const summary = []

  let headerRowIndex = -1
  let remarksCol
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(c => clean(c).toUpperCase())
    if (row.some(c => c === 'REMARKS')) {
      headerRowIndex = i
      remarksCol = row.findIndex(c => c === 'REMARKS')
      break
    }
  }
  if (headerRowIndex === -1 || remarksCol < 5) return []

  const respondedCol = 1
  const notRespondedCol = 2
  const injuredCivCol = remarksCol - 5
  const injuredBfpCol = remarksCol - 4
  const deathCivCol   = remarksCol - 3
  const deathBfpCol   = remarksCol - 2

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    const region = clean(row[0]).toUpperCase()
    if (!region) continue
    if (region.includes('PREPARED BY')) break

    const responded = toNum(row[respondedCol])
    if (responded <= 0) continue // skip blank "Format" template rows

    summary.push({
      source: 'monthly_report',
      period_label: reportLabel,
      region,
      province: null,
      responded,
      not_responded: toNum(row[notRespondedCol]),
      injuries: toNum(row[injuredCivCol]) + toNum(row[injuredBfpCol]),
      fatalities: toNum(row[deathCivCol]) + toNum(row[deathBfpCol]),
    })
  }

  return summary
}

// ─── SMART FILE DETECTOR ─────────────────────────────────────────────────────

const detectSheetType = (sheet) => {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', header: 1 })
  const allText = rows.slice(0, 15).flat().map(c => clean(c).toUpperCase()).join(' ')

  if (allText.includes('EXACT LOCATION') || allText.includes('DATE OF RESPONSE')) {
    return 'consolidated_incident'
  }
  if (allText.includes('TOTAL FIRE CALLS') && allText.includes('RESIDENTIAL')) {
    return 'recap_incidents'
  }
  if (allText.includes('MONTHLY FIRE INCIDENT REPORT') || allText.includes('NOT RESPONDED')) {
    return 'monthly_report'
  }
  return 'unknown'
}

// Pull a human-readable period label ("January 2025") out of a sheet's
// title rows, falling back to the sheet's tab name.
const detectPeriodLabel = (sheet, sheetName) => {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', header: 1 })
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const text = rows[i].join(' ')
    const match = text.match(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{4})/i)
    if (match) return `${match[1][0].toUpperCase()}${match[1].slice(1).toLowerCase()} ${match[2]}`
  }
  return sheetName.trim()
}

// ─── MAIN EXCEL PARSER ───────────────────────────────────────────────────────
// Returns { incidents, summary } — `incidents` are real per-incident rows
// safe to insert into the incidents table; `summary` are monthly/city
// roll-up rows meant for cross-checking totals, NOT for insertion as if
// they were individual incidents.

export const parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true })
  const allIncidents = []
  const allSummary = []

  for (const sheetName of workbook.SheetNames) {
    if (isTemplateSheet(sheetName)) continue

    const sheet = workbook.Sheets[sheetName]
    const type  = detectSheetType(sheet)
    const periodLabel = detectPeriodLabel(sheet, sheetName)
    const region = detectRegion(sheet)

    if (type === 'consolidated_incident') {
      allIncidents.push(...parseConsolidatedIncidentReport(sheet, region))
    } else if (type === 'recap_incidents') {
      allSummary.push(...parseRecapFireIncidents(sheet, periodLabel, region))
    } else if (type === 'monthly_report') {
      allSummary.push(...parseMonthlyFireIncidentReport(sheet, periodLabel))
    } else {
      allIncidents.push(...parseGeneric(sheet))
    }
  }

  return {
    incidents: allIncidents.filter(inc => inc && Object.keys(inc).length > 0),
    summary: allSummary,
  }
}

// ─── GENERIC FALLBACK PARSER ─────────────────────────────────────────────────

const fieldMap = {
  'city': 'city', 'city/ municipality': 'city', 'city/municipality': 'city',
  'municipality': 'city', 'district/ city/ municipality': 'city',
  'station': 'station_responded', 'fire station': 'station_responded',
  'date': 'incident_datetime', 'date of incident': 'incident_datetime',
  'cause': 'cause_of_fire', 'cause of fire': 'cause_of_fire',
  'structure type': 'structure_type', 'type of occupancy': 'structure_type',
  'damage': 'estimated_damage', 'estimated damage': 'estimated_damage',
  'fatalities': 'fatalities', 'deaths': 'fatalities', 'death': 'fatalities',
  'injuries': 'injuries', 'injured': 'injuries',
  'response time': 'response_time_min',
  'barangay': 'barangay', 'brgy': 'barangay',
  'province': 'province', 'region': 'region',
  'status': 'case_status',
}

const parseGeneric = (sheet) => {
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' })
  return rows.map(row => {
    const inc = {}
    Object.entries(row).forEach(([key, value]) => {
      const k = key.toLowerCase().trim()
      const mapped = fieldMap[k]
      if (mapped && value !== '') {
        if (['estimated_damage', 'fatalities', 'injuries', 'rescued', 'units_deployed'].includes(mapped)) {
          inc[mapped] = toNum(value)
        } else if (mapped === 'response_time_min') {
          inc[mapped] = toFirstNum(value)
        } else if (mapped === 'incident_datetime') {
          inc[mapped] = toDate(value)
        } else if (mapped === 'case_status') {
          inc[mapped] = normalizeStatus(value)
        } else {
          inc[mapped] = clean(value)
        }
      }
    })
    return inc
  }).filter(inc => Object.keys(inc).length > 2)
}

export const parseCSV = (buffer) => parseExcel(buffer)

export const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer)
    const lines = data.text.split('\n').map(l => l.trim()).filter(Boolean)
    const incidents = []
    let current = {}

    lines.forEach(line => {
      const lower = line.toLowerCase()
      Object.entries(fieldMap).forEach(([pattern, field]) => {
        if (lower.startsWith(pattern + ':')) {
          const value = line.split(':').slice(1).join(':').trim()
          if (value) {
            if (['estimated_damage', 'fatalities', 'injuries'].includes(field)) {
              current[field] = toNum(value)
            } else if (field === 'incident_datetime') {
              current[field] = toDate(value)
            } else {
              current[field] = value
            }
          }
        }
      })
      if (lower.includes('incident') && Object.keys(current).length > 2) {
        incidents.push({ ...current })
        current = {}
      }
    })

    if (Object.keys(current).length > 2) incidents.push(current)
    return { incidents, summary: [] }
  } catch {
    return { incidents: [], summary: [] }
  }
}

// Always returns { incidents, summary }
export const parseFile = async (buffer, fileType) => {
  switch (fileType) {
    case 'excel': return parseExcel(buffer)
    case 'csv':   return parseCSV(buffer)
    case 'pdf':   return await parsePDF(buffer)
    default:      return { incidents: [], summary: [] }
  }
}