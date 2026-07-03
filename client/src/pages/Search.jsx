import { useState } from 'react'
import Layout from '../components/Layout'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  FireIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const sampleData = [
  { id: 1, incident_number: 'INC-2026-001', incident_datetime: '2026-06-24T08:30:00', barangay: 'Triangulo', city: 'Naga City', province: 'Camarines Sur', structure_type: 'Residential', cause_of_fire: 'Electrical fault', estimated_damage: 250000, fatalities: 0, injuries: 2, case_status: 'closed' },
  { id: 2, incident_number: 'INC-2026-002', incident_datetime: '2026-06-23T14:15:00', barangay: 'Sagrada', city: 'Tabaco City', province: 'Albay', structure_type: 'Commercial', cause_of_fire: 'Arson', estimated_damage: 1200000, fatalities: 2, injuries: 5, case_status: 'investigating' },
  { id: 3, incident_number: 'INC-2026-003', incident_datetime: '2026-06-22T19:45:00', barangay: 'Rawis', city: 'Legazpi City', province: 'Albay', structure_type: 'Industrial', cause_of_fire: 'LPG leak', estimated_damage: 850000, fatalities: 1, injuries: 3, case_status: 'open' },
  { id: 4, incident_number: 'INC-2026-004', incident_datetime: '2026-06-21T11:00:00', barangay: 'San Nicolas', city: 'Iriga City', province: 'Camarines Sur', structure_type: 'Residential', cause_of_fire: 'Open flame', estimated_damage: 120000, fatalities: 0, injuries: 0, case_status: 'closed' },
  { id: 5, incident_number: 'INC-2026-005', incident_datetime: '2026-06-20T06:20:00', barangay: 'Dayangdang', city: 'Naga City', province: 'Camarines Sur', structure_type: 'Residential', cause_of_fire: 'Undetermined', estimated_damage: 75000, fatalities: 0, injuries: 1, case_status: 'open' },
  { id: 6, incident_number: 'INC-2026-006', incident_datetime: '2026-06-19T22:10:00', barangay: 'Balogo', city: 'Sorsogon City', province: 'Sorsogon', structure_type: 'Commercial', cause_of_fire: 'Electrical fault', estimated_damage: 500000, fatalities: 0, injuries: 0, case_status: 'closed' },
]

const provinces = [...new Set(sampleData.map(d => d.province))]
const causes = [...new Set(sampleData.map(d => d.cause_of_fire))]
const structures = [...new Set(sampleData.map(d => d.structure_type))]

const statusStyle = {
  open:          { label: 'Open',          color: '#2563EB', bg: '#EFF6FF' },
  closed:        { label: 'Closed',        color: '#D97706', bg: '#FFFBEB' },
  investigating: { label: 'Investigating', color: '#DC2626', bg: '#FEF2F2' },
}

const formatDate = (dt) => new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const formatMoney = (n) => '₱' + Number(n).toLocaleString()

