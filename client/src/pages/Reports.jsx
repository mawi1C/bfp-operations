import { useState } from 'react'
import Layout from '../components/Layout'
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  FunnelIcon,
  FireIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const reportTypes = [
  {
    id: 'monthly',
    label: 'Monthly Summary',
    desc: 'Incident count, casualties, damage cost per month',
    icon: CalendarDaysIcon,
    color: '#EA580C', bg: '#FFF1EB',
  },
  {
    id: 'annual',
    label: 'Annual Summary',
    desc: 'Full year overview with trends and comparisons',
    icon: ChartBarIcon,
    color: '#2563EB', bg: '#EFF6FF',
  },
  {
    id: 'cause',
    label: 'Cause Analysis',
    desc: 'Breakdown of fire causes and frequency',
    icon: FireIcon,
    color: '#DC2626', bg: '#FEF2F2',
  },
  {
    id: 'casualty',
    label: 'Casualty Report',
    desc: 'Fatalities, injuries, and rescued persons',
    icon: UserGroupIcon,
    color: '#D97706', bg: '#FFFBEB',
  },
  {
    id: 'damage',
    label: 'Damage Assessment',
    desc: 'Estimated property damage by location and type',
    icon: BuildingOfficeIcon,
    color: '#7C3AED', bg: '#F5F3FF',
  },
  {
    id: 'response',
    label: 'Response Time Report',
    desc: 'Average response time per station and region',
    icon: ClockIcon,
    color: '#16A34A', bg: '#F0FDF4',
  },
]

const monthlyData = [
  { month: 'January',  incidents: 182, fatalities: 4, injuries: 18, damage: 12400000 },
  { month: 'February', incidents: 145, fatalities: 2, injuries: 11, damage: 8700000  },
  { month: 'March',    incidents: 218, fatalities: 6, injuries: 24, damage: 15200000 },
  { month: 'April',    incidents: 133, fatalities: 1, injuries: 9,  damage: 6100000  },
  { month: 'May',      incidents: 169, fatalities: 3, injuries: 15, damage: 9800000  },
  { month: 'June',     incidents: 121, fatalities: 2, injuries: 8,  damage: 7100000  },
]

const causeData = [
  { cause: 'Electrical fault', count: 412, pct: 33 },
  { cause: 'Open flame',       count: 298, pct: 24 },
  { cause: 'Arson',            count: 187, pct: 15 },
  { cause: 'LPG leak',         count: 154, pct: 12 },
  { cause: 'Undetermined',     count: 197, pct: 16 },
]

const stationData = [
  { station: 'Naga City Station',     incidents: 248, avgResponse: 5.2 },
  { station: 'Legazpi City Station',  incidents: 196, avgResponse: 6.8 },
  { station: 'Tabaco Station',        incidents: 142, avgResponse: 7.1 },
  { station: 'Iriga City Station',    incidents: 118, avgResponse: 6.4 },
  { station: 'Sorsogon City Station', incidents: 104, avgResponse: 7.8 },
]

const formatMoney = (n) => '₱' + Number(n).toLocaleString()
const maxIncidents = Math.max(...monthlyData.map(d => d.incidents))

