import { useState } from 'react'
import Layout from '../components/Layout'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  FireIcon,
} from '@heroicons/react/24/outline'

const sampleIncidents = [
  { id: 1, incident_number: 'INC-2026-001', incident_datetime: '2026-06-24T08:30:00', city: 'Naga City', province: 'Camarines Sur', barangay: 'Triangulo', structure_type: 'Residential', cause_of_fire: 'Electrical fault', estimated_damage: 250000, fatalities: 0, injuries: 2, case_status: 'closed' },
  { id: 2, incident_number: 'INC-2026-002', incident_datetime: '2026-06-23T14:15:00', city: 'Tabaco City', province: 'Albay', barangay: 'Sagrada', structure_type: 'Commercial', cause_of_fire: 'Arson', estimated_damage: 1200000, fatalities: 2, injuries: 5, case_status: 'investigating' },
  { id: 3, incident_number: 'INC-2026-003', incident_datetime: '2026-06-22T19:45:00', city: 'Legazpi City', province: 'Albay', barangay: 'Rawis', structure_type: 'Industrial', cause_of_fire: 'LPG leak', estimated_damage: 850000, fatalities: 1, injuries: 3, case_status: 'open' },
  { id: 4, incident_number: 'INC-2026-004', incident_datetime: '2026-06-21T11:00:00', city: 'Iriga City', province: 'Camarines Sur', barangay: 'San Nicolas', structure_type: 'Residential', cause_of_fire: 'Open flame', estimated_damage: 120000, fatalities: 0, injuries: 0, case_status: 'closed' },
  { id: 5, incident_number: 'INC-2026-005', incident_datetime: '2026-06-20T06:20:00', city: 'Naga City', province: 'Camarines Sur', barangay: 'Dayangdang', structure_type: 'Residential', cause_of_fire: 'Undetermined', estimated_damage: 75000, fatalities: 0, injuries: 1, case_status: 'open' },
  { id: 6, incident_number: 'INC-2026-006', incident_datetime: '2026-06-19T22:10:00', city: 'Sorsogon City', province: 'Sorsogon', barangay: 'Balogo', structure_type: 'Commercial', cause_of_fire: 'Electrical fault', estimated_damage: 500000, fatalities: 0, injuries: 0, case_status: 'closed' },
]

const statusStyle = {
  open:          { label: 'Open',          color: '#2563EB', bg: '#EFF6FF' },
  closed:        { label: 'Closed',        color: '#D97706', bg: '#FFFBEB' },
  investigating: { label: 'Investigating', color: '#DC2626', bg: '#FEF2F2' },
}

const formatDate = (dt) => new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
const formatMoney = (n) => '₱' + Number(n).toLocaleString()