export default function Search() {
  const [search, setSearch]         = useState('')
  const [province, setProvince]     = useState('')
  const [cause, setCause]           = useState('')
  const [structure, setStructure]   = useState('')
  const [status, setStatus]         = useState('')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults]       = useState([])

  const activeFilters = [province, cause, structure, status, dateFrom, dateTo].filter(Boolean).length

  const handleSearch = () => {
    setHasSearched(true)
    const filtered = sampleData.filter(inc => {
      const matchSearch = !search ||
        inc.incident_number.toLowerCase().includes(search.toLowerCase()) ||
        inc.city.toLowerCase().includes(search.toLowerCase()) ||
        inc.barangay.toLowerCase().includes(search.toLowerCase()) ||
        inc.cause_of_fire.toLowerCase().includes(search.toLowerCase())
      const matchProvince  = !province  || inc.province === province
      const matchCause     = !cause     || inc.cause_of_fire === cause
      const matchStructure = !structure || inc.structure_type === structure
      const matchStatus    = !status    || inc.case_status === status
      const matchFrom      = !dateFrom  || new Date(inc.incident_datetime) >= new Date(dateFrom)
      const matchTo        = !dateTo    || new Date(inc.incident_datetime) <= new Date(dateTo)
      return matchSearch && matchProvince && matchCause && matchStructure && matchStatus && matchFrom && matchTo
    })
    setResults(filtered)
  }

  const handleClear = () => {
    setSearch(''); setProvince(''); setCause('')
    setStructure(''); setStatus(''); setDateFrom(''); setDateTo('')
    setHasSearched(false); setResults([])
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 10px', fontSize: 12,
    color: '#1C1917', border: '0.5px solid #E7E3DF',
    borderRadius: 8, backgroundColor: '#FAFAF9', outline: 'none',
  }

  const labelStyle = {
    fontSize: 11, fontWeight: 500,
    color: '#78716C', display: 'block', marginBottom: 4,
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Search & Filter</h1>
        <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
          Search and filter fire incident records with precision
        </p>
      </div>

      {/* Filter panel */}
      <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, padding: 20, marginBottom: 16 }}>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <MagnifyingGlassIcon style={{
            width: 15, height: 15, color: '#C4BFB9',
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          }} />
          <input
            type="text"
            placeholder="Search by incident number, city, barangay, or cause..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{
              ...inputStyle,
              paddingLeft: 36, fontSize: 13,
              padding: '10px 12px 10px 36px',
            }}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Province</label>
            <select value={province} onChange={e => setProvince(e.target.value)} style={inputStyle}>
              <option value="">All provinces</option>
              {provinces.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cause of fire</label>
            <select value={cause} onChange={e => setCause(e.target.value)} style={inputStyle}>
              <option value="">All causes</option>
              {causes.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Structure type</label>
            <select value={structure} onChange={e => setStructure(e.target.value)} style={inputStyle}>
              <option value="">All types</option>
              {structures.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="investigating">Investigating</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date from</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Date to</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeFilters > 0 && (
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 20,
                backgroundColor: '#FFF1EB', color: '#EA580C',
                border: '0.5px solid #FCD9C4',
              }}>
                {activeFilters} filter{activeFilters > 1 ? 's' : ''} active
              </span>
            )}
            {(hasSearched || activeFilters > 0) && (
              <button onClick={handleClear} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 12, color: '#A8A29E',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                <XMarkIcon style={{ width: 13, height: 13 }} />
                Clear all
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {hasSearched && results.length > 0 && (
              <button style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', fontSize: 12, fontWeight: 500,
                border: '0.5px solid #E7E3DF', borderRadius: 8,
                backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
              }}>
                <ArrowDownTrayIcon style={{ width: 14, height: 14 }} />
                Export results
              </button>
            )}
            <button
              onClick={handleSearch}
              className="btn-orange"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', fontSize: 13, fontWeight: 500,
                backgroundColor: '#EA580C', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <MagnifyingGlassIcon style={{ width: 14, height: 14 }} />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {!hasSearched ? (
        <div style={{
          backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
          borderRadius: 12, padding: '60px 20px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            backgroundColor: '#FFF1EB', border: '0.5px solid #FCD9C4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <FunnelIcon style={{ width: 26, height: 26, color: '#EA580C' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1917', margin: '0 0 4px' }}>
            Set your filters and search
          </p>
          <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>
            Use the filters above to find specific fire incident records
          </p>
        </div>
      ) : results.length === 0 ? (
        <div style={{
          backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
          borderRadius: 12, padding: '60px 20px', textAlign: 'center',
        }}>
          <FireIcon style={{ width: 32, height: 32, color: '#F0D5C8', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1917', margin: '0 0 4px' }}>No results found</p>
          <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, overflow: 'hidden' }}>

          {/* Results header */}
          <div style={{
            padding: '12px 16px', borderBottom: '0.5px solid #F0EDE9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            backgroundColor: '#FAFAF9',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>
              {results.length} result{results.length > 1 ? 's' : ''} found
            </span>
            <span style={{ fontSize: 12, color: '#A8A29E' }}>
              Total damage: {formatMoney(results.reduce((a, b) => a + b.estimated_damage, 0))}
            </span>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 1fr 120px 110px 90px 80px',
            padding: '10px 16px',
            borderBottom: '0.5px solid #F0EDE9',
          }}>
            {['Incident #', 'Location', 'Cause', 'Structure', 'Damage', 'Status', 'Date'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 500, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {results.map((inc, i) => {
            const st = statusStyle[inc.case_status]
            return (
              <div key={inc.id} className="row-hover" style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 1fr 120px 110px 90px 80px',
                padding: '12px 16px', alignItems: 'center',
                borderBottom: i < results.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#EA580C' }}>{inc.incident_number}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>{inc.barangay}, {inc.city}</div>
                  <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 1 }}>{inc.province}</div>
                </div>
                <span style={{ fontSize: 12, color: '#57534E' }}>{inc.cause_of_fire}</span>
                <span style={{ fontSize: 12, color: '#57534E' }}>{inc.structure_type}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1917' }}>{formatMoney(inc.estimated_damage)}</span>
                <span className="badge-pop" style={{
                  fontSize: 11, fontWeight: 500,
                  padding: '3px 10px', borderRadius: 20,
                  backgroundColor: st.bg, color: st.color,
                  display: 'inline-block',
                }}>
                  {st.label}
                </span>
                <span style={{ fontSize: 11, color: '#A8A29E' }}>{formatDate(inc.incident_datetime)}</span>
              </div>
            )
          })}

          {/* Footer summary */}
          <div style={{
            padding: '12px 16px', borderTop: '0.5px solid #F0EDE9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Total fatalities', value: results.reduce((a, b) => a + b.fatalities, 0) },
                { label: 'Total injuries', value: results.reduce((a, b) => a + b.injuries, 0) },
                { label: 'Open cases', value: results.filter(r => r.case_status === 'open').length },
              ].map(item => (
                <div key={item.label} style={{ fontSize: 12 }}>
                  <span style={{ color: '#A8A29E' }}>{item.label}: </span>
                  <span style={{ fontWeight: 500, color: '#1C1917' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', fontSize: 12, fontWeight: 500,
              border: '0.5px solid #E7E3DF', borderRadius: 8,
              backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
            }}>
              <ArrowDownTrayIcon style={{ width: 13, height: 13 }} />
              Export to Excel
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}