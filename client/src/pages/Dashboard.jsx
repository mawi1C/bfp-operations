import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  FireIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const statusStyle = {
  open:          { label: 'Open',          color: '#2563EB', bg: '#EFF6FF' },
  closed:        { label: 'Closed',        color: '#D97706', bg: '#FFFBEB' },
  investigating: { label: 'Investigating', color: '#DC2626', bg: '#FEF2F2' },
}

const formatMoney = (n) => '₱' + Number(n || 0).toLocaleString()

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/incidents/stats')
      setStats(res.data)
    } catch {
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const monthlyEntries = stats?.monthly
    ? Object.entries(stats.monthly).slice(-6)
    : []
  const maxCount = Math.max(...monthlyEntries.map(([, v]) => v), 1)

  const statCards = [
    { label: 'Total Incidents', value: loading ? '...' : stats?.total ?? 0, sub: `+${stats?.thisMonth ?? 0} this month`, icon: FireIcon, color: '#EA580C', bg: '#FFF1EB' },
    { label: 'Casualties', value: loading ? '...' : (stats?.totalFatalities ?? 0) + (stats?.totalInjuries ?? 0), sub: `${stats?.totalFatalities ?? 0} fatalities · ${stats?.totalInjuries ?? 0} injured`, icon: UserGroupIcon, color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Damage (PHP)', value: loading ? '...' : formatMoney(stats?.totalDamage), sub: 'Estimated total', icon: BuildingOfficeIcon, color: '#D97706', bg: '#FFFBEB' },
    { label: 'Avg Response', value: loading ? '...' : `${stats?.avgResponse ?? 0} min`, sub: 'Across all stations', icon: ClockIcon, color: '#2563EB', bg: '#EFF6FF' },
  ]

  return (
    <Layout>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
          {user?.region} · {new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {statCards.map(card => (
          <div key={card.label} className="stat-card" style={{
            backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
            borderRadius: 12, padding: 16, cursor: 'default',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon style={{ width: 16, height: 16, color: card.color }} />
              </div>
              <span style={{ fontSize: 12, color: '#A8A29E' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 500, color: '#1C1917' }}>{card.value}</div>
            <div style={{ fontSize: 11, color: '#C4BFB9', marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginBottom: 20 }}>

        {/* Monthly chart */}
        <div className="panel-card" style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 16px' }}>
            Incidents by month
          </h2>
          {loading ? (
            <div style={{ fontSize: 12, color: '#A8A29E' }}>Loading...</div>
          ) : monthlyEntries.length === 0 ? (
            <div style={{ fontSize: 12, color: '#A8A29E' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {monthlyEntries.map(([month, count]) => (
                <div key={month} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#A8A29E', width: 60, flexShrink: 0 }}>{month}</span>
                  <div style={{ flex: 1, height: 8, backgroundColor: '#FFF1EB', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: '#EA580C', borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#A8A29E', width: 28, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top causes */}
        <div className="panel-card" style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 16px' }}>
            Top causes of fire
          </h2>
          {loading ? (
            <div style={{ fontSize: 12, color: '#A8A29E' }}>Loading...</div>
          ) : !stats?.topCauses?.length ? (
            <div style={{ fontSize: 12, color: '#A8A29E' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {stats.topCauses.map((item, i) => (
                <div key={item.cause} className="row-hover" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 6px', borderRadius: 6,
                  borderBottom: i < stats.topCauses.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                }}>
                  <span style={{ fontSize: 12, color: '#57534E' }}>{item.cause}</span>
                  <span className="badge-pop" style={{
                    fontSize: 11, fontWeight: 500,
                    padding: '2px 10px', borderRadius: 20,
                    backgroundColor: i < 2 ? '#FEF2F2' : i < 4 ? '#FFFBEB' : '#F5F5F4',
                    color: i < 2 ? '#DC2626' : i < 4 ? '#D97706' : '#78716C',
                  }}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent incidents */}
      <div className="panel-card" style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', margin: '0 0 16px' }}>
          Recent incidents
        </h2>
        {loading ? (
          <div style={{ fontSize: 12, color: '#A8A29E' }}>Loading...</div>
        ) : !stats?.recent?.length ? (
          <div style={{ fontSize: 12, color: '#A8A29E', textAlign: 'center', padding: '20px 0' }}>
            No incidents recorded yet. Upload a file to get started.
          </div>
        ) : (
          stats.recent.map((inc, i) => {
            const st = statusStyle[inc.case_status] || statusStyle.open
            return (
              <div key={inc.id} className="row-hover" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 8px', borderRadius: 8,
                borderBottom: i < stats.recent.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>
                    {inc.barangay ? `${inc.barangay}, ` : ''}{inc.city || 'Unknown location'}
                  </div>
                  <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 2 }}>
                    {inc.structure_type || 'Unknown'} · {inc.cause_of_fire || 'Unknown cause'} · {inc.incident_datetime ? new Date(inc.incident_datetime).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </div>
                </div>
                <span className="badge-pop" style={{
                  fontSize: 11, fontWeight: 500,
                  padding: '3px 10px', borderRadius: 20,
                  backgroundColor: st.bg, color: st.color, flexShrink: 0,
                }}>
                  {st.label}
                </span>
              </div>
            )
          })
        )}
      </div>
    </Layout>
  )
}