export default function Reports() {
  const [selectedType, setSelectedType] = useState(null)
  const [generated, setGenerated]       = useState(false)
  const [generating, setGenerating]     = useState(false)
  const [year, setYear]                 = useState('2026')
  const [region, setRegion]             = useState('Bicol Region')

  const handleGenerate = () => {
    if (!selectedType) return
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 1200)
  }

  const handleReset = () => {
    setSelectedType(null)
    setGenerated(false)
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Reports</h1>
        <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
          Generate and export standard BFP incident reports
        </p>
      </div>

      {!generated ? (
        <>
          {/* Report type selector */}
          <div style={{
            backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
            borderRadius: 12, padding: 20, marginBottom: 16,
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 14px' }}>
              Select report type
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {reportTypes.map(rt => (
                <div
                  key={rt.id}
                  onClick={() => setSelectedType(rt.id)}
                  className="panel-card"
                  style={{
                    border: selectedType === rt.id
                      ? `1.5px solid ${rt.color}`
                      : '0.5px solid #F0EDE9',
                    borderRadius: 10, padding: 14,
                    cursor: 'pointer',
                    backgroundColor: selectedType === rt.id ? rt.bg : '#fff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    backgroundColor: selectedType === rt.id ? '#fff' : rt.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <rt.icon style={{ width: 18, height: 18, color: rt.color }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', marginBottom: 3 }}>
                    {rt.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#A8A29E', lineHeight: 1.5 }}>
                    {rt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div style={{
            backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
            borderRadius: 12, padding: 20, marginBottom: 16,
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 14px' }}>
              Report parameters
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Year', value: year, onChange: setYear, options: ['2024', '2025', '2026'] },
                { label: 'Region', value: region, onChange: setRegion, options: ['Bicol Region', 'NCR', 'Region IV-A', 'Region V'] },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#78716C', display: 'block', marginBottom: 4 }}>
                    {f.label}
                  </label>
                  <select
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px',
                      fontSize: 12, color: '#1C1917',
                      border: '0.5px solid #E7E3DF', borderRadius: 8,
                      backgroundColor: '#FAFAF9', outline: 'none',
                    }}
                  >
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#78716C', display: 'block', marginBottom: 4 }}>
                  Date from
                </label>
                <input type="date" style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 10px', fontSize: 12,
                  color: '#1C1917', border: '0.5px solid #E7E3DF',
                  borderRadius: 8, backgroundColor: '#FAFAF9', outline: 'none',
                }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: '#78716C', display: 'block', marginBottom: 4 }}>
                  Date to
                </label>
                <input type="date" style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 10px', fontSize: 12,
                  color: '#1C1917', border: '0.5px solid #E7E3DF',
                  borderRadius: 8, backgroundColor: '#FAFAF9', outline: 'none',
                }} />
              </div>
            </div>
          </div>

          {/* Generate button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleGenerate}
              disabled={!selectedType || generating}
              className="btn-orange"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', fontSize: 13, fontWeight: 500,
                backgroundColor: !selectedType ? '#F0EDE9' : '#EA580C',
                color: !selectedType ? '#A8A29E' : '#fff',
                border: 'none', borderRadius: 8,
                cursor: !selectedType ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {generating ? (
                <>
                  <div style={{
                    width: 14, height: 14, border: '2px solid #fff',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Generating...
                </>
              ) : (
                <>
                  <ChartBarIcon style={{ width: 15, height: 15 }} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Generated report */}
          <div style={{
            backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
            borderRadius: 12, overflow: 'hidden', marginBottom: 16,
          }}>
            {/* Report header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '0.5px solid #F0EDE9',
              background: 'linear-gradient(135deg, #FFF8F4 0%, #fff 100%)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      backgroundColor: '#FFF1EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FireIcon style={{ width: 16, height: 16, color: '#EA580C' }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#EA580C', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Bureau of Fire Protection
                    </span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: '0 0 4px' }}>
                    {reportTypes.find(r => r.id === selectedType)?.label} — {year}
                  </h2>
                  <p style={{ fontSize: 12, color: '#A8A29E', margin: 0 }}>
                    {region} · Generated {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '7px 14px', fontSize: 12, fontWeight: 500,
                      border: '0.5px solid #E7E3DF', borderRadius: 8,
                      backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
                    }}
                  >
                    ← New report
                  </button>
                  <button
                    className="btn-orange"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 16px', fontSize: 12, fontWeight: 500,
                      backgroundColor: '#EA580C', color: '#fff',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    <DocumentArrowDownIcon style={{ width: 14, height: 14 }} />
                    Export PDF
                  </button>
                  <button
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 16px', fontSize: 12, fontWeight: 500,
                      border: '0.5px solid #E7E3DF', borderRadius: 8,
                      backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
                    }}
                  >
                    <DocumentArrowDownIcon style={{ width: 14, height: 14 }} />
                    Export Excel
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: 24 }}>

              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Total incidents', value: '968', icon: FireIcon, color: '#EA580C', bg: '#FFF1EB' },
                  { label: 'Total fatalities', value: '18', icon: UserGroupIcon, color: '#DC2626', bg: '#FEF2F2' },
                  { label: 'Total damage', value: '₱59.3M', icon: BuildingOfficeIcon, color: '#D97706', bg: '#FFFBEB' },
                  { label: 'Avg response', value: '6.4 min', icon: ClockIcon, color: '#2563EB', bg: '#EFF6FF' },
                ].map(card => (
                  <div key={card.label} className="stat-card" style={{
                    backgroundColor: '#FAFAF9', border: '0.5px solid #F0EDE9',
                    borderRadius: 10, padding: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <card.icon style={{ width: 14, height: 14, color: card.color }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#A8A29E' }}>{card.label}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: '#1C1917' }}>{card.value}</div>
                  </div>
                ))}
              </div>

              {/* Monthly breakdown */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 14px' }}>
                  Monthly breakdown
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FAFAF9' }}>
                        {['Month', 'Incidents', 'Fatalities', 'Injuries', 'Damage', 'Trend'].map(h => (
                          <th key={h} style={{
                            padding: '8px 12px', textAlign: 'left',
                            color: '#A8A29E', fontWeight: 500,
                            borderBottom: '0.5px solid #F0EDE9',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((row, i) => (
                        <tr key={row.month} className="row-hover">
                          <td style={{ padding: '10px 12px', color: '#1C1917', fontWeight: 500, borderBottom: '0.5px solid #F5F5F4' }}>
                            {row.month}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#EA580C', fontWeight: 500, borderBottom: '0.5px solid #F5F5F4' }}>
                            {row.incidents}
                          </td>
                          <td style={{ padding: '10px 12px', color: row.fatalities > 3 ? '#DC2626' : '#57534E', borderBottom: '0.5px solid #F5F5F4' }}>
                            {row.fatalities}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#57534E', borderBottom: '0.5px solid #F5F5F4' }}>
                            {row.injuries}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#57534E', borderBottom: '0.5px solid #F5F5F4' }}>
                            {formatMoney(row.damage)}
                          </td>
                          <td style={{ padding: '10px 12px', borderBottom: '0.5px solid #F5F5F4' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 80, height: 6, backgroundColor: '#FFF1EB', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  width: `${(row.incidents / maxIncidents) * 100}%`,
                                  backgroundColor: '#EA580C', borderRadius: 3,
                                }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: '#FFF8F4' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1C1917' }}>Total</td>
                        <td style={{ padding: '10px 12px', fontWeight: 500, color: '#EA580C' }}>
                          {monthlyData.reduce((a, b) => a + b.incidents, 0)}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 500, color: '#DC2626' }}>
                          {monthlyData.reduce((a, b) => a + b.fatalities, 0)}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 500, color: '#57534E' }}>
                          {monthlyData.reduce((a, b) => a + b.injuries, 0)}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 500, color: '#57534E' }}>
                          {formatMoney(monthlyData.reduce((a, b) => a + b.damage, 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Two columns — causes + stations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Top causes */}
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 14px' }}>
                    Top causes of fire
                  </h3>
                  {causeData.map((item, i) => (
                    <div key={item.cause} className="row-hover" style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 6px', borderRadius: 6,
                      borderBottom: i < causeData.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <span style={{ fontSize: 11, color: '#C4BFB9', width: 16 }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: '#57534E', marginBottom: 3 }}>{item.cause}</div>
                          <div style={{ height: 4, backgroundColor: '#F0EDE9', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${item.pct}%`,
                              backgroundColor: i < 2 ? '#DC2626' : i < 4 ? '#EA580C' : '#A8A29E',
                              borderRadius: 2,
                            }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1917' }}>{item.count}</div>
                        <div style={{ fontSize: 10, color: '#A8A29E' }}>{item.pct}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Station performance */}
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 14px' }}>
                    Station performance
                  </h3>
                  {stationData.map((item, i) => (
                    <div key={item.station} className="row-hover" style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 6px', borderRadius: 6,
                      borderBottom: i < stationData.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1917' }}>{item.station}</div>
                        <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 1 }}>{item.incidents} incidents</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: item.avgResponse <= 6 ? '#16A34A' : '#D97706' }}>
                          {item.avgResponse} min
                        </div>
                        <div style={{ fontSize: 10, color: '#A8A29E' }}>avg response</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  )
}