export default function Incidents() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = sampleIncidents.filter(inc => {
    const matchSearch =
      inc.incident_number.toLowerCase().includes(search.toLowerCase()) ||
      inc.city.toLowerCase().includes(search.toLowerCase()) ||
      inc.cause_of_fire.toLowerCase().includes(search.toLowerCase()) ||
      inc.barangay.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || inc.case_status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Incidents</h1>
          <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
            All recorded fire incidents
          </p>
        </div>
        <button
          className="btn-orange"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            backgroundColor: '#EA580C', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <PlusIcon style={{ width: 15, height: 15 }} />
          Add Incident
        </button>
      </div>

      {/* Search + Filter bar */}
      <div style={{
        backgroundColor: '#fff',
        border: '0.5px solid #F0EDE9',
        borderRadius: 12,
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Search input */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <MagnifyingGlassIcon style={{
            width: 15, height: 15, color: '#C4BFB9',
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          }} />
          <input
            type="text"
            placeholder="Search by location, cause, incident number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px 8px 32px',
              fontSize: 13, color: '#1C1917',
              border: '0.5px solid #E7E3DF',
              borderRadius: 8, outline: 'none',
              backgroundColor: '#FAFAF9',
            }}
          />
        </div>

        {/* Status filter */}
        {['all', 'open', 'closed', 'investigating'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 500,
              borderRadius: 8, cursor: 'pointer',
              border: statusFilter === s ? 'none' : '0.5px solid #E7E3DF',
              backgroundColor: statusFilter === s ? '#EA580C' : '#fff',
              color: statusFilter === s ? '#fff' : '#78716C',
              transition: 'all 0.15s ease',
              textTransform: 'capitalize',
            }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', fontSize: 12, fontWeight: 500,
            borderRadius: 8, cursor: 'pointer',
            border: '0.5px solid #E7E3DF',
            backgroundColor: showFilters ? '#FFF1EB' : '#fff',
            color: showFilters ? '#EA580C' : '#78716C',
          }}
        >
          <FunnelIcon style={{ width: 14, height: 14 }} />
          Filters
        </button>
      </div>

      {/* Extra filters */}
      {showFilters && (
        <div style={{
          backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
          borderRadius: 12, padding: '16px', marginBottom: 16,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {[
            { label: 'Province', placeholder: 'All provinces' },
            { label: 'City / Municipality', placeholder: 'All cities' },
            { label: 'Structure type', placeholder: 'All types' },
            { label: 'Cause of fire', placeholder: 'All causes' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#78716C', display: 'block', marginBottom: 4 }}>
                {f.label}
              </label>
              <select style={{
                width: '100%', padding: '7px 10px',
                fontSize: 12, color: '#1C1917',
                border: '0.5px solid #E7E3DF', borderRadius: 8,
                backgroundColor: '#FAFAF9', outline: 'none',
              }}>
                <option>{f.placeholder}</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 1fr 120px 100px 100px 90px 90px',
          padding: '10px 16px',
          borderBottom: '0.5px solid #F0EDE9',
          backgroundColor: '#FAFAF9',
        }}>
          {['Incident #', 'Location', 'Cause', 'Structure', 'Damage', 'Casualties', 'Status', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 500, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <FireIcon style={{ width: 32, height: 32, color: '#F0D5C8', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>No incidents found</p>
          </div>
        ) : (
          filtered.map((inc, i) => {
            const st = statusStyle[inc.case_status]
            return (
              <div key={inc.id} className="row-hover" style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 1fr 120px 100px 100px 90px 90px',
                padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#EA580C' }}>
                  {inc.incident_number}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>
                    {inc.barangay}, {inc.city}
                  </div>
                  <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 1 }}>
                    {inc.province} · {formatDate(inc.incident_datetime)}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#57534E' }}>{inc.cause_of_fire}</span>
                <span style={{ fontSize: 12, color: '#57534E' }}>{inc.structure_type}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1917' }}>
                  {formatMoney(inc.estimated_damage)}
                </span>
                <div>
                  {inc.fatalities > 0 && (
                    <span style={{ fontSize: 11, color: '#DC2626', display: 'block' }}>
                      {inc.fatalities} fatalities
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: '#A8A29E' }}>
                    {inc.injuries} injured
                  </span>
                </div>
                <span className="badge-pop" style={{
                  fontSize: 11, fontWeight: 500,
                  padding: '3px 10px', borderRadius: 20,
                  backgroundColor: st.bg, color: st.color,
                  display: 'inline-block',
                }}>
                  {st.label}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button title="View" style={{
                    background: 'none', border: '0.5px solid #E7E3DF',
                    borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#78716C',
                  }}>
                    <EyeIcon style={{ width: 14, height: 14 }} />
                  </button>
                  <button title="Edit" style={{
                    background: 'none', border: '0.5px solid #E7E3DF',
                    borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#78716C',
                  }}>
                    <PencilSquareIcon style={{ width: 14, height: 14 }} />
                  </button>
                  <button title="Delete" style={{
                    background: 'none', border: '0.5px solid #FCD9C4',
                    borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#EA580C',
                  }}>
                    <TrashIcon style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '0.5px solid #F0EDE9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#A8A29E' }}>
            Showing {filtered.length} of {sampleIncidents.length} incidents
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Previous', 'Next'].map(label => (
              <button key={label} style={{
                padding: '5px 12px', fontSize: 12,
                border: '0.5px solid #E7E3DF', borderRadius: 6,
                backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}